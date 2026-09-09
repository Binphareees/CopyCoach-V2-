import type { LocaleCode, Namespace } from "./config";
import en from "./dictionaries/en";

export type DictionaryValues = string | string[] | number | boolean | unknown;
export type Bundle = Record<Namespace, Record<string, unknown>>;

const loaders: Record<LocaleCode, () => Promise<Bundle>> = {
  en: () => Promise.resolve(en),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
  fr: () => import("./dictionaries/fr").then((m) => m.default),
  es: () => import("./dictionaries/es").then((m) => m.default),
};

export async function loadLocaleBundle(lng: LocaleCode): Promise<Bundle> {
  return loaders[lng]();
}

export type Translator = (key: string, vars?: Record<string, unknown>) => string;

function resolveToken(token: string, vars?: Record<string, unknown>): string {
  if (!vars) return token;
  return String(vars[token] ?? token);
}

function interpolate(value: string, vars?: Record<string, unknown>): string {
  if (!vars) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (match, token) => resolveToken(token, vars));
}

export function createTranslator(
  bundle: Bundle,
  fallback?: Bundle,
  defaultNs: Namespace = "common"
): Translator {
  return (key, vars) => {
    let ns = defaultNs;
    let dottedKey = key;
    const nsSep = key.indexOf(":");
    if (nsSep !== -1) {
      ns = key.slice(0, nsSep) as Namespace;
      dottedKey = key.slice(nsSep + 1);
    }
    let value: unknown = bundle[ns]?.[dottedKey];
    if (typeof value !== "string" && fallback) {
      value = fallback[ns]?.[dottedKey];
    }
    if (typeof value !== "string") {
      value = fallback?.[defaultNs]?.[dottedKey];
    }
    if (typeof value !== "string") {
      value = bundle[defaultNs]?.[dottedKey] ?? dottedKey;
    }
    return interpolate(String(value as string), vars);
  };
}