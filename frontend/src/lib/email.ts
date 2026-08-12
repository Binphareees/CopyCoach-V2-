import nodemailer from "nodemailer";

export const DEVELOPER_EMAIL = "slastbornn@gmail.com";

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

export async function sendDeveloperEmailNotification(options: EmailNotificationOptions) {
  const {
    subject,
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

  console.log(`[Developer Email Dispatch to ${DEVELOPER_EMAIL}]`, {
    type,
    subject,
    priority,
    userTier,
    userId,
  });

  // Construct Email HTML Body
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="color: #38bdf8; margin: 0;">CopyCoach AI Developer Alert 🚀</h2>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Priority: <strong style="color: ${priority === "HIGH" ? "#f59e0b" : "#38bdf8"};">${priority}</strong> | Tier: <strong>${userTier.toUpperCase()}</strong></p>
      </div>

      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong>Type:</strong> ${type}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong>Category:</strong> ${category}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong>User ID / Email:</strong> ${userId}</p>
      </div>

      ${
        question
          ? `<div style="margin-bottom: 16px;">
              <h4 style="color: #38bdf8; margin: 0 0 6px 0;">User Question Asked:</h4>
              <p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 14px; white-space: pre-wrap; margin: 0;">${question}</p>
            </div>`
          : ""
      }

      ${
        answer
          ? `<div style="margin-bottom: 16px;">
              <h4 style="color: #a855f7; margin: 0 0 6px 0;">AI Generated Response:</h4>
              <p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 13px; color: #e2e8f0; white-space: pre-wrap; margin: 0;">${answer}</p>
            </div>`
          : ""
      }

      ${
        comment
          ? `<div style="margin-bottom: 16px;">
              <h4 style="color: #f43f5e; margin: 0 0 6px 0;">Report / Feedback Comment:</h4>
              <p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 14px; white-space: pre-wrap; margin: 0;">${comment}</p>
            </div>`
          : ""
      }

      ${
        userCopyInput
          ? `<div style="margin-bottom: 16px;">
              <h4 style="color: #94a3b8; margin: 0 0 6px 0;">Original User Draft Copy:</h4>
              <p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 12px; font-family: monospace; white-space: pre-wrap; margin: 0;">${userCopyInput}</p>
            </div>`
          : ""
      }

      ${
        aiOutputString
          ? `<div style="margin-bottom: 16px;">
              <h4 style="color: #94a3b8; margin: 0 0 6px 0;">AI Critique Output:</h4>
              <p style="background-color: #020617; padding: 12px; border-radius: 6px; font-size: 12px; font-family: monospace; white-space: pre-wrap; margin: 0;">${aiOutputString}</p>
            </div>`
          : ""
      }

      <div style="border-top: 1px solid #334155; padding-top: 12px; font-size: 12px; color: #64748b; text-align: center;">
        Automated Developer Dispatch for CopyCoach AI • Sent to ${DEVELOPER_EMAIL}
      </div>
    </div>
  `;

  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"CopyCoach AI Alerts" <${smtpUser}>`,
        to: DEVELOPER_EMAIL,
        subject: `[CopyCoach AI ${type}] ${subject}`,
        html: htmlContent,
      });

      console.log(`✅ Email notification successfully sent via SMTP to ${DEVELOPER_EMAIL}`);
      return { sent: true, recipient: DEVELOPER_EMAIL };
    } else {
      console.log(`ℹ️ SMTP credentials not configured in environment. Logged report for ${DEVELOPER_EMAIL}`);
      return { sent: false, recipient: DEVELOPER_EMAIL, reason: "SMTP_NOT_CONFIGURED" };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Email sending error";
    console.error(`⚠️ Email dispatch to ${DEVELOPER_EMAIL} encountered error:`, errorMsg);
    return { sent: false, recipient: DEVELOPER_EMAIL, error: errorMsg };
  }
}
