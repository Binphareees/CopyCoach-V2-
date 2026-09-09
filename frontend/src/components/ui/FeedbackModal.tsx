"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, X, Send, CheckCircle2, AlertCircle, Bot, LifeBuoy, ArrowRight, Mail } from "lucide-react";
import { getAccessToken } from "@/lib/supabase";

interface FeedbackModalProps {
  userId?: string;
  userTier?: string;
  triggerClassName?: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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
        headers: await authHeaders(),
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
        headers: await authHeaders(),
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
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-accent/30 bg-accent/15 text-accent hover:bg-accent/20 hover:border-accent-bright transition-all cursor-pointer shadow-sm ${triggerClassName}`}
      >
        <LifeBuoy className="w-3.5 h-3.5 text-accent" />
        <span>Help & Support</span>
      </button>

      {/* MODAL OVERLAY BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-modal-surface border border-border rounded-3xl p-6 shadow-2xl text-text-primary flex flex-col max-h-[90vh] cursor-default animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-muted transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-center gap-3.5 mb-5 pr-8">
              <div className="p-2.5 rounded-2xl bg-accent/15 border border-accent/25 text-accent shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">CopyCoach AI Support & Feedback</h3>
                <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-accent" />
                  <span>Target Developer: <strong className="text-accent-bright">slastbornn@gmail.com</strong></span>
                </p>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl border border-border mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("ai-support")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === "ai-support"
                    ? "bg-accent/15 border border-accent/40 text-accent shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-accent" />
                <span>AI Support Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ticket")}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeTab === "ticket"
                    ? "bg-accent/15 border border-accent/40 text-accent shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-accent" />
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
                    className="cc-field flex-1 text-xs rounded-xl px-3.5 py-2.5"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !supportQuestion.trim()}
                    className="bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {aiLoading ? "Thinking..." : "Ask AI"}
                  </button>
                </form>

                {/* AI Q&A HISTORY STREAM */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px]">
                  {aiAnswers.map((item, idx) => (
                    <div key={idx} className="bg-surface/80 border border-border rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-accent font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-accent" />
                          <span>Q: {item.q}</span>
                        </span>
                        <span className="text-[10px] text-text-muted">{item.time}</span>
                      </div>
                      <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 flex items-center justify-between text-[11px] text-text-muted border-t border-border/80">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-accent" />
                    <span>Dispatched to slastbornn@gmail.com</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ticket")}
                    className="text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
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
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto animate-bounce" />
                    <h4 className="text-base font-bold text-text-primary">Ticket & Bug Report Submitted!</h4>
                    <p className="text-xs text-text-secondary">
                      Your report has been logged and queued for developer dispatch to <strong>slastbornn@gmail.com</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    {/* CATEGORY SELECTOR */}
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
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
                                ? "bg-accent/15 border-accent text-accent font-bold"
                                : "bg-surface border-border text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Issue / Bug / Feedback Description
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what happened, error messages, or feature requests..."
                        className="w-full cc-field text-xs rounded-xl p-3"
                      />
                    </div>

                    {/* ERROR ALERT */}
                    {error && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* USER TIER & EMAIL DISPATCH INFO */}
                    <div className="bg-surface p-2.5 rounded-xl border border-border/80 flex items-center justify-between text-[11px] text-text-muted">
                      <span>Tier: <strong className="text-accent uppercase">{userTier}</strong></span>
                      <span className="text-accent font-semibold flex items-center gap-1">
                        <Mail className="w-3 h-3 text-accent" />
                        <span>Target: slastbornn@gmail.com</span>
                      </span>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={ticketLoading}
                       className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 cursor-pointer"
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
