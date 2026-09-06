import { Resend } from "resend";
import nodemailer from "nodemailer";

export const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL || "slastbornn@gmail.com";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export async function sendEmail(
  payload: EmailPayload
): Promise<{ sent: boolean; via: string; error?: string }> {
  // Preferred provider: Resend
  const resend = getResend();
  if (resend) {
    const from =
      payload.from ||
      process.env.RESEND_FROM_EMAIL ||
      "CopyCoach AI <onboarding@resend.dev>";
    try {
      await resend.emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo,
      });
      return { sent: true, via: "resend" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Resend send error";
      console.error("Resend send failed, falling back to SMTP:", message);
    }
  }

  // Fallback provider: SMTP (nodemailer)
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (smtpUser && smtpPass) {
    try {
      const smtpPort = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: `"CopyCoach AI Alerts" <${smtpUser}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo,
      });
      return { sent: true, via: "smtp" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "SMTP send error";
      return { sent: false, via: "smtp", error: message };
    }
  }

  console.warn(
    "[email] No provider configured (RESEND_API_KEY or SMTP_USER/SMTP_PASS). Email not sent."
  );
  return { sent: false, via: "none", error: "EMAIL_NOT_CONFIGURED" };
}

interface EmailNotificationOptions {
  subject: string;
  category: string;
  userTier?: string;
  userId?: string;
  comment?: string;
  question?: string;
  answer?: string;
  userCopyInput?: string | null;
  aiOutputString?: string | null;
  priority?: string;
  type: "BUG_REPORT" | "SUPPORT_QUESTION" | "FEEDBACK";
}

function buildDeveloperEmailHtml(options: EmailNotificationOptions): string {
  const {
    category,
    userTier = "Spark",
    userId = "Anonymous",
    comment,
    question,
    answer,
    userCopyInput,
    aiOutputString,
    priority = "NORMAL",
    type,
  } = options;

  return `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="color: #38bdf8; margin: 0;">CopyCoach AI Developer Alert</h2>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Priority: <strong style="color: ${priority === "HIGH" ? "#f59e0b" : "#38bdf8"};">${priority}</strong> | Tier: <strong>${userTier.toUpperCase()}</strong></p>
      </div>
      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong>Type:</strong> ${type}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong>Category:</strong> ${category}</p>
        <p style="margin: 0; font-size: 14px; color: #cbd5e1;"><strong>User ID / Email:</strong> ${userId}</p>
      </div>
      ${question ? `<div style="margin-bottom: 16px;"><h4 style="color: #38bdf8; margin: 0 0 6px 0;">User Question Asked:</h4><p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 14px; white-space: pre-wrap; margin: 0;">${question}</p></div>` : ""}
      ${answer ? `<div style="margin-bottom: 16px;"><h4 style="color: #a855f7; margin: 0 0 6px 0;">AI Generated Response:</h4><p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 13px; color: #e2e8f0; white-space: pre-wrap; margin: 0;">${answer}</p></div>` : ""}
      ${comment ? `<div style="margin-bottom: 16px;"><h4 style="color: #f43f5e; margin: 0 0 6px 0;">Report / Feedback Comment:</h4><p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 14px; white-space: pre-wrap; margin: 0;">${comment}</p></div>` : ""}
      ${userCopyInput ? `<div style="margin-bottom: 16px;"><h4 style="color: #94a3b8; margin: 0 0 6px 0;">Original User Draft Copy:</h4><p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 12px; font-family: monospace; white-space: pre-wrap; margin: 0;">${userCopyInput}</p></div>` : ""}
      ${aiOutputString ? `<div style="margin-bottom: 16px;"><h4 style="color: #94a3b8; margin: 0 0 6px 0;">AI Critique Output:</h4><p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 12px; font-family: monospace; white-space: pre-wrap; margin: 0;">${aiOutputString}</p></div>` : ""}
      <div style="border-top: 1px solid #334155; padding-top: 12px; font-size: 12px; color: #64748b; text-align: center;">
        Automated Developer Dispatch for CopyCoach AI • Sent to ${DEVELOPER_EMAIL}
      </div>
    </div>
  `;
}

export async function sendDeveloperEmailNotification(
  options: EmailNotificationOptions
): Promise<{ sent: boolean; recipient: string; via?: string; error?: string }> {
  const { subject, type } = options;

  const htmlContent = buildDeveloperEmailHtml(options);
  const result = await sendEmail({
    to: DEVELOPER_EMAIL,
    subject: `[CopyCoach AI ${type}] ${subject}`,
    html: htmlContent,
    replyTo: process.env.SUPPORT_EMAIL || undefined,
  });

  console.log(`[Developer Email Dispatch to ${DEVELOPER_EMAIL}]`, {
    type,
    subject: options.subject,
    priority: options.priority,
    userTier: options.userTier,
    userId: options.userId,
    via: result.via,
    sent: result.sent,
  });

  return {
    sent: result.sent,
    recipient: DEVELOPER_EMAIL,
    ...(result.via ? { via: result.via } : {}),
    ...(result.error ? { error: result.error } : {}),
  };
}