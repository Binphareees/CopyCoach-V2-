"use client";

import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { GradientButton } from "../ui/gradient-button";
import {
  Smartphone,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Shield,
  Sparkles,
  BookOpen,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  Users,
} from "lucide-react";

export default function AppInfoAndSupport() {
  const { t } = useTranslation("landing");

  // Support Form State
  const [supportCategory, setSupportCategory] = useState("Copywriting Advice");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Accordion FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const supportCategories = [
    { value: "Copywriting Advice", label: t("appCatCopywriting") },
    { value: "Mobile App Support", label: t("appCatMobile") },
    { value: "Account & Billing", label: t("appCatBilling") },
    { value: "Feature Request", label: t("appCatFeature") },
    { value: "Bug Report", label: t("appCatBug") },
  ];

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setIsSubmitting(true);
    setAiAnswer(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `[${supportCategory}] ${supportSubject ? supportSubject + ": " : ""}${supportMessage}`,
          userEmail: supportEmail || "Guest User",
          userTier: "Spark",
        }),
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setAiAnswer(data.answer);
      }
      setSupportSuccess(true);
      setSupportSubject("");
      setSupportMessage("");
    } catch (err) {
      console.error("Support submission failed", err);
      setSupportSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportFaqs = [
    {
      q: t("appFaqQ1"),
      a: t("appFaqA1"),
    },
    {
      q: t("appFaqQ2"),
      a: t("appFaqA2"),
    },
    {
      q: t("appFaqQ3"),
      a: t("appFaqA3"),
    },
    {
      q: t("appFaqQ4"),
      a: t("appFaqA4"),
    },
  ];

  return (
    <section className="relative py-20 border-t border-border text-text-primary">
      <div className="mx-auto max-w-7xl px-6 space-y-24">

        {/* ============================================================ */}
        {/* SECTION 1: ABOUT COPYCOACH AI (APP EXPLANATION TEXT) */}
        {/* ============================================================ */}
        <div id="about-app" className="scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>{t("appAboutBadge")}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight leading-tight">
              {t("appAboutTitle")} <span className="text-accent">{t("appAboutTitleAccent")}</span>
            </h2>
            <p className="mt-4 text-text-secondary text-base sm:text-lg leading-relaxed">
              {t("appAboutDesc")}
            </p>
          </div>

          {/* DETAILED APP DESCRIPTION GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative Box */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="flex items-center gap-3 text-accent font-bold text-sm">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>{t("appCoachEngine")}</span>
              </div>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                <Trans
                  ns="landing"
                  i18nKey="appCoachEngineDesc"
                  components={{ strong: <strong className="text-text-primary" /> }}
                />
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <Target className="w-4 h-4 text-accent" />
                    <span>{t("appScoreTitle")}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    {t("appScoreDesc")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <FileText className="w-4 h-4 text-accent" />
                    <span>{t("appRedPenTitle")}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    {t("appRedPenDesc")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span>{t("appFrameworksTitle")}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    {t("appFrameworksDesc")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <Users className="w-4 h-4 text-accent" />
                    <span>{t("appBriefTitle")}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    {t("appBriefDesc")}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
                <span className="flex items-center gap-1 text-success font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {t("appBuiltFor")}
                </span>
                <span>{t("appPracticeAcross")}</span>
              </div>
            </div>

            {/* Right Framework Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-surface border border-border transition-colors hover:border-border-strong">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-secondary text-xs">AIDA</span>
                  <span>{t("appAidaTitle")}</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t("appAidaDesc")}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border transition-colors hover:border-border-strong">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-secondary text-xs">PAS</span>
                  <span>{t("appPasTitle")}</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t("appPasDesc")}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border transition-colors hover:border-border-strong">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-secondary text-xs">BAB & FAB</span>
                  <span>{t("appBabFabTitle")}</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t("appBabFabDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: MOBILE APP — COMING SOON WAITLIST */}
        {/* ============================================================ */}
        <div id="mobile-app" className="scroll-mt-28 rounded-3xl border border-border bg-surface p-8 sm:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              <Smartphone className="w-4 h-4 text-accent" />
              <span>{t("appMobileBadge")}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Mobile app coming soon — join the waitlist
            </h3>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="w-full sm:flex-1 px-5 py-4 rounded-2xl bg-surface-elevated border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <GradientButton type="submit" className="w-full sm:w-auto">
                Join the waitlist
              </GradientButton>
            </form>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: HELP & SUPPORT CENTER */}
        {/* ============================================================ */}
        <div id="support" className="scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span>{t("appSupportHub")}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
              {t("appSupportTitle")}
            </h2>

            <p className="mt-3 text-text-secondary text-base leading-relaxed">
              {t("appSupportDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT: INTERACTIVE SUPPORT FORM */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-bold text-text-primary">{t("appSupportFormTitle")}</h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border text-text-muted text-[11px] font-medium">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span>{t("appSupport247")}</span>
                </div>
              </div>

              {supportSuccess ? (
                <div className="bg-surface-elevated border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-success font-bold text-sm">
                    <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                    <span>{t("appTicketReceived")}</span>
                  </div>

                  {aiAnswer && (
                    <div className="bg-surface border border-border rounded-xl p-4 text-xs text-text-secondary leading-relaxed space-y-2">
                      <p className="font-bold text-accent flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> {t("appInstantAnswer")}
                      </p>
                      <div className="whitespace-pre-line text-text-primary">{aiAnswer}</div>
                    </div>
                  )}

                  <p className="text-xs text-text-muted leading-relaxed">
                    {t("appTicketReceivedDesc")}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSupportSuccess(false);
                      setAiAnswer(null);
                    }}
                    className="mt-2 text-xs font-bold text-accent hover:underline cursor-pointer"
                  >
                    {t("appSubmitAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        {t("appFormCategory")}
                      </label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className="cc-field text-xs rounded-xl px-3.5 py-2.5 cursor-pointer"
                      >
                        {supportCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        {t("appFormEmail")}
                      </label>
                      <input
                        type="email"
                        placeholder={t("appEmailPlaceholder")}
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="cc-field text-xs rounded-xl px-3.5 py-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      {t("appFormSubject")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("appFormSubjectPlaceholder")}
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="cc-field text-xs rounded-xl px-3.5 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      {t("appFormMessage")}
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder={t("appFormMessagePlaceholder")}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="cc-field text-xs rounded-xl p-3.5 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-text-muted">
                      {t("appFormNote")}
                    </span>

                    <GradientButton
                      type="submit"
                      disabled={isSubmitting || !supportMessage.trim()}
                    >
                      {isSubmitting ? (
                        <span>{t("appProcessing")}</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{t("appSubmitTicket")}</span>
                        </>
                      )}
                    </GradientButton>
                  </div>
                </form>
              )}
            </div>

            {/* RIGHT: ACCORDION FAQ SUPPORT GUIDES */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-accent" />
                <span>{t("appSupportFaqTitle")}</span>
              </h3>

              <div className="space-y-3">
                {supportFaqs.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-surface border border-border rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-start flex items-center justify-between gap-3 text-xs font-bold text-text-primary hover:text-text-primary cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-text-muted leading-relaxed border-t border-border bg-surface-elevated">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* DIRECT HELP CONTACT CARD */}
              <div className="p-5 rounded-2xl bg-surface border border-border mt-6 text-xs text-text-secondary space-y-2">
                <p className="font-bold text-text-primary flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-accent" /> {t("appPriorityAssistance")}
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {t("appPriorityDesc")}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}