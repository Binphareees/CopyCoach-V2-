import { cookies } from "next/headers";
import { SESSION_ACCESS_COOKIE, SESSION_REFRESH_COOKIE } from "./session-constants";

// Server-only session cookie helpers for the cookie-first auth migration.
// The Supabase session lives in HttpOnly cookies (see middleware.ts) so the
// JWT cannot be read from JavaScript once the client stops persisting it.
// NOTE: httpOnly cookies are invisible to the browser — before the client is
// migrated (Phase 3.2) the app still relies on its localStorage session, so
// these helpers are purely additive.

const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function setSessionCookies(session: SessionTokens): Promise<void> {
  const store = await cookies();
  store.set(SESSION_ACCESS_COOKIE, session.access_token, cookieOptions(ACCESS_MAX_AGE));
  if (session.refresh_token) {
    store.set(SESSION_REFRESH_COOKIE, session.refresh_token, cookieOptions(REFRESH_MAX_AGE));
  }
}

export async function getSessionCookies(): Promise<SessionTokens | null> {
  const store = await cookies();
  const accessToken = store.get(SESSION_ACCESS_COOKIE)?.value;
  const refreshToken = store.get(SESSION_REFRESH_COOKIE)?.value;
  if (!accessToken) return null;
  return { access_token: accessToken, refresh_token: refreshToken ?? "" };
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_ACCESS_COOKIE);
  store.delete(SESSION_REFRESH_COOKIE);
}