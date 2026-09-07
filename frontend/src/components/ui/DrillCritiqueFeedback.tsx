"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Check, Send } from "lucide-react";
import { getAccessToken } from "@/lib/supabase";

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface DrillCritiqueFeedbackProps {
  drillId?: string;
  userCopyInput?: string;
  aiOutputString?: string;
  userTier?: string;
  className?: string;
}

export default function DrillCritiqueFeedback({
  drillId,
  userCopyInput,
  aiOutputString,
  userTier = "Spark",
  className = "",
}: DrillCritiqueFeedbackProps) {
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [customComment, setCustomComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const tags =
    rating === "down"
      ? ["Too Harsh", "Inaccurate Framework", "Generic Suggestion", "Bug"]
      : ["Spot-On Advice", "Great Formatting", "Actionable Tips", "Accurate Framework"];

  const handleRatingClick = async (type: "up" | "down") => {
    setRating(type);
    setShowTagSelector(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
          drillId,
          rating,
          category: selectedTag || (rating === "up" ? "Positive Critique" : "Needs Improvement"),
          comment: customComment,
          userCopyInput,
          aiOutputString,
          userTier,
        }),
      });
      setSubmitted(true);
      setShowTagSelector(false);
    } catch (err) {
      console.error("Error submitting critique feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-lg px-3 py-1.5 ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span>Feedback received! Thank you for training CopyCoach AI.</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span>Was this AI critique helpful?</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleRatingClick("up")}
            className={`p-1.5 rounded-md transition-all ${
              rating === "up"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "hover:bg-surface-muted text-text-muted hover:text-text-primary"
            }`}
            title="Helpful critique"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleRatingClick("down")}
            className={`p-1.5 rounded-md transition-all ${
              rating === "down"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                : "hover:bg-surface-muted text-text-muted hover:text-text-primary"
            }`}
            title="Needs improvement"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showTagSelector && (
        <div className="mt-1 p-3 bg-surface-elevated border border-border rounded-xl space-y-2 animate-fadeIn">
          <p className="text-[11px] font-medium text-text-secondary">
            {rating === "down" ? "What went wrong with this critique?" : "What was most helpful?"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedTag === tag
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-surface border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Additional details (optional)..."
              className="flex-1 text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-[#1e1a3a] to-[#2a2550] hover:from-[#2a2550] hover:to-[#352e60] text-text-primary font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{loading ? "Sending..." : "Submit"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
