import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || !parts[1]) {
    return null;
  }
  return parts[1];
}

// Verifies a Supabase access token server-side. The user identity is ALWAYS
// derived from the verified token, never from request body/header values.
export async function getServerUser(request: Request): Promise<User | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  } catch (err) {
    console.error("getServerUser error:", err);
    return null;
  }
}

export function isAdmin() {
  const emails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return (user: User | null) =>
    Boolean(user?.email && emails.includes(user.email.toLowerCase()));
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim() || "unknown";
  }
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}