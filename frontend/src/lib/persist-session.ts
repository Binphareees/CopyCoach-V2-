// Client-safe helper used after a successful sign-in/sign-up/OAuth callback to
// mirror the Supabase session into the server-side HttpOnly cookie bridge.
// Non-fatal: if this fails, the existing localStorage-based auth still works.

export async function persistSessionToCookies(session: {
  access_token?: string | null;
  refresh_token?: string | null;
} | null): Promise<void> {
  if (!session?.access_token) return;
  try {
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token ?? "",
      }),
    });
  } catch {
    // Intentionally ignored — cookie persistence is an enhancement.
  }
}