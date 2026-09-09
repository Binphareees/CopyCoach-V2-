"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Global Error Boundary for Next.js App Router
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, i18n } = useTranslation("common");

  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang={i18n.language} dir={i18n.dir()}>
      <body className="min-h-screen bg-surface-elevated text-text-primary flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-elevated border border-border rounded-2xl p-8 text-center shadow-2xl backdrop-blur-sm">
          <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("globalErrorTitle")}</h2>
          <p className="text-text-muted text-sm mb-6">
            {t("globalErrorDesc")}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
               className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground font-medium text-sm rounded-xl transition-colors shadow-accent-soft"
            >
              {t("tryAgain")}
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-5 py-2.5 bg-surface hover:bg-surface-muted text-text-secondary font-medium text-sm rounded-xl transition-colors"
            >
              {t("goToHome")}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}