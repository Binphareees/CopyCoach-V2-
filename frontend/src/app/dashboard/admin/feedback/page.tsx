"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import GlassCard from "@/components/dashboard/GlassCard";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatDate } from "@/i18n/format";
import { getAccessToken } from "@/lib/supabase";
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

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

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
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const { locale } = useLanguage();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filterPriority, setFilterPriority] = useState<"ALL" | "HIGH" | "NORMAL">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "open" | "resolved">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    let ignore = false;
    async function checkAdmin() {
      try {
        const res = await fetch("/api/auth/me", {
          headers: await authHeaders(),
        });
        const data = await res.json();
        if (ignore) return;
        if (!data.authenticated || !data.isAdmin) {
          setForbidden(true);
          return;
        }
      } catch (err) {
        console.error("Admin access check failed:", err);
      } finally {
        if (!ignore) setCheckingAccess(false);
      }
    }
    checkAdmin();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (forbidden) {
      router.replace("/dashboard");
    }
  }, [forbidden, router]);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback", {
        headers: await authHeaders(),
      });
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
        const res = await fetch("/api/feedback", {
          headers: await authHeaders(),
        });
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
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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

  if (checkingAccess) {
    return (
      <div className="min-h-screen text-text-primary flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-text-muted">{t("verifyingAdminAccess")}</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen text-text-primary flex flex-col items-center justify-center gap-3">
        <ShieldAlert className="w-10 h-10 text-danger" />
        <p className="text-xs text-text-muted">{t("unauthorizedRedirecting")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-primary flex flex-col font-sans">
      <DashboardTopbar
        title={t("adminFeedbackTitle")}
        right={
          <>
            <span className="hidden rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent sm:inline">
              {t("adminTriagePanel")}
            </span>
            <button
              type="button"
              onClick={fetchFeedback}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-muted"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{t("refresh")}</span>
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{t("returnToDashboard")}</span>
            </Link>
          </>
        }
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DashboardStatCard
            label={t("totalFeedback")}
            icon={<Inbox className="w-5 h-5" />}
            tone="info"
            value={
              <p className="text-3xl font-extrabold text-text-primary">{feedbackList.length}</p>
            }
          />

          <DashboardStatCard
            label={t("highPriorityStat")}
            icon={<ShieldAlert className="w-5 h-5" />}
            tone="warning"
            value={
              <p className="text-3xl font-extrabold text-warning">
                {feedbackList.filter((f) => f.priority === "HIGH").length}
              </p>
            }
          />

          <DashboardStatCard
            label={t("openTickets")}
            icon={<AlertTriangle className="w-5 h-5" />}
            tone="danger"
            value={
              <p className="text-3xl font-extrabold text-danger">
                {feedbackList.filter((f) => f.status === "open").length}
              </p>
            }
          />

          <DashboardStatCard
            label={t("resolved")}
            icon={<CheckCircle2 className="w-5 h-5" />}
            tone="success"
            value={
              <p className="text-3xl font-extrabold text-success">
                {feedbackList.filter((f) => f.status === "resolved").length}
              </p>
            }
          />
        </div>

        {/* FILTERS AND SEARCH BAR */}
        <div className="bg-surface-elevated border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchFeedbackPlaceholder")}
              className="cc-field text-xs rounded-xl ps-9 pe-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-text-muted shrink-0" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as "ALL" | "HIGH" | "NORMAL")}
              className="cc-field text-xs rounded-xl px-3 py-2"
            >
              <option value="ALL">{t("allPriorities")}</option>
              <option value="HIGH">{t("highPriorityOnly")}</option>
              <option value="NORMAL">{t("normalPriority")}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "ALL" | "open" | "resolved")}
              className="cc-field text-xs rounded-xl px-3 py-2"
            >
              <option value="ALL">{t("allStatuses")}</option>
              <option value="open">{t("statusOpen")}</option>
              <option value="resolved">{t("statusResolved")}</option>
            </select>
          </div>
        </div>

        {/* WORKSPACE PANELS: LIST + INSPECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* TICKET LIST PANEL */}
          <GlassCard level="elevated" className="lg:col-span-5 p-4 flex flex-col gap-3 max-h-[650px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted px-1">
              {t("feedbackTickets", { count: filteredItems.length })}
            </h3>

            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-xs">
                {t("noTicketsFound")}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTicket(item)}
                  className={`text-start p-3.5 rounded-xl border transition-all ${
                    selectedTicket?.id === item.id
                      ? "bg-surface border-accent/40 shadow-soft"
                      : "bg-surface/60 border-border hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        item.priority === "HIGH"
                          ? "bg-warning/15 text-warning border-warning/40"
                          : "bg-surface text-text-muted border-border"
                      }`}
                    >
                      {item.priority === "HIGH" ? `⚡ ${t("highPriorityBadge")}` : t("normalBadge")}
                    </span>

                    <span className="text-[10px] text-text-muted">
                      {formatDate(locale, item.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-text-primary line-clamp-1">
                      {item.category}: {item.comment || t("noCommentProvided")}
                    </p>
                    <ChevronRight className="w-4 h-4 text-text-muted shrink-0 rtl:rotate-180" />
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-text-muted">
                    <span className="text-accent uppercase font-medium">
                      {t("tierFormat", { tier: item.user_tier })}
                    </span>
                    <span>•</span>
                    <span className={item.status === "resolved" ? "text-success" : "text-warning"}>
                      {item.status === "resolved" ? t("statusResolved") : t("statusOpen")}
                    </span>
                  </div>
                </button>
              ))
            )}
          </GlassCard>

          {/* TICKET INSPECTOR DETAILS PANEL */}
          <GlassCard level="elevated" className="lg:col-span-7 p-6 flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-5">
                {/* TOP HEADER */}
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          selectedTicket.priority === "HIGH"
                            ? "bg-warning/15 text-warning border-warning/40"
                            : "bg-surface text-text-muted border-border"
                        }`}
                      >
                        {selectedTicket.priority === "HIGH"
                          ? `⚡ ${t("highPriorityBadge")}`
                          : t("normalBadge")}
                      </span>
                      <span className="text-xs text-accent uppercase font-semibold">
                        {t("tierUser", { tier: selectedTicket.user_tier })}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-accent" />
                      <span>{t("ticketTitle", { category: selectedTicket.category })}</span>
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(selectedTicket)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                      selectedTicket.status === "resolved"
                        ? "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20"
                        : "bg-success/10 text-success border-success/30 hover:bg-success/20"
                    }`}
                  >
                    {selectedTicket.status === "resolved" ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t("reopenTicket")}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t("markAsResolved")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* METADATA INFO */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface p-3 rounded-xl border border-border text-xs">
                  <div>
                    <span className="text-text-muted block text-[10px]">{t("userIdLabel")}</span>
                    <span className="font-mono text-text-secondary flex items-center gap-1">
                      <User className="w-3 h-3 text-text-muted" />
                      {selectedTicket.user_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">{t("drillIdLabel")}</span>
                    <span className="font-mono text-text-secondary">
                      {selectedTicket.drill_id || t("generalDrill")}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">{t("statusLabel")}</span>
                    <span
                      className={`font-bold ${
                        selectedTicket.status === "resolved" ? "text-success" : "text-warning"
                      }`}
                    >
                      {selectedTicket.status === "resolved"
                        ? t("statusResolved")
                        : t("statusOpen")}
                    </span>
                  </div>
                </div>

                {/* USER COMMENT */}
                <div>
                  <h4 className="text-xs font-semibold text-text-muted mb-1.5">
                    {t("userFeedbackComment")}
                  </h4>
                  <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-text-secondary leading-relaxed">
                    {selectedTicket.comment || t("noDetailedComment")}
                  </div>
                </div>

                {/* USER COPY INPUT & AI RESPONSE IF ATTACHED */}
                {selectedTicket.user_copy_input && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted mb-1.5">
                      {t("userOriginalCopy")}
                    </h4>
                    <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text-secondary font-mono">
                      {selectedTicket.user_copy_input}
                    </div>
                  </div>
                )}

                {selectedTicket.ai_output_string && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted mb-1.5">
                      {t("aiOutputEvaluated")}
                    </h4>
                    <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text-secondary font-mono line-clamp-4">
                      {selectedTicket.ai_output_string}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
                <Inbox className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">{t("selectTicketHint")}</p>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}