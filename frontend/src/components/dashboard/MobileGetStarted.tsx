"use client";

import React, { useState } from "react";
import { Sparkles, X, FileText, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileGetStartedProps {
  canUpgrade?: boolean;
  onNewCopy: () => void;
  onLibrary: () => void;
  onUpgrade?: () => void;
}

export default function MobileGetStarted({
  canUpgrade = false,
  onNewCopy,
  onLibrary,
  onUpgrade,
}: MobileGetStartedProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation("dashboard");

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
      <div className="animate-pop glass-popover p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            <Sparkles className="h-3.5 w-3.5 text-accent-bright" />
            {t("getStarted")}
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-md p-1 text-brand-300 transition-colors hover:bg-surface-muted hover:text-text-primary"
            aria-label={t("dismissGettingStarted")}
            title={t("dismiss")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewCopy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            {t("newCopy")}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          {canUpgrade && onUpgrade ? (
            <button
              type="button"
              onClick={onUpgrade}
              className="flex-1 rounded-lg border border-glass-border bg-glass-bg-elevated px-3 py-2 text-xs font-semibold text-brand-100 transition-colors hover:bg-glass-bg-hover"
            >
              {t("upgradeToPro")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onLibrary}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-glass-border bg-glass-bg-elevated px-3 py-2 text-xs font-semibold text-brand-100 transition-colors hover:bg-glass-bg-hover"
            >
              <FileText className="h-3.5 w-3.5" />
              {t("copyLibrary")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}