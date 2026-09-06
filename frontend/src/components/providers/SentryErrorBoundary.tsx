"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

function Fallback({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : undefined;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-ink-950 px-6 text-center">
      <div className="text-3xl">⚠️</div>
      <h1 className="text-lg font-bold text-brand-100">Something went wrong</h1>
      <p className="max-w-sm text-sm text-brand-100/60">
        An unexpected error occurred. Please refresh the page to continue.
      </p>
      {message && (
        <p className="max-w-sm text-xs text-rose-400/80">{message}</p>
      )}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent-bright transition-colors hover:bg-accent/20"
      >
        Reload page
      </button>
    </div>
  );
}

export default function SentryErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;
    Sentry.init({
      dsn,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
      environment: process.env.NODE_ENV || "production",
    });
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={({ error }) => <Fallback error={error} />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}