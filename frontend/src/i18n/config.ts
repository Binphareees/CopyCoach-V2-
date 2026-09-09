export type Direction = "ltr" | "rtl";

export interface LocaleInfo {
  code: string;
  label: string;
  nativeName: string;
  dir: Direction;
  intl: string;
}

export const localeConfig = {
  en: { code: "en", label: "English", nativeName: "English", dir: "ltr", intl: "en-US" },
  ar: { code: "ar", label: "Arabic", nativeName: "العربية", dir: "rtl", intl: "ar-SA" },
  fr: { code: "fr", label: "French", nativeName: "Français", dir: "ltr", intl: "fr-FR" },
  es: { code: "es", label: "Spanish", nativeName: "Español", dir: "ltr", intl: "es-ES" },
} as const satisfies Record<string, LocaleInfo>;

export type LocaleCode = keyof typeof localeConfig;

export const DEFAULT_LOCALE: LocaleCode = "en";
export const SUPPORTED_LOCALE_CODES: LocaleCode[] = Object.keys(localeConfig) as LocaleCode[];
export const SUPPORTED_LOCALES = SUPPORTED_LOCALE_CODES.map((code) => localeConfig[code]);

export const LOCALE_KEY = "copycoach_language";

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === "string" && value in localeConfig;
}

export function getLocaleInfo(code: LocaleCode): LocaleInfo {
  return localeConfig[code];
}

export function getIntlLocale(code: LocaleCode): string {
  return localeConfig[code].intl;
}

export const namespaces = ["common", "landing", "auth", "dashboard", "profile", "legal"] as const;
export type Namespace = (typeof namespaces)[number];
export const DEFAULT_NAMESPACE: Namespace = "common";