"use client";

import React, { useState } from "react";
import { MessageSquarePlus, X, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface FeedbackModalProps {
  userId?: string;
  userTier?: string;
  triggerClassName?: string;
}

export default function FeedbackModal({
  userId,
  userTier = "Spark",
  triggerClassName = "",
}: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<"Bug" | "Request" | "Complaint" | "General">("Bug");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter a description for your feedback.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          category,
          comment: description,
          userTier,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setDescription("");
        }, 2000);
      } else {
        setError(data.error || "Failed to submit feedback.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all ${triggerClassName}`}
      >
        <MessageSquarePlus className="w-3.5 h-3.5 text-cyan-400" />
        <span>Feedback</span>
      </button>

      {/* MODAL BACKDROP */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Help & Feedback</h3>
                <p className="text-xs text-slate-400">
                  Share bugs, feature requests, or complaints directly with the team.
                </p>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Feedback Submitted!</h4>
                <p className="text-xs text-slate-300">
                  Thank you for helping us make CopyCoach AI better. High-priority items are routed to our engineering queue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* CATEGORY SELECTOR */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Feedback Category
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["Bug", "Request", "Complaint", "General"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${
                          category === cat
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                            : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened, what feature you'd like, or your feedback..."
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* ERROR ALERT */}
                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* USER TIER NOTICE */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Account Tier: <strong className="text-cyan-400 uppercase">{userTier}</strong></span>
                  {(userTier === "Pro" || userTier === "Studio" || userTier === "pro") && (
                    <span className="text-amber-400 font-semibold">⚡ Priority Ticket Routed</span>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Sending Ticket..." : "Submit Feedback"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
