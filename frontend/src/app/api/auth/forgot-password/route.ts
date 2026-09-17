import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getClientIdentifier } from "@/lib/auth-server";
import { getRateLimiter } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const requestLimiter = getRateLimiter(10, 3600);

const emailCooldowns = new Map<string, number>();
const EMAIL_COOLDOWN_MS = 60_000;

// Password recovery links are generated via the Supabase admin API and
// delivered through the app's email provider (Resend). This intentionally
// bypasses GoTrue's SMTP path, which returns a 500 "Error sending recovery
// email" when delivery to the recipient's provider fails.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const ip = getClientIdentifier(request);
    const rate = await requestLimiter(ip);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many reset requests from this location. Please try again later." },
        { status: 429 }
      );
    }

    const normalized = email.toLowerCase();

    // Per-email cooldown so repeated submits don't spam the mailbox.
    const lastSent = emailCooldowns.get(normalized);
    if (lastSent && Date.now() - lastSent < EMAIL_COOLDOWN_MS) {
      return NextResponse.json({ success: true, sent: false });
    }

    const siteOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://copycoachai.online";

    // Ask GoTrue (as admin) to mint a fresh recovery OTP.
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: `${siteOrigin}/auth/callback` },
      });

    const hashedToken = linkData?.properties?.hashed_token;

    if (linkError || !hashedToken) {
      // Masked success: never reveal whether an account exists.
      return NextResponse.json({ success: true, sent: false });
    }

    // The GoTrue action_link carries an implicit `#access_token` fragment,
    // which the PKCE Supabase client rejects. Send the user to our callback
    // with the token_hash instead so verifyOtp can exchange it for a session.
    const recoveryUrl = `${siteOrigin}/auth/callback?token_hash=${encodeURIComponent(
      hashedToken
    )}&type=recovery`;

    emailCooldowns.set(normalized, Date.now());

    const mailResult = await sendEmail({
      to: email,
      from: "CopyCoach AI <no-reply@copycoachai.online>",
      subject: "Reset your password",
      html: `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #171717;">
  <h2 style="margin: 0 0 16px; color: #171717;">Reset your CopyCoach AI password</h2>
  <p style="margin: 0 0 16px; color: #404040; line-height: 1.6;">
    We received a request to reset the password for your account. If this was you, use the button below to choose a new password.
  </p>
  <p style="margin: 0 0 24px;">
    <a href="${recoveryUrl}" style="display: inline-block; background: #21f1a8; color: #0a0a0a; text-decoration: none; font-weight: 600; padding: 12px 20px; border-radius: 8px;">
      Reset password
    </a>
  </p>
  <p style="margin: 0; color: #737373; font-size: 13px; line-height: 1.5;">
    If the button above doesn't work, copy and paste this link into your browser:<br />
    <a href="${recoveryUrl}" style="color: #166534;">${recoveryUrl}</a>
  </p>
  <p style="margin: 16px 0 0; color: #737373; font-size: 13px; line-height: 1.5;">
    If you didn't request this, you can safely ignore this email. The link expires within 24 hours.
  </p>
</div>`,
    });

    if (!mailResult.sent) {
      console.error("Recovery email dispatch failed:", mailResult.error);
    }

    return NextResponse.json({ success: true, sent: mailResult.sent });
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}