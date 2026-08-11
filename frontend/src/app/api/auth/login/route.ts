import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Check if user exists and auto-confirm email if unconfirmed
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (!error && users) {
      const existingUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (existingUser && !existingUser.email_confirmed_at) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Login helper route error:", err);
    return NextResponse.json({ success: true });
  }
}
