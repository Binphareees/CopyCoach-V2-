import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendDeveloperEmailNotification, DEVELOPER_EMAIL } from "@/lib/email";
import { getServerUser, getClientIdentifier, isAdmin } from "@/lib/auth-server";
import { getRateLimiter } from "@/lib/rate-limit";

// In-memory store for dev/testing if Supabase table is absent
const localFeedbackStore: Array<{
  id: string;
  user_id: string;
  drill_id: string | null;
  category: string;
  comment: string;
  rating: string | null;
  user_copy_input: string | null;
  ai_output_string: string | null;
  user_tier: string;
  priority: string;
  status: string;
  created_at: string;
}> = [];

const feedbackSubmitLimiter = getRateLimiter(10, 60);
const feedbackAdminLimiter = getRateLimiter(60, 60);

const MAX_FIELD_LENGTH = 3000;
const VALID_TIERS = new Set(["spark", "apprentice", "pro", "studio"]);
const VALID_RATINGS = new Set(["up", "down", null]);

// POST: Submit feedback & dispatch email to developer
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIdentifier(req);
    const rate = await feedbackSubmitLimiter(ip);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      drillId,
      category,
      comment,
      rating,
      userCopyInput,
      aiOutputString,
      userTier = "Spark",
    } = body;

    if (!category && !rating && !comment) {
      return NextResponse.json(
        { error: "Category, rating, or comment is required" },
        { status: 400 }
      );
    }
    if (typeof comment !== "string") {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }
    if (comment.length > MAX_FIELD_LENGTH) {
      return NextResponse.json(
        { error: `Comment too long. Max ${MAX_FIELD_LENGTH} characters.` },
        { status: 400 }
      );
    }
    if (!VALID_RATINGS.has(rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const safeTier = VALID_TIERS.has(String(userTier).toLowerCase())
      ? String(userTier).toLowerCase()
      : "spark";

    // Identity is always derived from a verified token, never from the body.
    const user = await getServerUser(req);
    const userId = user?.id || "anonymous";

    const isHighPriority =
      (safeTier === "pro" || safeTier === "studio") &&
      (category === "Bug" || category === "Complaint" || rating === "down");

    const feedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      drill_id: drillId ? String(drillId).slice(0, 120) : null,
      category: String(category || (rating === "up" ? "Praise" : "Critique Flag")).slice(0, 120),
      comment: comment.slice(0, MAX_FIELD_LENGTH),
      rating: rating || null,
      user_copy_input: userCopyInput ? String(userCopyInput).slice(0, MAX_FIELD_LENGTH) : null,
      ai_output_string: aiOutputString ? String(aiOutputString).slice(0, MAX_FIELD_LENGTH) : null,
      user_tier: safeTier,
      priority: isHighPriority ? "HIGH" : "NORMAL",
      status: "open",
      created_at: new Date().toISOString(),
    };

    localFeedbackStore.unshift(feedbackEntry);

    const { error } = await supabaseAdmin.from("feedback").insert(feedbackEntry);
    if (error) {
      console.warn("Supabase feedback insert warning:", error.message);
    }

    // DISPATCH DEVELOPER EMAIL NOTIFICATION
    await sendDeveloperEmailNotification({
      type: "BUG_REPORT",
      subject: `${feedbackEntry.category} Report from User (${feedbackEntry.user_id})`,
      category: feedbackEntry.category,
      userTier: feedbackEntry.user_tier,
      userId: feedbackEntry.user_id,
      comment: feedbackEntry.comment,
      userCopyInput: feedbackEntry.user_copy_input,
      aiOutputString: feedbackEntry.ai_output_string,
      priority: feedbackEntry.priority,
    });

    // Optional Admin Webhook Forwarding (Slack / Discord / Zapier)
    const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *[CopyCoach AI ${feedbackEntry.priority} Feedback]*\n*Tier:* ${feedbackEntry.user_tier}\n*Category:* ${feedbackEntry.category}\n*Comment:* ${feedbackEntry.comment}\n*User:* ${feedbackEntry.user_id}\n*Sent to:* ${DEVELOPER_EMAIL}`,
          }),
        });
      } catch (e) {
        console.warn("Webhook dispatch failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Feedback & Bug Report submitted! Dispatched to developer email (${DEVELOPER_EMAIL}).`,
      feedbackId: feedbackEntry.id,
      priority: feedbackEntry.priority,
      developerEmailSentTo: DEVELOPER_EMAIL,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET: Retrieve feedback list for Admin Triage (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user || !isAdmin()(user)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const adminRate = await feedbackAdminLimiter(user.id);
    if (!adminRate.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const { data, error } = await supabaseAdmin
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return NextResponse.json({ feedback: data });
    }

    if (error) {
      console.warn("Feedback admin fetch warning:", error.message);
    }

    return NextResponse.json({ feedback: localFeedbackStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Update ticket status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user || !isAdmin()(user)) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }
    if (status !== "open" && status !== "resolved") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update in local store
    const item = localFeedbackStore.find((f) => f.id === id);
    if (item) {
      item.status = status;
    }

    const { error } = await supabaseAdmin
      .from("feedback")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.warn("Feedback status update warning:", error.message);
    }

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}