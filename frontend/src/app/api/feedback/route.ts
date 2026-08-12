import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    if (!category && !rating) {
      return NextResponse.json(
        { error: "Category or rating is required" },
        { status: 400 }
      );
    }

    // Determine priority based on tier and feedback type
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

    // Store in Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { error } = await supabaseAdmin.from("feedback").insert(feedbackEntry);
      if (error) {
        console.warn("Supabase feedback insert notice (table might need creation):", error.message);
      }
    }

    console.log(`[CopyCoach AI Feedback] Priority: ${feedbackEntry.priority}`, feedbackEntry);

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully! Thank you for helping improve CopyCoach AI.",
      feedbackId: feedbackEntry.id,
      priority: feedbackEntry.priority,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Feedback submission error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to process feedback submission" },
      { status: 500 }
    );
  }
}
