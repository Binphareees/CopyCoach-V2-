import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SESSION_ACCESS_COOKIE, SESSION_REFRESH_COOKIE } from "@/lib/session-constants";

// Cookie-first auth middleware (Phase 3.1).
//
// Runs only when an HttpOnly session cookie is present. It re-validates the
// access token (or refreshes via the refresh token), rotates the cookies, and
// injects the fresh `Authorization: Bearer` header so existing API routes keep
// working unchanged. When no cookie exists it passes through untouched — the
// current localStorage-based auth continues to operate exactly as before.
//
// Fail-open: any error here must never block a request.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function placeholder(value?: string): boolean {
  return !value || value.includes("placeholder") || value.includes("your-project");
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

export async function middleware(request: NextRequest) {
  if (placeholder(SUPABASE_URL) || placeholder(SUPABASE_ANON_KEY)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(SESSION_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(SESSION_REFRESH_COOKIE)?.value;
  if (!accessToken && !refreshToken) {
    return NextResponse.next();
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    let session: { access_token: string; refresh_token: string } | null = null;

    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data.user) {
        session = { access_token: accessToken, refresh_token: refreshToken ?? "" };
      }
    }

    // Access token stale/absent: use the refresh token to mint a fresh pair.
    if (!session && refreshToken) {
      const { data } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (data.session) {
        session = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token ?? refreshToken,
        };
      }
    }

    if (!session) {
      // Cookie session is dead — clear it and continue (fail-open).
      const response = NextResponse.next();
      response.cookies.delete(SESSION_ACCESS_COOKIE);
      response.cookies.delete(SESSION_REFRESH_COOKIE);
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Authorization", `Bearer ${session.access_token}`);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set(SESSION_ACCESS_COOKIE, session.access_token, cookieOptions(60 * 15));
    if (session.refresh_token !== refreshToken) {
      response.cookies.set(SESSION_REFRESH_COOKIE, session.refresh_token, cookieOptions(60 * 60 * 24 * 30));
    }

    return response;
  } catch (err) {
    console.error("[middleware] session handling failed (passing through):", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};