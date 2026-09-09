"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Route Segment Error Boundary for Next.js App Router
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation("common");

  useEffect(() => {
    console.error("App error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-text-primary">
      <div className="max-w-md w-full bg-surface-elevated border border-border rounded-2xl p-8 text-center shadow-xl">
        <div className="w-12 h-12 bg-danger/10 text-danger rounded-xl flex items-center justify-center mx-auto mb-4 border border-danger/20">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("errorOccurred")}</h2>
        <p className="text-text-muted text-sm mb-6">
          {error.message || t("errorRenderFailed")}
        </p>
        <button
          onClick={() => reset()}
           className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground font-medium text-sm rounded-xl transition-colors shadow-accent-soft"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}