"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { applyLocale, detectLocale } from "@/i18n/client";
import { DEFAULT_LOCALE, getLocaleInfo, LOCALE_KEY, type LocaleCode } from "@/i18n/config";

interface LanguageContextValue {
  locale: LocaleCode;
  dir: "ltr" | "rtl";
  setLocale: (code: LocaleCode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  dir: "ltr",
  setLocale: async () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    let cancelled = false;

    const detected = detectLocale();
    (async () => {
      if (detected !== DEFAULT_LOCALE) {
        await applyLocale(detected);
      }
      if (cancelled) return;
      setLocaleState(detected);
      const info = getLocaleInfo(detected);
      setDir(info.dir);
      document.documentElement.lang = detected;
      document.documentElement.dir = info.dir;
      try {
        window.localStorage.setItem(LOCALE_KEY, detected);
      } catch {
        /* ignore storage errors */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (code: LocaleCode) => {
    await applyLocale(code);
    setLocaleState(code);
    const info = getLocaleInfo(code);
    setDir(info.dir);
    document.documentElement.lang = code;
    document.documentElement.dir = info.dir;
    try {
      window.localStorage.setItem(LOCALE_KEY, code);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LanguageContext.Provider>
  );
}