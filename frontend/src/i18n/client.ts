import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./dictionaries/en";
import type { Namespace, LocaleCode } from "./config";
import { DEFAULT_LOCALE, DEFAULT_NAMESPACE, LOCALE_KEY, SUPPORTED_LOCALE_CODES } from "./config";
import { loadLocaleBundle } from "./translate";

const NAMESPACES = Object.keys(en) as Namespace[];

i18n.use(initReactI18next).use(LanguageDetector).init({
  resources: { en },
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALE_CODES,
  ns: NAMESPACES,
  defaultNS: DEFAULT_NAMESPACE,
  load: "currentOnly",
  nonExplicitSupportedLngs: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  initAsync: false,
detection: {
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      lookupLocalStorage: LOCALE_KEY,
      lookupCookie: LOCALE_KEY,
      cookieMinutes: 525600,
      cookieOptions: { sameSite: "lax", path: "/" },
      caches: ["localStorage", "cookie"],
    },
  missingKeyHandler: (lngs, ns, key) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] missing translation key "${ns}:${key}" for "${lngs.join(", ")}"`);
    }
  },
});

async function ensureBundleLoaded(lng: LocaleCode): Promise<void> {
  if (i18n.hasResourceBundle(lng, "common")) return;
  const bundle = await loadLocaleBundle(lng);
  NAMESPACES.forEach((ns) => {
    i18n.addResourceBundle(lng, ns, bundle[ns] as Record<string, unknown>, true, true);
  });
}

export async function applyLocale(lng: LocaleCode): Promise<void> {
  await ensureBundleLoaded(lng);
  await i18n.changeLanguage(lng);
}

export function detectLocale(): LocaleCode {
  const detected = i18n.language || i18n.resolvedLanguage;
  const candidates: string[] = [];
  if (detected) candidates.push(String(detected).split("-")[0]);
  if (typeof navigator !== "undefined") candidates.push(...navigator.languages.map((l) => l.split("-")[0]));
  for (const candidate of candidates) {
    if ((SUPPORTED_LOCALE_CODES as string[]).includes(candidate)) {
      return candidate as LocaleCode;
    }
  }
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(LOCALE_KEY);
    if (stored && (SUPPORTED_LOCALE_CODES as string[]).includes(stored)) {
      return stored as LocaleCode;
    }
  }
  return DEFAULT_LOCALE;
}

export { DEFAULT_LOCALE, LOCALE_KEY };

export function isLocaleActive(code: LocaleCode): boolean {
  return (i18n.language || DEFAULT_LOCALE) === code;
}