"use client";

import React, { useRef, useState, useEffect } from "react";
import { Globe, Check, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, getLocaleInfo, type LocaleCode } from "@/i18n/config";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface LanguageSwitcherProps {
  compact?: boolean;
  direction?: "up" | "down";
}

export default function LanguageSwitcher({
  compact = false,
  direction = "down",
}: LanguageSwitcherProps) {
  const { t } = useTranslation("common");
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const current = getLocaleInfo(locale);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("languageSelector")}
        title={t("language")}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-elevated hover:text-text-primary"
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-accent-bright" />
        {!compact && <span className="min-w-0 flex-1 text-start truncate">{current.nativeName}</span>}
        {!compact &&
          (open ? (
            <ChevronUp className="h-3 w-3 shrink-0 text-text-muted" />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0 text-text-muted" />
          ))}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute end-0 z-50 min-w-[13rem] max-h-[min(22rem,calc(100vh-6rem))] overflow-y-auto glass-popover p-1.5 text-text-primary animate-pop ${
              direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {t("language")}
            </p>
            {SUPPORTED_LOCALES.map((entry) => (
              <button
                key={entry.code}
                type="button"
                onClick={() => {
                  setLocale(entry.code as LocaleCode);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-start text-[13px] transition-colors ${
                  locale === entry.code
                    ? "bg-accent/12 font-semibold text-accent-bright"
                    : "font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{entry.nativeName}</span>
                  <span className="block text-[11px] text-text-muted">{entry.label}</span>
                </span>
                {locale === entry.code && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}