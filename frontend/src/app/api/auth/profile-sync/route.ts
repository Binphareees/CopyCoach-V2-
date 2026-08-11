import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { userId, email, fullName, avatarUrl } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "UserId and email are required." },
        { status: 400 }
      );
    }

    // 1. Upsert profile
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName || "",
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile sync error:", profileError.message);
    }

    // 2. Ensure user_usage
    const now = new Date().toISOString();
    const { error: usageError } = await supabaseAdmin.from("user_usage").upsert(
      {
        user_id: userId,
        plan: "free",
        daily_generations_used: 0,
        monthly_generations_used: 0,
        daily_reset_date: now,
        monthly_reset_date: now,
        subscription_status: "active",
      },
      { onConflict: "user_id" }
    );

    if (usageError) {
      console.error("User usage sync error:", usageError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
