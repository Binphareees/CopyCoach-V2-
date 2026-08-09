import { createClient, SupabaseClient } from "@supabase/supabase-js";

let currentUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

let currentKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export function checkIsConfigured(url: string, key: string) {
  return (
    Boolean(url) &&
    !url.includes("placeholder.supabase.co") &&
    Boolean(key) &&
    !key.includes("placeholder-anon-key")
  );
}

export let isSupabaseConfigured = checkIsConfigured(currentUrl, currentKey);

let clientInstance: SupabaseClient = createClient(currentUrl, currentKey);
let configFetched = false;
let configFetchPromise: Promise<SupabaseClient> | null = null;

export async function ensureSupabaseConfig(): Promise<SupabaseClient> {
  if (checkIsConfigured(currentUrl, currentKey)) {
    isSupabaseConfigured = true;
    return clientInstance;
  }

  if (typeof window === "undefined") {
    // Server side environment
    const serverUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const serverKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
    if (checkIsConfigured(serverUrl, serverKey)) {
      currentUrl = serverUrl;
      currentKey = serverKey;
      isSupabaseConfigured = true;
      clientInstance = createClient(currentUrl, currentKey);
    }
    return clientInstance;
  }

  if (configFetched) {
    return clientInstance;
  }

  if (!configFetchPromise) {
    configFetchPromise = (async () => {
      try {
        const res = await fetch("/api/supabase-config");
        if (res.ok) {
          const data = await res.json();
          if (data.isConfigured && data.url && data.key) {
            currentUrl = data.url;
            currentKey = data.key;
            isSupabaseConfigured = true;
            clientInstance = createClient(currentUrl, currentKey);
          }
        }
      } catch (e) {
        console.error("Failed to fetch runtime Supabase config:", e);
      } finally {
        configFetched = true;
      }
      return clientInstance;
    })();
  }

  return configFetchPromise;
}

export function getActiveSupabaseUrl() {
  return currentUrl;
}

export function getActiveSupabaseKey() {
  return currentKey;
}

export { currentUrl as supabaseUrl, currentKey as supabaseAnonKey };

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (typeof window !== "undefined" && !checkIsConfigured(currentUrl, currentKey) && !configFetched) {
      ensureSupabaseConfig();
    }
    const instance = clientInstance;
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

