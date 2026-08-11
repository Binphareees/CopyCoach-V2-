import { createClient, SupabaseClient } from "@supabase/supabase-js";

let currentUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://placeholder.supabase.co";

let currentKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "placeholder-anon-key";

export function isPlaceholderUrl(url: string = currentUrl): boolean {
  return !url || url.includes("placeholder.supabase.co");
}

export function checkIsConfigured(
  url: string = currentUrl,
  key: string = currentKey
) {
  return (
    Boolean(url) &&
    !isPlaceholderUrl(url) &&
    Boolean(key) &&
    !key.includes("placeholder-anon-key")
  );
}

export function getIsSupabaseConfigured() {
  return checkIsConfigured(currentUrl, currentKey);
}

let clientInstance: SupabaseClient = createClient(currentUrl, currentKey);
let configFetched = false;
let configFetchPromise: Promise<SupabaseClient> | null = null;

export async function ensureSupabaseConfig(): Promise<SupabaseClient> {
  if (checkIsConfigured(currentUrl, currentKey)) {
    return clientInstance;
  }

  if (typeof window === "undefined") {
    // Server side environment
    const serverUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";
    const serverKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "";
    if (checkIsConfigured(serverUrl, serverKey)) {
      currentUrl = serverUrl;
      currentKey = serverKey;
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

// Auto-trigger config fetch immediately on client side import
if (typeof window !== "undefined") {
  ensureSupabaseConfig();
}

export function getActiveSupabaseUrl() {
  return currentUrl;
}

export function getActiveSupabaseKey() {
  return currentKey;
}

export { currentUrl as supabaseUrl, currentKey as supabaseAnonKey };

type UnknownFn = (...args: unknown[]) => unknown;
type UnknownRecord = Record<string, unknown>;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const propName = String(prop);

    const getFreshClient = () => clientInstance as unknown as UnknownRecord;
    const initialVal = getFreshClient()[propName];

    if (typeof initialVal === "function") {
      return (...args: unknown[]) => {
        if (!checkIsConfigured(currentUrl, currentKey) && configFetchPromise) {
          return configFetchPromise.then((client: SupabaseClient) => {
            const clientRec = client as unknown as Record<string, UnknownFn>;
            return clientRec[propName](...args);
          });
        }
        const currentClient = getFreshClient();
        const fn = currentClient[propName] as UnknownFn;
        return fn.apply(currentClient, args);
      };
    }

    if (initialVal && typeof initialVal === "object") {
      return new Proxy({} as UnknownRecord, {
        get(_subTarget, subProp: string | symbol) {
          const subPropName = String(subProp);
          const currentParentObj = getFreshClient()[propName] as UnknownRecord;
          const subVal = currentParentObj ? currentParentObj[subPropName] : undefined;

          if (typeof subVal === "function") {
            return (...args: unknown[]) => {
              if (!checkIsConfigured(currentUrl, currentKey) && configFetchPromise) {
                return configFetchPromise.then((client: SupabaseClient) => {
                  const clientRec = client as unknown as Record<string, Record<string, UnknownFn>>;
                  const targetObj = clientRec[propName];
                  return targetObj ? targetObj[subPropName](...args) : undefined;
                });
              }
              const latestParentObj = getFreshClient()[propName] as UnknownRecord;
              const latestFn = latestParentObj ? (latestParentObj[subPropName] as UnknownFn) : undefined;
              if (typeof latestFn === "function") {
                return latestFn.apply(latestParentObj, args);
              }
              return undefined;
            };
          }
          return subVal;
        },
      });
    }

    return getFreshClient()[propName];
  },
});



