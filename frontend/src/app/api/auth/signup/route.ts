import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Password Complexity Validation: At least 6 chars, 1 uppercase, 1 special character
    const hasMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasMinLength || !hasUppercase || !hasSpecialChar) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long, contain at least 1 uppercase letter (A-Z), and at least 1 special character (e.g. !@#$).",
        },
        { status: 400 }
      );
    }

    // 1. Create user with admin privileges and auto-confirm email
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name || "",
        },
      });

    if (createError) {
      // If user already exists, let client know
      if (
        createError.message.includes("already registered") ||
        createError.message.includes("already been registered") ||
        createError.status === 422
      ) {
        return NextResponse.json(
          { error: "User already exists with this email address. Please log in instead." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const user = userData.user;
    if (user) {
      // 2. Ensure profile entry exists
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: user.id,
        full_name: name || "",
        email: user.email,
        avatar_url: null,
      });

      if (profileError) {
        console.error("Profile creation warning:", profileError.message);
      }

      // 3. Ensure user usage entry exists
      const now = new Date().toISOString();
      await supabaseAdmin.from("user_usage").upsert(
        {
          user_id: user.id,
          plan: "free",
          daily_generations_used: 0,
          monthly_generations_used: 0,
          daily_reset_date: now,
          monthly_reset_date: now,
          subscription_status: "active",
        },
        { onConflict: "user_id" }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData.user,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
