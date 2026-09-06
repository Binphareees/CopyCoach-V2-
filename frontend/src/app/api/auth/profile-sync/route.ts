import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getServerUser } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    // Identity is ALWAYS derived from the verified access token. Any userId
    // supplied in the request body is ignored to prevent profile overwrites.
    const user = await getServerUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;
    const email = user.email;
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      "";
    const avatarUrl =
      (user.user_metadata?.avatar_url as string | undefined) ||
      (user.user_metadata?.picture as string | undefined) ||
      null;

    // 1. Upsert profile
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile sync error:", profileError.message);
    }

    // 2. Ensure user_usage ONLY if record does NOT exist yet!
    const { data: existingUsage } = await supabaseAdmin
      .from("user_usage")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingUsage) {
      const now = new Date().toISOString();
      const { error: usageError } = await supabaseAdmin.from("user_usage").insert({
        user_id: userId,
        plan: "free",
        daily_generations_used: 0,
        monthly_generations_used: 0,
        daily_reset_date: now,
        monthly_reset_date: now,
        subscription_status: "active",
      });

      if (usageError) {
        console.error("User usage sync error:", usageError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}