"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  User,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

interface FeedbackItem {
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
}

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<"ALL" | "HIGH" | "NORMAL">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "open" | "resolved">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<FeedbackItem | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      if (data.feedback) {
        setFeedbackList(data.feedback);
        setSelectedTicket((prev) => prev || (data.feedback.length > 0 ? data.feedback[0] : null));
      }
    } catch (err) {
      console.error("Error fetching admin feedback:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/feedback");
        const data = await res.json();
        if (!ignore && data.feedback) {
          setFeedbackList(data.feedback);
          setSelectedTicket((prev) => prev || (data.feedback.length > 0 ? data.feedback[0] : null));
        }
      } catch (err) {
        console.error("Error fetching admin feedback:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const toggleStatus = async (item: FeedbackItem) => {
    const newStatus = item.status === "resolved" ? "open" : "resolved";
    try {
      await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });

      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: newStatus } : f))
      );

      if (selectedTicket?.id === item.id) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredItems = feedbackList.filter((item) => {
    if (filterPriority !== "ALL" && item.priority !== filterPriority) return false;
    if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComment = item.comment?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      const matchUser = item.user_id?.toLowerCase().includes(q);
      if (!matchComment && !matchCat && !matchUser) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo theme="dark" size="sm" showTagline={false} />
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Admin Triage Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchFeedback}
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Feedback</p>
              <p className="text-xl font-bold text-white">{feedbackList.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">High Priority (Pro/Studio)</p>
              <p className="text-xl font-bold text-amber-400">
                {feedbackList.filter((f) => f.priority === "HIGH").length}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Open Tickets</p>
              <p className="text-xl font-bold text-rose-400">
                {feedbackList.filter((f) => f.status === "open").length}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Resolved</p>
              <p className="text-xl font-bold text-emerald-400">
                {feedbackList.filter((f) => f.status === "resolved").length}
              </p>
            </div>
          </div>
        </div>

        {/* FILTERS AND SEARCH BAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback comments, categories, or user IDs..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as "ALL" | "HIGH" | "NORMAL")}
              className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">⚡ High Priority Only</option>
              <option value="NORMAL">Normal Priority</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "ALL" | "open" | "resolved")}
              className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="open">Open Tickets</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* WORKSPACE PANELS: LIST + INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* TICKET LIST PANEL */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 max-h-[650px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Feedback Tickets ({filteredItems.length})
            </h3>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No feedback tickets found matching criteria.
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTicket(item)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    selectedTicket?.id === item.id
                      ? "bg-slate-800 border-cyan-500/50 shadow-lg"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        item.priority === "HIGH"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {item.priority === "HIGH" ? "⚡ High Priority" : "Normal"}
                    </span>

                    <span className="text-[10px] text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white line-clamp-1">
                      {item.category}: {item.comment || "No comment provided"}
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <span className="text-cyan-400 uppercase font-medium">{item.user_tier} Tier</span>
                    <span>•</span>
                    <span className={item.status === "resolved" ? "text-emerald-400" : "text-amber-400"}>
                      {item.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* TICKET INSPECTOR DETAILS PANEL */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-5">
                {/* TOP HEADER */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          selectedTicket.priority === "HIGH"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {selectedTicket.priority} Priority
                      </span>
                      <span className="text-xs text-cyan-400 uppercase font-semibold">
                        {selectedTicket.user_tier} Tier User
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                      <span>{selectedTicket.category} Ticket</span>
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(selectedTicket)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                      selectedTicket.status === "resolved"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                    }`}
                  >
                    {selectedTicket.status === "resolved" ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Reopen Ticket</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Resolved</span>
                      </>
                    )}
                  </button>
                </div>

                {/* METADATA INFO */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">USER ID</span>
                    <span className="font-mono text-slate-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {selectedTicket.user_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">DRILL ID</span>
                    <span className="font-mono text-slate-300">
                      {selectedTicket.drill_id || "General"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">STATUS</span>
                    <span
                      className={`font-bold ${
                        selectedTicket.status === "resolved" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {selectedTicket.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* USER COMMENT */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-1.5">User Feedback Comment</h4>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    {selectedTicket.comment || "No detailed comment provided."}
                  </div>
                </div>

                {/* USER COPY INPUT & AI RESPONSE IF ATTACHED */}
                {selectedTicket.user_copy_input && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-1.5">User Original Copy</h4>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                      {selectedTicket.user_copy_input}
                    </div>
                  </div>
                )}

                {selectedTicket.ai_output_string && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 mb-1.5">AI Output Evaluated</h4>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-200 font-mono line-clamp-4">
                      {selectedTicket.ai_output_string}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Inbox className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">Select a feedback ticket on the left to view details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
