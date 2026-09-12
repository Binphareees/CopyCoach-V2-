import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Strongest practical Content-Security-Policy compatible with the app.
// Server-only AI calls (Gemini/Groq) are made from API routes and are NOT
// affected by CSP, so their hosts are deliberately omitted from connect-src.
// `'unsafe-inline'` is required for Next.js bootstrap inline scripts/styles;
// `'unsafe-eval'` only in development (React devtools). If a custom Supabase
// domain is ever configured, add it to connect-src/img-src here.
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (isDev ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://us.i.posthog.com https://eu.i.posthog.com https://app.posthog.com https://*.sentry.io",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;