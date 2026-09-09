import { cache } from "react";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  getLocaleInfo,
  isLocaleCode,
  LOCALE_KEY,
  type LocaleCode,
  type Namespace,
} from "./config";
import { loadLocaleBundle, createTranslator, type Bundle, type Translator } from "./translate";
import en from "./dictionaries/en";

export interface ServerLocale {
  lng: LocaleCode;
  dir: "ltr" | "rtl";
}

export const getServerLocale: () => Promise<ServerLocale> = cache(async () => {
  const store = await cookies();
  const raw = store.get(LOCALE_KEY)?.value;
  const lng = raw && isLocaleCode(raw) ? raw : DEFAULT_LOCALE;
  return { lng, dir: getLocaleInfo(lng).dir };
});

export const getServerT: (
  ns?: Namespace
) => Promise<{ t: Translator; lng: LocaleCode }> = cache(async (ns: Namespace = "common") => {
  const { lng } = await getServerLocale();
  const bundle: Bundle = lng === DEFAULT_LOCALE ? en : await loadLocaleBundle(lng);
  return { t: createTranslator(bundle, en, ns), lng };
});