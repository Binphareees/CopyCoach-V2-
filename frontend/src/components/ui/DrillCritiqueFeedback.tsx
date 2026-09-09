"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("common");
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [customComment, setCustomComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const tags: { value: string; label: string }[] =
    rating === "down"
      ? [
          { value: "Too Harsh", label: t("tagTooHarsh") },
          { value: "Inaccurate Framework", label: t("tagInaccurateFramework") },
          { value: "Generic Suggestion", label: t("tagGenericSuggestion") },
          { value: "Bug", label: t("tagBug") },
        ]
      : [
          { value: "Spot-On Advice", label: t("tagSpotOn") },
          { value: "Great Formatting", label: t("tagGreatFormatting") },
          { value: "Actionable Tips", label: t("tagActionableTips") },
          { value: "Accurate Framework", label: t("tagAccurateFramework") },
        ];

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
      <div className={`flex items-center gap-2 text-xs text-success bg-success/15 border border-success/30 rounded-lg px-3 py-1.5 ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span>{t("feedbackReceived")}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span>{t("wasCritiqueHelpful")}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleRatingClick("up")}
            className={`p-1.5 rounded-md transition-all ${
              rating === "up"
                ? "bg-success/20 text-success border border-success/40"
                : "hover:bg-surface-muted text-text-muted hover:text-text-primary"
            }`}
            title={t("helpfulCritique")}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleRatingClick("down")}
            className={`p-1.5 rounded-md transition-all ${
              rating === "down"
                ? "bg-danger/20 text-danger border border-danger/40"
                : "hover:bg-surface-muted text-text-muted hover:text-text-primary"
            }`}
            title={t("needsImprovement")}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showTagSelector && (
        <div className="mt-1 p-3 bg-surface-elevated border border-border rounded-xl space-y-2 animate-fade-up">
          <p className="text-[11px] font-medium text-text-secondary">
            {rating === "down" ? t("whatWentWrong") : t("whatWasMostHelpful")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => setSelectedTag(tag.value)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedTag === tag.value
                    ? "bg-accent/20 border-accent-bright text-accent-bright"
                    : "bg-surface border-border text-text-muted hover:text-text-primary"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder={t("additionalDetails")}
              className="cc-field flex-1 text-xs rounded-lg px-2.5 py-1.5"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{loading ? t("sending") : t("submit")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}