import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  setSessionCookies,
  getSessionCookies,
  clearSessionCookies,
} from "@/lib/session-cookie";

// Session cookie bridge (Phase 3.1).
//
// POST   — persist a session to HttpOnly cookies. Tokens are verified against
//          Supabase before being stored so forged/cross-site sessions can't be
//          planted (login-CSRF protection).
// GET    — return the cookie session to the browser for in-memory use by the
//          Supabase client (used after Phase 3.2 when localStorage is off).
// DELETE — clear session cookies on sign-out.

export async function POST(req: Request) {
  try {
    let body: { access_token?: unknown; refresh_token?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const accessToken = typeof body.access_token === "string" ? body.access_token : "";
    const refreshToken = typeof body.refresh_token === "string" ? body.refresh_token : "";

    if (!accessToken || accessToken.length > 8192) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await setSessionCookies({ access_token: accessToken, refresh_token: refreshToken });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/session] POST failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSessionCookies();
  if (!session) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }
  return NextResponse.json(session);
}

export async function DELETE() {
  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}