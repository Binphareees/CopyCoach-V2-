import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  }
  return null;
}

// POST: Submit feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
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

    const isHighPriority =
      (userTier === "Pro" || userTier === "Studio" || userTier === "pro") &&
      (category === "Bug" || category === "Complaint" || rating === "down");

    const feedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId || "anonymous",
      drill_id: drillId || null,
      category: category || (rating === "up" ? "Praise" : "Critique Flag"),
      comment: comment || "",
      rating: rating || null,
      user_copy_input: userCopyInput || null,
      ai_output_string: aiOutputString || null,
      user_tier: userTier,
      priority: isHighPriority ? "HIGH" : "NORMAL",
      status: "open",
      created_at: new Date().toISOString(),
    };

    localFeedbackStore.unshift(feedbackEntry);

    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("feedback").insert(feedbackEntry);
      if (error) {
        console.warn("Supabase feedback insert warning:", error.message);
      }
    }

    // Optional Admin Webhook Forwarding (Slack / Discord / Zapier)
    const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *[CopyCoach AI ${feedbackEntry.priority} Feedback]*\n*Tier:* ${feedbackEntry.user_tier}\n*Category:* ${feedbackEntry.category}\n*Comment:* ${feedbackEntry.comment}\n*User:* ${feedbackEntry.user_id}`,
          }),
        });
      } catch (e) {
        console.warn("Webhook dispatch failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully!",
      feedbackId: feedbackEntry.id,
      priority: feedbackEntry.priority,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET: Retrieve feedback list for Admin Triage
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ feedback: data });
      }
    }

    return NextResponse.json({ feedback: localFeedbackStore });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Update ticket status
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    // Update in local store
    const item = localFeedbackStore.find((f) => f.id === id);
    if (item) {
      item.status = status;
    }

    // Update in Supabase if connected
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      await supabaseAdmin.from("feedback").update({ status }).eq("id", id);
    }

    return NextResponse.json({ success: true, id, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
