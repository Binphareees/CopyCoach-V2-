"use client";

import React from "react";
import clsx from "clsx";
import { Star, Copy, Download, Trash2, Check, FileText, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatDate } from "@/i18n/format";

interface LibraryCardProps {
  copyType?: string;
  tone?: string;
  improvedText: string;
  originalText?: string;
  favorite: boolean;
  copied?: boolean;
  createdAt?: string;
  onCopy: () => void;
  onFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export default function LibraryCard({
  copyType = "Copy",
  tone = "Default",
  improvedText,
  originalText,
  favorite,
  copied,
  createdAt,
  onCopy,
  onFavorite,
  onDownload,
  onDelete,
}: LibraryCardProps) {
  const { t } = useTranslation("dashboard");
  const { locale } = useLanguage();
  const showTone = tone && tone !== "Default";

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface transition-colors hover:border-border-strong">
      <div className="flex flex-col gap-3 p-4 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              <FileText className="h-3 w-3" />
              {copyType}
            </span>
            {showTone && <span className="text-[11px] text-text-muted">{t("tonePrefix", { tone })}</span>}
          </div>

          {createdAt && (
            <time
              dateTime={createdAt}
              className="inline-flex items-center gap-1 text-[11px] text-text-muted"
            >
              <Clock className="h-3 w-3" />
              {formatDate(locale, createdAt, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
        </div>

        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-text-secondary line-clamp-3">
          {improvedText}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <span className="min-w-0 truncate text-[11px] text-text-muted">
          {originalText
            ? t("originalPrefix", { text: originalText })
            : t("generatedCopy")}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onCopy}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
              copied
                ? "border-success/30 bg-success/10 text-success"
                : "border-border bg-surface-muted text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
            )}
            title={copied ? t("copiedToClipboard") : t("copyText")}
            aria-label={copied ? t("copyTextAriaCopied") : t("copyText")}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? t("copied") : t("copy")}</span>
          </button>

          <button
            onClick={onFavorite}
            aria-pressed={favorite}
            title={favorite ? t("removeFromFavorites") : t("starFavorite")}
            aria-label={favorite ? t("removeFromFavorites") : t("starFavorite")}
            className={clsx(
              "rounded-lg p-1.5 transition-colors",
              favorite
                ? "text-warning hover:text-warning/80"
                : "text-text-muted hover:bg-surface-muted hover:text-text-primary"
            )}
          >
            <Star className={`h-3.5 w-3.5 ${favorite ? "fill-warning" : ""}`} />
          </button>

          <button
            onClick={onDownload}
            title={t("downloadText")}
            aria-label={t("downloadText")}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onDelete}
            title={t("delete")}
            aria-label={t("deleteEntry")}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}