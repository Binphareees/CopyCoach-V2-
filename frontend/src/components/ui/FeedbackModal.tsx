"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, X, Send, CheckCircle2, AlertCircle, Bot, LifeBuoy, ArrowRight, Mail } from "lucide-react";

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

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
          userId: userId || "User",
          userTier,
        }),
      });

      const data = await res.json();
      const answer = data.answer || "Sorry, I could not process your question right now. You can submit a ticket to our engineering support team below.";

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
          a: "Network connection issue. Your ticket will be dispatched to developer support (slastbornn@gmail.com).",
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
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all cursor-pointer shadow-sm ${triggerClassName}`}
      >
        <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
        <span>Help & Support</span>
      </button>

      {/* MODAL OVERLAY BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3.5 mb-5 pr-8">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CopyCoach AI Support & Feedback</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-cyan-400" />
                  <span>Target Developer: <strong className="text-cyan-300">slastbornn@gmail.com</strong></span>
                </p>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("ai-support")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
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
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
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
                    className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !supportQuestion.trim()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {aiLoading ? "Thinking..." : "Ask AI"}
                  </button>
                </form>

                {/* AI Q&A HISTORY STREAM */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px]">
                  {aiAnswers.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
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

                <div className="pt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    <span>Dispatched to slastbornn@gmail.com</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ticket")}
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>File a Bug Report</span>
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
                    <h4 className="text-base font-bold text-white">Ticket & Bug Report Submitted!</h4>
                    <p className="text-xs text-slate-300">
                      Your report has been logged and queued for developer dispatch to <strong>slastbornn@gmail.com</strong>.
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
                            className={`text-xs py-2 px-2 rounded-xl border font-medium transition-all cursor-pointer ${
                              category === cat
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
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
                        Issue / Bug / Feedback Description
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
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* USER TIER & EMAIL DISPATCH INFO */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Tier: <strong className="text-cyan-400 uppercase">{userTier}</strong></span>
                      <span className="text-cyan-300 font-semibold flex items-center gap-1">
                        <Mail className="w-3 h-3 text-cyan-400" />
                        <span>Target: slastbornn@gmail.com</span>
                      </span>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={ticketLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{ticketLoading ? "Dispatching Ticket..." : "Submit Bug / Support Ticket"}</span>
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
