export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dsn = process.env.SENTRY_DSN;
    if (dsn) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.init({
        dsn,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 0,
      });
    }
  }
}