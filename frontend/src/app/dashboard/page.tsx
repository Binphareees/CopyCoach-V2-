"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  supabase,
  ensureSupabaseConfig,
  isPlaceholderUrl,
  getActiveSupabaseUrl,
  getIsSupabaseConfigured,
} from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTranslation, Trans } from "react-i18next";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatDate } from "@/i18n/format";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import DrillCritiqueFeedback from "@/components/ui/DrillCritiqueFeedback";
import FeedbackModal from "@/components/ui/FeedbackModal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CategorySelector from "@/components/dashboard/CategorySelector";
import ProductDetails from "@/components/dashboard/ProductDetails";
import ToneSelector from "@/components/dashboard/ToneSelector";
import GenerateButton from "@/components/dashboard/GenerateButton";
import ProTipCard from "@/components/dashboard/ProTipCard";
import SectionHeading from "@/components/dashboard/SectionHeading";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import ScoreRing from "@/components/dashboard/ScoreRing";
import LibraryCard from "@/components/dashboard/LibraryCard";
import MobileGetStarted from "@/components/dashboard/MobileGetStarted";
import {
  Sparkles,
  Zap,
  FolderPlus,
  Search,
  Star,
  Copy,
  Download,
  Check,
  ChevronDown,
  Sliders,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Folder,
  FileText,
  CheckCircle2,
  Sun,
  Moon,
  Keyboard,
  HelpCircle,
  CreditCard,
  UserCheck,
  ShieldCheck,
  X,
  User,
  Save,
  LifeBuoy,
  Activity,
  Laptop,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileDown,
} from "lucide-react";

interface CopyResult {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  framework?: string;
  improvedCopy?: string;
  coachAdvice?: string;
  humanWritingScore?: number;
  aiPatternRisk?: number;
  humanWritingAnalysis?: {
    naturalness?: number;
    specificity?: number;
    voice?: number;
    sentenceRhythm?: number;
    clarity?: number;
    contextualFit?: number;
    repetition?: number;
    formulaicPatternRisk?: number;
  };
}

function resultCopyText(result: CopyResult | string | null): string {
  return typeof result === "object" && result ? result.improvedCopy || "" : String(result ?? "");
}

function resultScoreOf(result: CopyResult | string | null): number {
  return typeof result === "object" && result && result.score ? result.score : 70;
}

interface HistoryItem {
  id: string;
  project_id?: string;
  original_text: string;
  improved_text: string;
  copy_type: string;
  tone: string;
  favorite: boolean;
  created_at?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  created_at?: string;
}

