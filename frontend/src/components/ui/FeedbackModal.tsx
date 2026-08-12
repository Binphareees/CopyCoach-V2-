"use client";

import React, { useState } from "react";
import { MessageSquarePlus, X, Send, CheckCircle2, AlertCircle, Bot, LifeBuoy, ArrowRight } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"ai-support" | "ticket">("ai-support");

  // AI Support State
  const [supportQuestion, setSupportQuestion] = useState("");
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string; time: string }>>([
    {
      q: "How do I start my first copywriting drill?",
      a: "Simply navigate to your Dashboard, paste your draft copy or select a copy type (e.g. Sales Email, Landing Page Headline), choose a desired tone, and click 'Improve & Evaluate Copy'. You'll get instant AI scoring, framework analysis, and line-by-line feedback!",
      time: "Just now",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Ticket Feedback State
  const [category, setCategory] = useState<"Bug" | "Request" | "Complaint" | "General">("Bug");
  const [description, setDescription] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAskAiSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportQuestion.trim()) return;

    const qText = supportQuestion.trim();
    setSupportQuestion("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: qText,
          userTier,
        }),
      });

      const data = await res.json();
      const answer = data.answer || "Sorry, I could not process your question right now. Please submit a support ticket below.";

      setAiAnswers((prev) => [
        {
          q: qText,
          a: answer,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
    } catch {
      setAiAnswers((prev) => [
        {
          q: qText,
          a: "Network connection issue. You can submit a ticket to our engineering support team.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter a description for your feedback.");
      return;
    }

    setTicketLoading(true);
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
        }, 2200);
      } else {
        setError(data.error || "Failed to submit feedback.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setTicketLoading(false);
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
        <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
        <span>Help & Support</span>
      </button>

      {/* MODAL BACKDROP */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CopyCoach AI Support & Feedback</h3>
                <p className="text-xs text-slate-400">
                  Instant AI answers + direct admin triage support.
                </p>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("ai-support")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                  activeTab === "ai-support"
                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Support Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ticket")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                  activeTab === "ticket"
                    ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Submit Ticket</span>
              </button>
            </div>

            {/* TAB 1: AI SUPPORT ASSISTANT */}
            {activeTab === "ai-support" && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3">
                <form onSubmit={handleAskAiSupport} className="flex gap-2">
                  <input
                    type="text"
                    value={supportQuestion}
                    onChange={(e) => setSupportQuestion(e.target.value)}
                    placeholder="Ask anything about copywriting, drills, or pricing..."
                    className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !supportQuestion.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1"
                  >
                    {aiLoading ? "Thinking..." : "Ask AI"}
                  </button>
                </form>

                {/* AI Q&A HISTORY STREAM */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
                  {aiAnswers.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-cyan-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Q: {item.q}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">{item.time}</span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                  <span>Need human engineering support?</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ticket")}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>File a Bug or Ticket</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SUBMIT TICKET / FEEDBACK */}
            {activeTab === "ticket" && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3">
                {success ? (
                  <div className="py-8 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="text-base font-bold text-white">Ticket Submitted!</h4>
                    <p className="text-xs text-slate-300">
                      Your feedback has been logged in our administrative triage database. High-priority items are routed directly to our on-call team.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    {/* CATEGORY SELECTOR */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Ticket Category
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
                        Issue / Feedback Description
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what happened, error messages, or feature requests..."
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
                        <span className="text-amber-400 font-semibold">⚡ Priority High Routing Active</span>
                      )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={ticketLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-lg disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{ticketLoading ? "Routing Ticket..." : "Submit Support Ticket"}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
