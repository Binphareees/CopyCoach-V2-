import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getClientIdentifier } from "@/lib/auth-server";
import { getRateLimiter } from "@/lib/rate-limit";
import { trackServerEvent } from "@/lib/analytics";
import { sendEmail } from "@/lib/email";

const signupLimiter = getRateLimiter(5, 3600);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    if (typeof name === "string" && name.length > 120) {
      return NextResponse.json({ error: "Name is too long." }, { status: 400 });
    }

    const ip = getClientIdentifier(request);
    const rate = await signupLimiter(ip);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many sign-up attempts from this location. Please try again later." },
        { status: 429 }
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

    // 1. Create user. When email verification is required
    //    (AUTO_CONFIRM_EMAILS=false), the account starts unconfirmed and the
    //    confirmation email is dispatched below; otherwise the account is
    //    auto-confirmed to preserve the existing onboarding flow.
    const requireVerification = process.env.AUTO_CONFIRM_EMAILS === "false";
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: !requireVerification,
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
      const { data: existingUsage } = await supabaseAdmin
        .from("user_usage")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingUsage) {
        const now = new Date().toISOString();
        await supabaseAdmin.from("user_usage").insert({
          user_id: user.id,
          plan: "free",
          daily_generations_used: 0,
          monthly_generations_used: 0,
          daily_reset_date: now,
          monthly_reset_date: now,
          subscription_status: "active",
        });
      }

      await trackServerEvent(user.id, "signup_completed", { channel: "email" });

      // 4. Send the confirmation email when email verification is required.
      //    GoTrue does not auto-send confirmation mail for admin-created users,
      //    so the confirmation link is generated here and delivered through the
      //    app's email provider.
      if (requireVerification) {
        const siteOrigin =
          process.env.NEXT_PUBLIC_APP_URL || "https://copycoachai.online";
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: "signup",
            email,
            password,
            options: { redirectTo: `${siteOrigin}/auth/callback` },
          });
        const hashedToken = linkData?.properties?.hashed_token;
        // The GoTrue action_link redirects with an implicit `#access_token`,
        // which the PKCE Supabase client rejects. Instead send users to our
        // callback with the token_hash so the client can call verifyOtp.
        const confirmUrl = hashedToken
          ? `${siteOrigin}/auth/callback?token_hash=${encodeURIComponent(
              hashedToken
            )}&type=signup`
          : null;
        if (!linkError && confirmUrl) {
          const mailResult = await sendEmail({
            to: email,
            subject: "Confirm your email address",
            html: `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #171717;">
  <h2 style="margin: 0 0 16px; color: #171717;">Confirm your CopyCoach AI email</h2>
  <p style="margin: 0 0 16px; color: #404040; line-height: 1.6;">
    Welcome! Please confirm your email address to finish setting up your account.
  </p>
  <p style="margin: 0 0 24px;">
    <a href="${confirmUrl}" style="display: inline-block; background: #21f1a8; color: #0a0a0a; text-decoration: none; font-weight: 600; padding: 12px 20px; border-radius: 8px;">
      Confirm email address
    </a>
  </p>
  <p style="margin: 0; color: #737373; font-size: 13px; line-height: 1.5;">
    If the button above doesn't work, copy and paste this link into your browser:<br />
    <a href="${confirmUrl}" style="color: #166534;">${confirmUrl}</a>
  </p>
</div>`,
          });
          if (!mailResult.sent) {
            console.error("Confirm email dispatch failed:", mailResult.error);
          }
        } else {
          console.error(
            "Confirmation link generation failed:",
            linkError?.message
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: userData.user,
    });
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}