const COPY_LANGUAGE_KEY = "copycoach_copy_language";
const COPY_LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Arabic", label: "العربية" },
  { value: "French", label: "Français" },
  { value: "Spanish", label: "Español" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const { locale } = useLanguage();

  // Frontend-only processing stages shown while the generation request is in flight.
  const PROCESSING_STAGES = useMemo(
    () => [
      t("stageAnalyzing"),
      t("stageClarity"),
      t("stageConversion"),
      t("stageBrandVoice"),
      t("stageFinalizing"),
    ],
    [t]
  );

  const scoreLabel = (score: number): string => {
    if (score >= 80) return t("scoreStrong");
    if (score >= 60) return t("scoreFair");
    return t("scoreNeedsWork");
  };

  const riskLevel = (risk: number): string => {
    if (risk <= 20) return t("riskLow");
    if (risk <= 40) return t("riskModerate");
    if (risk <= 60) return t("riskElevated");
    return t("riskHigh");
  };

  // User & Profile State
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account dropdown when clicking/tapping anywhere outside it
  useEffect(() => {
    if (!showMenu) return;

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showMenu]);

  // Copy Generator Inputs & Outputs
  const [text, setText] = useState("");
  const [productName, setProductName] = useState("");
  const [cta, setCta] = useState("");
  const [result, setResult] = useState<CopyResult | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copyType, setCopyType] = useState("Advertisement");
  const [tone, setTone] = useState("Professional");
  const [copyLanguage, setCopyLanguage] = useState("English");
  const [processingStage, setProcessingStage] = useState(0);

  // History & Filtering
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Projects State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Usage & Subscription Analytics
  const [credits, setCredits] = useState(5);
  const [plan, setPlan] = useState("free");
  const [totalCopies, setTotalCopies] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Profile Modal State & Fields
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState<
    "profile" | "brand_voice" | "security" | "preferences" | "billing" | "support"
  >("profile");
  const [role, setRole] = useState("Marketing Copywriter");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [targetAudience, setTargetAudience] = useState("B2B Decision Makers & Founders");
  const [brandNiche, setBrandNiche] = useState("SaaS & Digital Marketing");
  const [preferredLanguage] = useState("English (US)");
  const [brandGuidelines, setBrandGuidelines] = useState(
    "Maintain a clear, punchy, value-focused tone. Avoid fluff and overly complex jargon."
  );
  const [preferredModel, setPreferredModel] = useState("Gemini 2.5 Flash (Recommended)");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Appearance & Theme State (single source of truth: global ThemeProvider)
  const { themeMode, setThemeMode } = useTheme();

  const applyTheme = (mode: "dark" | "light" | "system") => {
    setThemeMode(mode);
    if (mode === "dark") showToast(t("toastThemeDark"));
    else if (mode === "light") showToast(t("toastThemeLight"));
    else showToast(t("toastThemeSystem"));
  };

  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFullOutput, setShowFullOutput] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  // Open account modals from the sidebar Account section (event bridge)
  useEffect(() => {
    function handleAccountModal(event: Event) {
      const detail = (event as CustomEvent<{ modal: "brand_voice" | "billing" | "shortcuts" | "support" }>).detail;
      if (!detail) return;
      setShowMenu(false);
      if (detail.modal === "shortcuts") {
        setShowShortcutsModal(true);
      } else if (detail.modal === "support") {
        setShowSupportModal(true);
      } else {
        setProfileTab(detail.modal === "billing" ? "billing" : "brand_voice");
        setShowProfileModal(true);
      }
    }
    window.addEventListener("copycoach:open-account-modal", handleAccountModal);
    return () => window.removeEventListener("copycoach:open-account-modal", handleAccountModal);
  }, [setShowMenu, setShowProfileModal, setProfileTab, setShowShortcutsModal, setShowSupportModal]);

  // Persist the AI copy language in localStorage (defaults to English)
  useEffect(() => {
    const init = () => {
      try {
        const stored = window.localStorage.getItem(COPY_LANGUAGE_KEY);
        if (stored && COPY_LANGUAGE_OPTIONS.some((opt) => opt.value === stored)) {
          setCopyLanguage(stored);
        }
      } catch {
        /* ignore storage errors */
      }
    };
    const rafId = window.requestAnimationFrame(init);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const persistCopyLanguage = (value: string) => {
    setCopyLanguage(value);
    try {
      window.localStorage.setItem(COPY_LANGUAGE_KEY, value);
    } catch {
      /* ignore storage errors */
    }
  };

  // Advance the staged processing indicator while the generation request is in flight.
  // Presentation only — the request itself is a single API call. Stage updates and the
  // reset happen in deferred callbacks (allowed), never synchronously in the effect.
  const processingStarted = useRef(false);
  useEffect(() => {
    if (!loading) {
      processingStarted.current = false;
      return;
    }
    const resetId = window.setTimeout(() => {
      processingStarted.current = true;
      setProcessingStage(0);
    }, 0);
    const id = window.setInterval(() => {
      if (!processingStarted.current) {
        processingStarted.current = true;
        setProcessingStage(0);
        return;
      }
      setProcessingStage((stage) => Math.min(stage + 1, PROCESSING_STAGES.length - 1));
    }, 1750);
    return () => {
      window.clearTimeout(resetId);
      window.clearInterval(id);
    };
  }, [loading]);

  // EXPORT OPTIMIZED COPY AS STYLED PDF USING JSPDF
  const handleExportPDF = async (textToExport?: string) => {
    const activeText =
      textToExport || (typeof result === "object" ? result?.improvedCopy : String(result));
    if (!activeText) return;
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Header / Branding
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(6, 182, 212);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("CopyCoach AI", 15, 18);

      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(t("pdfTitle"), 15, 25);

      // Title / Copy Type Metadata
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(t("pdfDocumentLabel", { type: copyType || "Copywriting Drill" }), 15, 44);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const scoreVal = typeof result === "object" && result?.score ? result.score : 70;
      doc.text(t("pdfGeneratedMeta", { date: formatDate(locale, new Date()), tone, score: scoreVal }), 15, 51);

      doc.setDrawColor(226, 232, 240);
      doc.line(15, 55, 195, 55);

      // Main Content Box
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);

      const splitLines = doc.splitTextToSize(activeText, 180);
      doc.text(splitLines, 15, 65);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Generated via CopyCoach AI Assistant | slastbornn@gmail.com", 15, 285);

      const timestamp = new Date().getTime();
      doc.save(`CopyCoach-Optimized-Copy-${timestamp}.pdf`);
      showToast(t("toastPdfExported"));
    } catch (err) {
      console.error("PDF Export failed:", err);
      showToast(t("toastPdfFailed"));
    }
  };

  // Configuration Check
  const [showConfigBanner, setShowConfigBanner] = useState(false);
  const [activeSupabaseUrl, setActiveSupabaseUrl] = useState("");

  // Quick Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Load User Profile
  const loadProfile = useCallback(async (id: string, userObj: { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string; picture?: string; name?: string } }) => {
    setUserEmail(userObj.email || "");
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, email")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
    }

    if (data) {
      setFullName(data.full_name || userObj.user_metadata?.full_name || userObj.user_metadata?.name || "User");
      setAvatar(data.avatar_url || userObj.user_metadata?.avatar_url || userObj.user_metadata?.picture || "");
    } else {
      const name = userObj.user_metadata?.full_name || userObj.user_metadata?.name || "User";
      setFullName(name);
      setAvatar(userObj.user_metadata?.avatar_url || userObj.user_metadata?.picture || "");
    }
  }, []);

  // 2. Load Usage Credits
  const loadUsage = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_usage")
      .select("daily_generations_used, monthly_generations_used, plan, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Usage load error:", error);
      return;
    }

    if (data) {
      if (data.plan === "pro") {
        setCredits(Math.max(0, 100 - (data.monthly_generations_used || 0)));
      } else {
        setCredits(Math.max(0, 5 - (data.daily_generations_used || 0)));
      }
      setPlan(data.plan || "free");
    } else {
      await supabase.from("user_usage").insert({
        user_id: user.id,
        plan: "free",
        daily_generations_used: 0,
        monthly_generations_used: 0,
        daily_reset_date: new Date().toISOString(),
        monthly_reset_date: new Date().toISOString(),
        subscription_status: "active"
      });

      setCredits(5);
      setPlan("free");
    }
  }, []);

  // 3. Load Projects
  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProjectsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setProjects(data || []);
    }
    setProjectsLoading(false);
  }, []);

  // 4. Load Copy History
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHistory(data);
      setTotalCopies(data.length);
      setFavoriteCount(data.filter((i) => i.favorite).length);
    }
    setHistoryLoading(false);
  }, []);

  // Initialization Effect
  useEffect(() => {
    let isMounted = true;
    async function init() {
      await ensureSupabaseConfig();
      const currentUrl = getActiveSupabaseUrl();
      setActiveSupabaseUrl(currentUrl);

      if (isPlaceholderUrl(currentUrl) || !getIsSupabaseConfigured()) {
        setShowConfigBanner(true);
      } else {
        setShowConfigBanner(false);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      if (isMounted) {
        setUserId(user.id);
        await loadProfile(user.id, user);
        await loadUsage();
        await loadProjects();
        await loadHistory();
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [router, loadProfile, loadUsage, loadProjects, loadHistory]);

  // Handle Copy Generation
  async function improveCopy() {
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!text.trim()) {
      setMessage(t("errors.describeOffer"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`
        },
        body: JSON.stringify({
          text,
          copyType,
          tone,
          productName,
          targetAudience,
          cta,
          language: copyLanguage,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || t("errors.generationLimit"));
        setLoading(false);
        return;
      }

      const improvedResult = data.result || data.error || t("errors.noResponse");
      setResult(improvedResult);

      await loadUsage();

      const historyData = {
        user_id: user.id,
        project_id: selectedProject || null,
        original_text: text,
        improved_text:
          typeof improvedResult === "object"
            ? improvedResult.improvedCopy
            : improvedResult,
        copy_type: copyType,
        tone: tone,
        favorite: false
      };

      const { error } = await supabase.from("history").insert(historyData);
      if (!error) {
        loadHistory();
      }
      showToast(t("toastCopyAnalyzed"));
    } catch (err) {
      console.error("Improve copy error:", err);
      setResult(String(err));
    } finally {
      setLoading(false);
    }
  }

  // Favorite toggle
  async function toggleFavorite(id: string, current: boolean) {
    const { error } = await supabase
      .from("history")
      .update({ favorite: !current })
      .eq("id", id);

    if (!error) {
      loadHistory();
      showToast(!current ? t("toastAddedToFavorites") : t("toastRemovedFromFavorites"));
    }
  }

  // Delete history item
  async function deleteHistory(id: string) {
    const { error } = await supabase.from("history").delete().eq("id", id);
    if (!error) {
      loadHistory();
      showToast(t("toastItemDeleted"));
    }
  }

  // Create Project
  async function createProject() {
    if (!projectName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectName.trim()
      })
      .select()
      .single();

    if (!error && data) {
      setProjectName("");
      setShowProjectModal(false);
      setSelectedProject(data.id);
      loadProjects();
      showToast(t("projectCreated", { name: data.name }));
    }
  }

  // Clipboard copy
  function handleCopy(value: string, idKey?: string) {
    navigator.clipboard.writeText(value);
    setCopiedId(idKey || "main");
    showToast(t("toastCopied"));
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Download text file
  function handleDownload(content: string, filename = "copycoach-improved.txt") {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(t("toastFileDownloaded"));
  }

  // Payment upgrade
  async function upgradeToPro() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        setMessage(data.error || t("errors.paymentUnavailable"));
      }
    } catch (e) {
      console.error(e);
      setMessage(t("errors.paymentStartFailed"));
    }
  }

  // Filtered History
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.improved_text?.toLowerCase().includes(search.toLowerCase()) ||
                          item.copy_type?.toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = showFavorites ? item.favorite : true;
    return matchesSearch && matchesFavorite;
  });

  // Sample copy starter helper
  const insertSample = (sampleText: string, sampleType: string, sampleTone: string) => {
    setText(sampleText);
    setCopyType(sampleType);
    setTone(sampleTone);
    showToast(t("toastSampleLoaded"));
  };

  return (
    <div className="relative min-h-screen font-sans text-brand-100 selection:bg-accent selection:text-text-primary">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 end-4 z-[60] flex items-center gap-2 glass-popover px-4 py-3 text-sm font-medium text-brand-100 animate-pop lg:bottom-6 lg:end-6">
          <Check className="h-4 w-4 text-accent-bright" />
          <span>{toastMessage}</span>
        </div>
      )}

      <DashboardTopbar
        title={t("copycoachWorkspace")}
        right={
          <>
            {/* Desktop workspace controls */}
            <div className="hidden items-center gap-3 md:flex">
            {/* Workspace selector */}
            <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg-elevated px-3.5 py-1.5 text-xs text-brand-200">
              <Folder className="h-3.5 w-3.5 text-accent-bright" />
              <span className="hidden lg:inline">{t("workspaceLabel")}:</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent font-medium text-text-primary focus:outline-none"
              >
                <option value="" className="bg-ink-800 text-brand-100">{t("defaultWorkspace")}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-ink-800 text-brand-100">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg-elevated px-3.5 py-1.5 text-xs font-semibold text-brand-100 transition-colors hover:bg-glass-bg-hover"
            >
              <FolderPlus className="h-3.5 w-3.5 text-accent-bright" />
              {t("newProject")}
            </button>
          </div>

          {/* User Account Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-glass-border bg-glass-bg-elevated text-sm font-bold text-accent-bright">
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatar} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  fullName ? fullName.charAt(0).toUpperCase() : "U"
                )}
              </div>
              <div className="hidden pe-1 text-start sm:block">
                <p className="text-xs font-semibold leading-tight text-text-primary">{fullName || t("copycoachUser")}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium capitalize text-brand-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${plan === "pro" ? "bg-warning" : "bg-accent-bright"}`} />
                  {plan === "pro" ? t("proPlan") : t("freePlan")}
                </p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-brand-300 sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute end-0 z-50 mt-2 w-72 glass-popover p-2.5 text-text-primary animate-pop">
                  {/* Profile Header */}
                  <div className="mb-2 glass-panel-deep px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-glass-border bg-glass-bg-elevated text-xs font-bold text-accent-bright">
                        {avatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={avatar} alt={fullName} className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          fullName ? fullName.charAt(0).toUpperCase() : "U"
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-xs font-bold text-text-primary">{fullName || t("copycoachUser")}</p>
                        <p className="mt-0.5 truncate text-[11px] text-text-muted">{userEmail || userId}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-glass-border-subtle pt-2 text-[11px] text-text-muted">
                      <span className="flex items-center gap-1 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-accent-bright" />
                        <span>{plan === "pro" ? t("proMembership") : t("starterFreePlan")}</span>
                      </span>
                      <span className="font-bold text-accent-bright">{t("creditsLeft", { count: credits })}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          </>
        }
      />

      {/* Prominent Persistent Banner Warning for Placeholder Supabase Config */}
      {showConfigBanner && (
        <div className="relative z-30 border-b border-warning/30 bg-warning/10 px-4 py-3.5 text-warning sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-warning/15 p-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-warning">
                  {t("supabaseConfigWarning")}
                </p>
                <p className="mt-0.5 text-xs text-warning/80">
                  {t("placeholderUrlMessage", { url: activeSupabaseUrl || "placeholder.supabase.co" })}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="rounded-lg border border-warning/40 bg-warning/15 px-3 py-1.5 text-xs font-medium text-warning">
                {t("invalidConfigDetected")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* WELCOME & ANALYTICS BANNER */}
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[13px] font-semibold text-brand-200">
              {t("welcomeBack", { name: fullName.split(" ")[0] || "Creator" })}
            </p>
            <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-tight text-text-primary sm:text-[2.1rem]">
              <Trans
                ns="dashboard"
                i18nKey="headline"
                components={{ gradient: <span className="text-gradient" /> }}
              />
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-brand-200">
              {t("subheadline")}
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent-bright shadow-accent-soft">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-bright opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-bright" />
            </span>
            {t("aiActive")}
          </span>
        </div>

        {/* STAT CARDS */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <DashboardStatCard
            label={t("aiGenerationCredits")}
            icon={<Zap className="h-4 w-4" />}
            tone="accent"
            value={
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-text-primary">{credits}</span>
                  <span className="text-xs text-brand-300">/ {plan === "pro" ? 100 : 5} {plan === "pro" ? t("leftThisMonth") : t("leftToday")}</span>
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-glass-bg-elevated">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent-bright transition-all duration-500"
                    style={{ width: `${Math.min(100, (credits / (plan === "pro" ? 100 : 5)) * 100)}%` }}
                  />
                </div>
              </div>
            }
            footer={
              plan === "free" ? (
                <button
                  onClick={upgradeToPro}
                  className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-accent-bright hover:text-accent"
                >
                  {t("upgradeToProMonthly")}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform rtl:rotate-180" />
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("unlimitedProAccess")}
                </span>
              )
            }
          />

          <DashboardStatCard
            label={t("totalCopyImprovements")}
            icon={<FileText className="h-4 w-4" />}
            tone="info"
            hint={t("savedInHistoryLibrary")}
            value={
              <div className="text-3xl font-extrabold text-text-primary">{totalCopies}</div>
            }
            footer={
              <span className="flex items-center gap-1 text-[11px] text-brand-300">
                <TrendingUp className="h-3.5 w-3.5 text-info" />
                {t("realtimePersistence")}
              </span>
            }
          />

          <DashboardStatCard
            label={t("starredFavorites")}
            icon={<Star className="h-4 w-4 fill-warning/20" />}
            tone="warning"
            hint={t("highConvertingSnippets")}
            value={
              <div className="text-3xl font-extrabold text-text-primary">{favoriteCount}</div>
            }
            footer={
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-warning hover:text-warning/80"
              >
                {showFavorites ? t("viewAllCopies") : t("filterFavorites")}
              </button>
            }
          />

          <DashboardStatCard
            label={t("activeProjects")}
            icon={<Layers className="h-4 w-4" />}
            tone="success"
            hint={t("organizedCampaigns")}
            value={
              <div className="text-3xl font-extrabold text-text-primary">{projects.length}</div>
            }
            footer={
              <button
                onClick={() => setShowProjectModal(true)}
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-accent-bright hover:text-accent"
              >
                + {t("createProject")}
              </button>
            }
          />
        </div>

        {/* WORKSPACE GRID: LEFT INPUT & RIGHT OUTPUT */}
        <div id="generate" className="mb-12 scroll-mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT PANEL: GENERATOR FORM */}
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface-elevated md:col-span-7">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-border p-6">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                  <Sparkles className="h-5 w-5 text-accent-bright" />
                  {t("copycoachAiStudio")}
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  {t("studioSubtitle")}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-8 p-6 sm:p-7">
              {/* Section 1: Select Category */}
              <section>
                <SectionHeading
                  number="01"
                  title={t("chooseCopyType")}
                  subtitle={t("copyTypeSubtitle")}
                />
                <div className="mt-4">
                  <CategorySelector value={copyType} onChange={setCopyType} />
                </div>
              </section>

              {/* Section 2: Your Copy & Context (writing canvas first) */}
              <section>
                <SectionHeading
                  number="02"
                  title={t("yourCopyContext")}
                  subtitle={t("contextSubtitle")}
                />
                <div className="mt-4">
                  <ProductDetails
                    productName={productName}
                    onProductNameChange={setProductName}
                    description={text}
                    onDescriptionChange={setText}
                    targetAudience={targetAudience}
                    onTargetAudienceChange={setTargetAudience}
                    cta={cta}
                    onCtaChange={setCta}
                  />
                </div>
              </section>

              {/* Section 3: Select Tone of Voice */}
              <section>
                <SectionHeading
                  number="03"
                  title={t("chooseToneVoice")}
                  subtitle={t("toneSubtitle")}
                />
                <div className="mt-4">
                  <ToneSelector value={tone} onChange={setTone} />
                </div>
              </section>

              {/* Section 4: Select Copy Language */}
              <section>
                <SectionHeading
                  number="04"
                  title={t("copyLanguageTitle")}
                  subtitle={t("copyLanguageSubtitle")}
                />
                <div className="mt-4">
                  <select
                    value={copyLanguage}
                    onChange={(e) => persistCopyLanguage(e.target.value)}
                    className="cc-field w-full cursor-pointer rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  >
                    {[
                      { value: "English", label: t("copyLanguageEnglish") },
                      { value: "Arabic", label: t("copyLanguageArabic") },
                      { value: "French", label: t("copyLanguageFrench") },
                      { value: "Spanish", label: t("copyLanguageSpanish") },
                    ].map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] text-text-muted">{t("copyLanguageHelper")}</p>
                </div>
              </section>

              {/* Inline error message */}
              {message && (
                <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger-surface p-3.5 text-xs text-danger">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  <span>{message}</span>
                </div>
              )}

              {/* Generate CTA */}
              <div className="mt-auto space-y-3 pt-2">
                <ProTipCard />

                {credits <= 0 && !loading && (
                  <p className="text-center text-xs text-warning">
                    {t("outOfCreditsLine1")}{" "}
                    <button onClick={upgradeToPro} className="font-semibold underline underline-offset-2 hover:text-warning">
                      {t("upgradeToPro")}
                    </button>{" "}
                    {t("forMonthlyGenerations")}
                  </p>
                )}

                <GenerateButton
                  loading={loading}
                  disabled={loading || credits <= 0}
                  onClick={improveCopy}
                />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: AI COACHING OUTPUT */}
          <div className="flex min-h-[480px] flex-col rounded-2xl border border-border bg-surface-elevated md:col-span-5">
            {result ? (
              <div className="flex flex-1 flex-col gap-7 p-6 animate-fade sm:p-7">
                {/* CopyCoach Review header */}
                <header className="border-b border-border pb-5">
                  <h2 className="text-lg font-bold tracking-tight text-text-primary">
                    {t("copycoachReview")}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                    {t("reviewSubtitle")}
                  </p>
                </header>

                {/* Conversion Score */}
                <section>
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{t("conversionScore")}</h3>
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold tracking-tight tabular-nums text-text-primary">
                          {resultScoreOf(result)}
                        </span>
                        <span className="text-sm font-medium text-text-muted">/ 100</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-text-secondary">
                        {scoreLabel(resultScoreOf(result))}
                      </p>
                    </div>
                    <ScoreRing score={resultScoreOf(result)} />
                  </div>
                  <div
                    className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${resultScoreOf(result)}%` }}
                    />
                  </div>
                </section>

                {/* Improved Copy — the primary content */}
                <section>
                  <h3 className="text-sm font-semibold text-text-primary">{t("improvedCopy")}</h3>
                  <div className="mt-3 rounded-xl border border-border bg-surface p-5">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text-primary">
                      {resultCopyText(result)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCopy(resultCopyText(result), "result")}
                      title={t("copyImprovedCopy")}
                    >
                      {copiedId === "result" ? (
                        <>
                          <Check className="h-4 w-4" />
                          {t("copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          {t("copyAction")}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleExportPDF(resultCopyText(result))}
                      title={t("exportAsPdf")}
                    >
                      <FileDown className="h-4 w-4" />
                      {t("exportPdf")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowFullOutput(true)}
                      title={t("expandToFullView")}
                    >
                      <Maximize2 className="h-4 w-4" />
                      {t("showFull")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(resultCopyText(result))}
                      title={t("downloadAsTextFile")}
                    >
                      <Download className="h-4 w-4" />
                      {t("downloadAction")}
                    </Button>
                  </div>
                </section>

                {/* Why This Works */}
                {typeof result === "object" &&
                  (result.coachAdvice ||
                    (result.strengths && result.strengths.length > 0) ||
                    (result.weaknesses && result.weaknesses.length > 0)) && (
                    <section className="rounded-xl border border-border bg-surface p-4">
                      <h3 className="text-sm font-semibold text-text-primary">{t("whyThisWorks")}</h3>
                      {result.coachAdvice && (
                        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                          {result.coachAdvice}
                        </p>
                      )}
                      {result.strengths && result.strengths.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-text-secondary">
                            {t("whatsWorking")}
                          </p>
                          <ul className="mt-1.5 space-y-1.5">
                            {result.strengths.map((strength, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-[13px] leading-relaxed text-text-secondary"
                              >
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.weaknesses && result.weaknesses.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-text-secondary">
                            {t("whereToGoFurther")}
                          </p>
                          <ul className="mt-1.5 space-y-1.5">
                            {result.weaknesses.map((weakness, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-[13px] leading-relaxed text-text-secondary"
                              >
                                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent rtl:rotate-180" />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  )}

                {/* Writing Quality & Human Writing Score */}
                {typeof result === "object" && result.humanWritingScore !== undefined && (
                  <section className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-sm font-semibold text-text-primary">{t("writingQuality")}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tabular-nums text-text-primary">
                          {result.humanWritingScore}
                        </span>
                        <span className="text-xs font-medium text-text-muted">/ 100</span>
                      </div>
                    </div>
                    {result.humanWritingAnalysis && (
                      <ul className="mt-4 space-y-2.5">
                        {[
                          { label: t("naturalness"), value: result.humanWritingAnalysis.naturalness },
                          { label: t("specificity"), value: result.humanWritingAnalysis.specificity },
                          { label: t("clarity"), value: result.humanWritingAnalysis.clarity },
                          { label: t("voice"), value: result.humanWritingAnalysis.voice },
                          { label: t("rhythm"), value: result.humanWritingAnalysis.sentenceRhythm },
                          { label: t("audienceFit"), value: result.humanWritingAnalysis.contextualFit },
                          { label: t("repetition"), value: result.humanWritingAnalysis.repetition },
                        ].map((item) => (
                          <li key={item.label}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-secondary">{item.label}</span>
                              <span className="tabular-nums text-text-secondary">
                                {item.value ?? 70}
                              </span>
                            </div>
                            <div
                              className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-muted"
                              aria-hidden="true"
                            >
                              <div
                                className="h-full rounded-full bg-accent/70 transition-all duration-500"
                                style={{ width: `${item.value ?? 70}%` }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {/* AI Pattern Risk — writing-style signal */}
                {typeof result === "object" && (
                  <section className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-text-primary">{t("aiPatternRisk")}</h3>
                      <Badge variant="neutral">{riskLevel(result.aiPatternRisk ?? 30)}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                      {t("riskSignal", { risk: riskLevel(result.aiPatternRisk ?? 30) })} {t("riskHeuristicNote")}
                    </p>
                  </section>
                )}

                {/* Framework */}
                {typeof result === "object" && result.framework && (
                  <section className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
                    <span className="text-xs font-medium text-text-secondary">{t("framework")}</span>
                    <span className="text-xs font-semibold text-text-primary">{result.framework}</span>
                  </section>
                )}

                {/* CopyCoach Feedback — continue the coaching */}
                <section className="border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-text-primary">{t("copycoachFeedback")}</h3>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {t("feedbackSubtitle")}
                  </p>
                  <div className="mt-3">
                    <DrillCritiqueFeedback
                      userCopyInput={text}
                      aiOutputString={resultCopyText(result)}
                      userTier={plan === "pro" ? "Pro" : "Spark"}
                    />
                  </div>
                </section>
              </div>
            ) : loading ? (
              /* Staged Processing State (frontend-only presentation) */
              <div className="flex min-h-[440px] flex-col items-center justify-center p-6 text-center" role="status" aria-live="polite">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent-bright">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">
                  {t("copycoachWorking")}
                </p>
                <ol key={processingStage} className="mt-4 space-y-1.5 text-[13px] animate-fade">
                  {PROCESSING_STAGES.map((stage, i) => {
                    const isCurrent = i === processingStage;
                    const isComplete = i < processingStage;
                    return (
                      <li
                        key={stage}
                        className={`flex items-center justify-center gap-2 ${
                          isCurrent
                            ? "font-semibold text-text-primary"
                            : isComplete
                            ? "text-text-muted"
                            : "opacity-60 text-text-muted"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isCurrent ? "bg-accent-bright" : isComplete ? "bg-accent/40" : "bg-border"
                          }`}
                        />
                        <span>{stage}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent-bright">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-text-primary">{t("awaitingAnalysis")}</h3>
                <p className="max-w-xs text-xs leading-relaxed text-text-secondary">
                  {t("awaitingAnalysisBody1")}{" "}
                  <strong className="font-semibold text-text-primary">{t("improveYourCopy")}</strong>{" "}
                  {t("awaitingAnalysisBody2")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PROJECTS */}
        <section id="dashboard-projects" className="mt-12 scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">{t("projectsTitle")}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t("projectsSubtitle")}
              </p>
            </div>
          </div>

          {projectsLoading ? (
            <div className="mt-5 overflow-hidden rounded-xl border border-border">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-muted" />
                  <div className="h-3 w-40 animate-pulse rounded bg-surface-muted" />
                  <div className="ms-auto h-3 w-16 animate-pulse rounded bg-surface-muted" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
              <Folder className="h-5 w-5 text-text-muted" />
<span className="max-w-sm text-xs text-text-secondary">
                  {t("noProjectsYet")}
                </span>
              <button
                onClick={() => setShowProjectModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Create Project
              </button>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface-elevated">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                  aria-label={t("openProjectAria", { name: p.name })}
                  className={`group flex w-full items-center justify-between gap-4 px-4 py-3.5 text-start transition-colors hover:bg-surface-muted ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors group-hover:text-accent-bright">
                      <Folder className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-text-primary">
                        {p.name}
                      </span>
                      <span className="block text-[11px] text-text-muted">
                        {p.created_at
                          ? t("createdOn", {
                              date: formatDate(locale, p.created_at, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }),
                            })
                          : t("openProject")}
                      </span>
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-all group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-hover:text-accent-bright rtl:rotate-180" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* COPY LIBRARY */}
        <section id="copy-library" className="mt-12 scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">{t("copyLibrary")}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t("librarySubtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {plan === "free" ? (
                <button
                  onClick={upgradeToPro}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground shadow-accent-soft transition-colors hover:bg-accent-hover"
                >
                  {t("upgradeToPro")}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
              ) : (
                <span className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-[11px] font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("proActive")}
                </span>
              )}

              <div className="relative">
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder={t("searchHistory")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="cc-field rounded-lg py-2 ps-9 pe-3 text-xs text-text-primary placeholder:text-text-muted sm:w-56"
                  aria-label={t("searchHistoryAria")}
                />
              </div>

              <button
                onClick={() => setShowFavorites(!showFavorites)}
                aria-pressed={showFavorites}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  showFavorites
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-border bg-surface text-text-muted hover:bg-surface-muted hover:text-text-primary"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${showFavorites ? "fill-warning" : ""}`} />
                {showFavorites ? t("starredOnly") : t("allCopies")}
              </button>
            </div>
          </div>

          {/* History Cards */}
          {historyLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 animate-pulse rounded-md bg-surface-muted" />
                    <div className="h-3 w-16 animate-pulse rounded bg-surface-muted" />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-surface-muted" />
                    <div className="h-3 w-3/5 animate-pulse rounded bg-surface-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredHistory.map((item) => (
                <LibraryCard
                  key={item.id}
                  copyType={item.copy_type || "Copy"}
                  tone={item.tone || "Default"}
                  improvedText={item.improved_text}
                  originalText={item.original_text}
                  favorite={item.favorite}
                  copied={copiedId === item.id}
                  createdAt={item.created_at}
                  onCopy={() => handleCopy(item.improved_text, item.id)}
                  onFavorite={() => toggleFavorite(item.id, item.favorite)}
                  onDownload={() => handleDownload(item.improved_text, `${item.copy_type || "copy"}-improved.txt`)}
                  onDelete={() => deleteHistory(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-14 text-center">
              <FileText className="h-5 w-5 text-text-muted" />
              <span className="max-w-sm text-xs text-text-secondary">
                {t("noHistoryFound")}
              </span>
            </div>
          )}
        </section>

        <MobileGetStarted
          canUpgrade={plan === "free"}
          onNewCopy={() =>
            document.getElementById("generate")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          onLibrary={() =>
            document.getElementById("copy-library")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          onUpgrade={upgradeToPro}
        />
      </main>

      {/* NEW PROJECT MODAL */}
      {showProjectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-backdrop)] p-4 backdrop-blur-sm"
          onClick={() => setShowProjectModal(false)}
        >
          <div
            className="w-full max-w-md glass-modal p-6 animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-text-primary">
              <FolderPlus className="h-5 w-5 text-accent-bright" />
              {t("createNewProjectWorkspace")}
            </h3>
            <p className="mb-5 text-xs text-brand-200">
              {t("organizeWorkspaces")}
            </p>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                {t("projectName")}
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t("projectNamePlaceholder")}
                className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-sm text-brand-100"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowProjectModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                {t("cancel")}
              </button>
              <button
                onClick={createProject}
                className="rounded-xl bg-accent px-5 py-2 text-xs font-bold text-accent-foreground shadow-accent-soft transition-colors hover:bg-accent-hover"
              >
                {t("createProject")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PROFILE & SETTINGS MODAL */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[var(--modal-backdrop)] p-3 backdrop-blur-md sm:p-6"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="glass-modal my-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden text-brand-100 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-glass-border bg-glass-bg-deep p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 text-accent-bright">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">{t("profileModalTitle")}</h3>
                  <p className="text-xs text-brand-200">{t("profileModalSubtitle")}</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                aria-label={t("close")}
                className="rounded-xl p-2 text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* Tab Navigation Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-glass-border pb-4">
                <button
                  onClick={() => setProfileTab("profile")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "profile"
                      ? "bg-accent text-accent-foreground shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <User className="h-4 w-4" />
                  {t("personalProfile")}
                </button>

                <button
                  onClick={() => setProfileTab("brand_voice")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "brand_voice"
                      ? "bg-accent text-accent-foreground shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  {t("brandVoiceTab")}
                </button>

                <button
                  onClick={() => setProfileTab("preferences")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "preferences"
                      ? "bg-accent text-accent-foreground shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  {t("themeAiEngine")}
                </button>

                <button
                  onClick={() => setProfileTab("security")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "security"
                      ? "bg-accent text-accent-foreground shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t("securityTab")}
                </button>

                <button
                  onClick={() => setProfileTab("billing")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "billing"
                      ? "bg-accent text-accent-foreground shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  {t("subscriptionTab")}
                </button>

                <button
                  onClick={() => setProfileTab("support")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "support"
                      ? "bg-accent text-accent-foreground shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <LifeBuoy className="h-4 w-4" />
                  {t("supportHub")}
                </button>
              </div>

              {/* TAB 1: PERSONAL PROFILE */}
              {profileTab === "profile" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("fullName")}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t("fullNamePlaceholder")}
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("emailAddress")}
                      </label>
                      <input
                        type="email"
                        value={userEmail || "user@example.com"}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-glass-border-subtle bg-glass-bg-deep px-4 py-2.5 text-xs text-brand-300 opacity-80"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("roleTitle")}
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder={t("rolePlaceholder")}
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("companyBrandName")}
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={t("companyPlaceholder")}
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      {t("bioGoals")}
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={t("bioPlaceholder")}
                      className="cc-input w-full resize-none rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs text-brand-100"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: BRAND VOICE */}
              {profileTab === "brand_voice" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("targetAudience")}
                      </label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("brandNiche")}
                      </label>
                      <input
                        type="text"
                        value={brandNiche}
                        onChange={(e) => setBrandNiche(e.target.value)}
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      {t("customBrandGuidelines")}
                    </label>
                    <textarea
                      rows={4}
                      value={brandGuidelines}
                      onChange={(e) => setBrandGuidelines(e.target.value)}
                      className="cc-input w-full resize-none rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs text-brand-100"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: THEME & AI PREFERENCES */}
              {profileTab === "preferences" && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      {t("themeMode")}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => applyTheme("dark")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                          themeMode === "dark"
                            ? "border-transparent bg-accent text-text-primary shadow-accent-soft"
                            : "border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:bg-glass-bg-hover hover:text-brand-100"
                        }`}
                      >
                        <Moon className="h-4 w-4" />
                        {t("darkMode")}
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTheme("light")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                          themeMode === "light"
                            ? "border-transparent bg-accent text-text-primary shadow-accent-soft"
                            : "border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:bg-glass-bg-hover hover:text-brand-100"
                        }`}
                      >
                        <Sun className="h-4 w-4" />
                        {t("lightMode")}
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTheme("system")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                          themeMode === "system"
                            ? "border-transparent bg-accent text-text-primary shadow-accent-soft"
                            : "border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:bg-glass-bg-hover hover:text-brand-100"
                        }`}
                      >
                        <Laptop className="h-4 w-4" />
                        {t("systemSync")}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      {t("defaultAiEngine")}
                    </label>
                    <select
                      value={preferredModel}
                      onChange={(e) => setPreferredModel(e.target.value)}
                      className="cc-input w-full cursor-pointer rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                    >
                      <option value="Gemini 2.5 Flash (Recommended)">{t("geminiFlash")}</option>
                      <option value="Gemini 2.5 Pro (Deep Copywriting Reasoning)">{t("geminiPro")}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY */}
              {profileTab === "security" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("newPassword")}
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        {t("confirmPassword")}
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{t("twoFactor")}</p>
                      <p className="text-[11px] text-brand-300">{t("twoFactorDesc")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        showToast(!twoFactorEnabled ? t("toast2faEnabled") : t("toast2faDisabled"));
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        twoFactorEnabled ? "bg-success text-ink-950" : "bg-glass-bg-elevated text-brand-200"
                      }`}
                    >
                      {twoFactorEnabled ? t("enabled") : t("enable")}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: BILLING & SUBSCRIPTION */}
              {profileTab === "billing" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-accent/25 bg-gradient-to-r from-accent/10 via-accent/10 to-accent/10 p-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-bright">{t("currentPlan")}</span>
                      <h4 className="text-lg font-bold capitalize text-text-primary">{plan} {t("plan")}</h4>
                      <p className="mt-0.5 text-xs text-brand-200">
                        {plan === "pro" ? t("proDaily") : t("freeDaily")}
                      </p>
                    </div>

                    {plan !== "pro" && (
                      <button
                        type="button"
                        onClick={upgradeToPro}
                        className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-accent-soft transition-colors hover:bg-accent-hover"
                      >
                        {t("upgradeToPro")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SUPPORT HUB */}
              {profileTab === "support" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-surface p-3 text-xs font-medium text-success">
                    <Activity className="h-4 w-4 animate-pulse text-success" />
                    {t("aiStatusAllOperational")}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      {t("submitSupportTicket")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("subjectLinePlaceholder")}
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="cc-input mb-3 w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                    />
                    <textarea
                      rows={3}
                      placeholder={t("describeIssuePlaceholder")}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="cc-input w-full resize-none rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs text-brand-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex shrink-0 items-center justify-end border-t border-glass-border bg-glass-bg-deep p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                >
                  {t("close")}
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("copycoach_user_settings", JSON.stringify({
                      role, company, bio, targetAudience, brandNiche, preferredLanguage, brandGuidelines, preferredModel
                    }));
                    showToast(t("toastProfileSaved"));
                    setShowProfileModal(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-accent px-6 py-2 text-xs font-bold text-accent-foreground shadow-accent-soft transition-colors hover:bg-accent-hover"
                >
                  <Save className="h-3.5 w-3.5" />
                  {t("saveChanges")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-backdrop)] p-4 backdrop-blur-sm"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-lg glass-modal p-6 animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <Keyboard className="h-5 w-5 text-accent-bright" />
                {t("shortcutsTitle")}
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                aria-label={t("close")}
                className="rounded-lg p-1 text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">{t("shortcutRunOptimization")}</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">⌘</kbd>
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">Enter</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">{t("shortcutToggleFavorite")}</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">⌘</kbd>
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">F</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">{t("shortcutCopyImproved")}</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">⌘</kbd>
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">C</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">{t("shortcutNewProject")}</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">⌘</kbd>
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">P</kbd>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-xl bg-glass-bg-elevated px-5 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-glass-bg-hover"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP & AI SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-backdrop)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-modal p-6 animate-pop">
            <div className="mb-4 flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <HelpCircle className="h-5 w-5 text-accent-bright" />
                {t("supportModalTitle")}
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                aria-label={t("close")}
                className="rounded-lg p-1 text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-brand-200">
              {t("supportModalDesc")}
            </p>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                  {t("topicSubject")}
                </label>
                <input
                  type="text"
                  placeholder={t("topicSubjectPlaceholder")}
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                  {t("message")}
                </label>
                <textarea
                  rows={4}
                  placeholder={t("messagePlaceholder")}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="cc-input w-full resize-none rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs text-brand-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSupportModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  setSupportSubject("");
                  setSupportMessage("");
                  showToast(t("toastTicketSubmitted"));
                }}
                className="rounded-xl bg-accent px-5 py-2 text-xs font-bold text-accent-foreground shadow-accent-soft transition-colors hover:bg-accent-hover"
              >
                {t("sendMessage")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}