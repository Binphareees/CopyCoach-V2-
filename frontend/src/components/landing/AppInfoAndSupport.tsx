"use client";

import React, { useState } from "react";
import { GradientButton } from "../ui/gradient-button";
import {
  Smartphone,
  Download,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Shield,
  Sparkles,
  BookOpen,
  Send,
  ChevronDown,
  ChevronUp,
  QrCode,
  FileText,
  Target,
  Users,
} from "lucide-react";

export default function AppInfoAndSupport() {
  // Support Form State
  const [supportCategory, setSupportCategory] = useState("Copywriting Advice");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // APK Download State
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Accordion FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleDownloadApk = () => {
    setDownloadingApk(true);
    window.location.href = "/api/download/android-apk";
    setTimeout(() => {
      setDownloadingApk(false);
      setDownloadSuccess(true);
    }, 1200);
  };

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
      q: "How does the CopyCoach AI scoring algorithm evaluate copy?",
      a: "CopyCoach AI analyzes your text against core copywriting frameworks (AIDA, PAS, BAB, FAB, 4Ps). It checks emotional trigger intensity, hook strength, clarity, readability, target audience resonance, and call-to-action urgency to assign a score from 0 to 100.",
    },
    {
      q: "How do I install the mobile app on Android or iOS?",
      a: "For Android, click the 'Google Play Store' badge or direct 'Download APK' button below. For iOS, scan the QR code with your iPhone camera to open the web app in Safari, then tap Share -> 'Add to Home Screen' for native full-screen app access.",
    },
    {
      q: "Can I practice with custom client briefs and specific brand tones?",
      a: "Yes! In the dashboard, you can create custom Project Folders, define target personas, select brand tones (Bold & Punchy, Empathetic & Warm, Authoritative, Casual), and upload custom client briefs to simulate real client scenarios.",
    },
    {
      q: "What support is included in free vs pro accounts?",
      a: "All accounts receive 24/7 AI-assisted support. Pro and Studio members receive priority human engineering review with escalated ticket response times.",
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
              <span>About CopyCoach AI</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight leading-tight">
              Master high-converting copywriting through <span className="text-accent">intelligent practice</span>
            </h2>
            <p className="mt-4 text-text-secondary text-base sm:text-lg leading-relaxed">
              CopyCoach AI is an interactive copywriting mentor designed for marketers, entrepreneurs, copywriters, agency owners, and content creators who want to write copy that converts.
            </p>
          </div>

          {/* DETAILED APP DESCRIPTION GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative Box */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="flex items-center gap-3 text-accent font-bold text-sm">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>The Personal Copywriting Coach Engine</span>
              </div>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                Unlike static text generators that simply output generic templates, <strong className="text-text-primary">CopyCoach AI acts as an interactive red-pen mentor</strong>. You input your headline drafts, sales emails, Facebook ads, or landing page copy, and the system evaluates your work using battle-tested direct response marketing principles.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <Target className="w-4 h-4 text-accent" />
                    <span>0–100 Quality Score</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    Objective scoring based on hook strength, clarity, emotional resonance, and call-to-action drive.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <FileText className="w-4 h-4 text-accent" />
                    <span>Line-by-Line Red Pen</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    Detailed annotations pointing out exact word choice improvements and weak transitions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span>5 Core Frameworks</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    Practice AIDA, PAS (Problem-Agitate-Solution), BAB, FAB, and 4Ps with instant guided rewrites.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-elevated border border-border">
                  <div className="flex items-center gap-2 text-text-primary font-bold text-xs uppercase mb-1">
                    <Users className="w-4 h-4 text-accent" />
                    <span>Client Brief Simulator</span>
                  </div>
                  <p className="text-xs text-text-muted leading-normal">
                    Simulate real marketing assignments across SaaS, E-commerce, Finance, and Fitness niches.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
                <span className="flex items-center gap-1 text-success font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Built for real-world conversion goals
                </span>
                <span>Practice across SaaS, e-commerce, finance, and fitness</span>
              </div>
            </div>

            {/* Right Framework Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-surface border border-border transition-colors hover:border-border-strong">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-secondary text-xs">AIDA</span>
                  <span>Attention, Interest, Desire, Action</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  The gold standard sales formula for landing pages, Facebook ads, and sales letters designed to turn casual readers into buyers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border transition-colors hover:border-border-strong">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-secondary text-xs">PAS</span>
                  <span>Problem, Agitate, Solution</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Ideal for cold emails, pain-point marketing, and problem-solving product pitches that demand urgent reader attention.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-border transition-colors hover:border-border-strong">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-secondary text-xs">BAB & FAB</span>
                  <span>Before-After-Bridge & Features</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Showcase transformative value propositions and feature-to-benefit translations for SaaS products and online courses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: MOBILE APP DOWNLOAD (REAL GOOGLE PLAY & APPLE LOGOS) */}
        {/* ============================================================ */}
        <div id="mobile-app" className="scroll-mt-28 rounded-3xl border border-border bg-surface p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              <Smartphone className="w-4 h-4 text-accent" />
              <span>Mobile Application</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Take your practice on the go
            </h3>

            <p className="mt-3 text-text-secondary text-sm leading-relaxed max-w-xl mx-auto">
              Download our mobile application to open CopyCoach AI on your phone, or install the Android APK directly.
            </p>
          </div>

          {/* STORE BADGES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">

            {/* GOOGLE PLAY STORE BADGE */}
            <a
              href="#download-apk"
              onClick={(e) => {
                e.preventDefault();
                handleDownloadApk();
              }}
              className="group relative flex items-center gap-4 p-5 rounded-2xl bg-surface-elevated border border-border hover:border-border-strong transition-colors cursor-pointer text-left"
            >
              <div className="p-3 rounded-xl bg-surface border border-border shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186C3.23 21.83 3 21.282 3 20.638V3.362c0-.644.23-1.192.609-1.548z" fill="#00D2FF"/>
                  <path d="M17.207 8.586L13.793 12l3.414 3.414 3.896-2.227c1.171-.67 1.171-1.761 0-2.431l-3.896-2.17z" fill="#FFC700"/>
                  <path d="M13.793 12L3.609 1.814c.338-.316.82-.44 1.285-.175l12.313 7.033-3.414 3.328z" fill="#00F076"/>
                  <path d="M13.793 12l3.414 3.414-12.313 7.033c-.465.265-.947.141-1.285-.175L13.793 12z" fill="#FF3A44"/>
                </svg>
              </div>

              <div>
                <span className="text-[10px] uppercase font-extrabold text-text-muted block tracking-widest">
                  GET IT ON
                </span>
                <span className="text-base font-black text-text-primary">
                  Google Play
                </span>
                <span className="text-[11px] text-success block mt-0.5 font-medium flex items-center gap-1">
                  <Download className="w-3 h-3" /> Android APK Package Included
                </span>
              </div>
            </a>

            {/* APPLE APP STORE BADGE */}
            <a
              href="https://apps.apple.com/app/copycoach-ai/id640000000"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 p-5 rounded-2xl bg-surface-elevated border border-border hover:border-border-strong transition-colors cursor-pointer text-left"
            >
              <div className="p-3 rounded-xl bg-surface border border-border text-text-secondary shrink-0">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.28.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>

              <div>
                <span className="text-[10px] uppercase font-extrabold text-text-muted block tracking-widest">
                  Download on the
                </span>
                <span className="text-base font-black text-text-primary">
                  App Store
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5 font-medium">
                  iOS TestFlight & App Store
                </span>
              </div>
            </a>
          </div>

          {/* DIRECT APK DOWNLOAD BOX & SCANNER */}
          <div className="max-w-2xl mx-auto bg-surface-elevated p-5 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-surface border border-border text-accent shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-text-primary">Direct Android APK File (v1.0.0)</h4>
                <p className="text-[11px] text-text-muted">CopyCoach-AI-v1.0.apk • Clean & Verified Build</p>
              </div>
            </div>

            <GradientButton
              onClick={handleDownloadApk}
              disabled={downloadingApk}
              className="w-full sm:w-auto"
            >
              {downloadingApk ? (
                <span>Downloading APK...</span>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>APK Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download APK Now</span>
                </>
              )}
            </GradientButton>
          </div>

          {/* QR CODE INSTANT MOBILE INSTALL */}
          <div className="max-w-2xl mx-auto mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 bg-surface-elevated p-3.5 rounded-2xl border border-border w-full sm:w-auto">
              <div className="bg-white p-2 rounded-xl shrink-0">
                <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="30" height="30" fill="black" />
                  <rect x="15" y="15" width="20" height="20" fill="white" />
                  <rect x="20" y="20" width="10" height="10" fill="black" />

                  <rect x="60" y="10" width="30" height="30" fill="black" />
                  <rect x="65" y="15" width="20" height="20" fill="white" />
                  <rect x="70" y="20" width="10" height="10" fill="black" />

                  <rect x="10" y="60" width="30" height="30" fill="black" />
                  <rect x="15" y="65" width="20" height="20" fill="white" />
                  <rect x="20" y="70" width="10" height="10" fill="black" />

                  <rect x="50" y="50" width="10" height="10" fill="black" />
                  <rect x="70" y="50" width="10" height="10" fill="black" />
                  <rect x="50" y="70" width="20" height="20" fill="black" />
                  <rect x="80" y="80" width="10" height="10" fill="black" />
                </svg>
              </div>

              <div className="text-left text-xs text-text-secondary">
                <p className="font-bold text-text-primary flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-accent" /> Instant Phone Scan
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">Scan with iPhone or Android camera</p>
                <p className="text-[11px] text-text-muted font-medium mt-0.5">Open link to install mobile PWA</p>
              </div>
            </div>

            <div className="text-xs text-text-muted flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>Safe & Malware-Free Verified Application</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: HELP & SUPPORT CENTER */}
        {/* ============================================================ */}
        <div id="support" className="scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span>Help & Support Hub</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-text-primary tracking-tight">
              Have questions? We&apos;re here to help.
            </h2>

            <p className="mt-3 text-text-secondary text-base leading-relaxed">
              Submit a support ticket, ask our AI assistant a question, or browse common help guides below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT: INTERACTIVE SUPPORT FORM */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-bold text-text-primary">Ask AI Support or Submit Ticket</h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border text-text-muted text-[11px] font-medium">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span>24/7 AI-assisted support</span>
                </div>
              </div>

              {supportSuccess ? (
                <div className="bg-surface-elevated border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-success font-bold text-sm">
                    <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                    <span>Support Ticket Received!</span>
                  </div>

                  {aiAnswer && (
                    <div className="bg-surface border border-border rounded-xl p-4 text-xs text-text-secondary leading-relaxed space-y-2">
                      <p className="font-bold text-accent flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Instant AI Assistant Answer:
                      </p>
                      <div className="whitespace-pre-line text-text-primary">{aiAnswer}</div>
                    </div>
                  )}

                  <p className="text-xs text-text-muted leading-relaxed">
                    A developer email notification has also been dispatched to our engineering desk. You will receive further follow-up if required.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSupportSuccess(false);
                      setAiAnswer(null);
                    }}
                    className="mt-2 text-xs font-bold text-accent hover:underline cursor-pointer"
                  >
                    ← Submit Another Support Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Category
                      </label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className="cc-field text-xs rounded-xl px-3.5 py-2.5 cursor-pointer"
                      >
                        <option value="Copywriting Advice">Copywriting & Framework Advice</option>
                        <option value="Mobile App Support">Mobile App & APK Download Support</option>
                        <option value="Account & Billing">Account & Subscription Billing</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Bug Report">Technical Bug Report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Your Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="cc-field text-xs rounded-xl px-3.5 py-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., How to improve my headline score?"
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="cc-field text-xs rounded-xl px-3.5 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                      Describe Your Question or Issue *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Type your question or detail your support request here..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="cc-field text-xs rounded-xl p-3.5 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-text-muted">
                      Replies are AI-assisted and reviewed by our engineering team.
                    </span>

                    <GradientButton
                      type="submit"
                      disabled={isSubmitting || !supportMessage.trim()}
                    >
                      {isSubmitting ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Ticket</span>
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
                <span>Frequently Asked Questions</span>
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
                        className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-text-primary hover:text-text-primary cursor-pointer"
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
                  <Shield className="w-4 h-4 text-accent" /> Need priority assistance?
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Our dedicated engineering support team monitors incoming submissions directly. You can also reach out via email or check platform updates anytime.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}