"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  supabase,
  ensureSupabaseConfig,
  isPlaceholderUrl,
  getActiveSupabaseUrl,
  getIsSupabaseConfigured,
} from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import DrillCritiqueFeedback from "@/components/ui/DrillCritiqueFeedback";
import FeedbackModal from "@/components/ui/FeedbackModal";
import CategorySelector from "@/components/dashboard/CategorySelector";
import ProductDetails from "@/components/dashboard/ProductDetails";
import ToneSelector from "@/components/dashboard/ToneSelector";
import GenerateButton from "@/components/dashboard/GenerateButton";
import ProTipCard from "@/components/dashboard/ProTipCard";
import SectionHeading from "@/components/dashboard/SectionHeading";
import {
  Sparkles,
  Zap,
  FolderPlus,
  Search,
  Star,
  Copy,
  Trash2,
  Download,
  Check,
  ChevronDown,
  LogOut,
  Sliders,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Folder,
  FileText,
  BarChart3,
  Lightbulb,
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
  FileDown,
} from "lucide-react";

interface CopyResult {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  framework?: string;
  improvedCopy?: string;
  coachAdvice?: string;
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

export default function DashboardPage() {
  const router = useRouter();

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

  // History & Filtering
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Projects State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
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

  // Appearance & Theme State
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("copycoach_theme");
        if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
          return savedTheme;
        }
      } catch {
        // fallback
      }
    }
    return "dark";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Sync isDarkMode and document HTML class with themeMode
  useEffect(() => {
    const updateTheme = () => {
      let isDark = true;
      if (themeMode === "light") {
        isDark = false;
      } else if (themeMode === "dark") {
        isDark = true;
      } else if (themeMode === "system") {
        isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      setIsDarkMode(isDark);

      if (typeof document !== "undefined") {
        if (isDark) {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      }
    };

    updateTheme();

    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        }
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [themeMode]);

  const applyTheme = (mode: "dark" | "light" | "system") => {
    setThemeMode(mode);
    localStorage.setItem("copycoach_theme", mode);
    if (mode === "dark") showToast("Dark Theme Activated");
    else if (mode === "light") showToast("Light Theme Activated");
    else showToast("System Theme Synchronized");
  };

  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showFullOutput, setShowFullOutput] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

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
      doc.text("Optimized Copy & Line-by-Line AI Critique", 15, 25);

      // Title / Copy Type Metadata
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Document: ${copyType || "Copywriting Drill"}`, 15, 44);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const scoreVal = typeof result === "object" && result?.score ? result.score : 70;
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Tone: ${tone} | Score: ${scoreVal}/100`, 15, 51);

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
      showToast("PDF Document Exported Successfully!");
    } catch (err) {
      console.error("PDF Export failed:", err);
      showToast("PDF Export Failed. Please try again.");
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setProjects(data || []);
    }
  }, []);

  // 4. Load Copy History
  const loadHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHistory(data);
      setTotalCopies(data.length);
      setFavoriteCount(data.filter((i) => i.favorite).length);
    }
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
      setMessage("Please describe your product offer or paste the copy you'd like to improve.");
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
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Generation limit reached or request failed.");
        setLoading(false);
        return;
      }

      const improvedResult = data.result || data.error || "No response received";
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
      showToast("Copy analyzed and optimized successfully!");
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
      showToast(!current ? "Added to favorites" : "Removed from favorites");
    }
  }

  // Delete history item
  async function deleteHistory(id: string) {
    const { error } = await supabase.from("history").delete().eq("id", id);
    if (!error) {
      loadHistory();
      showToast("Item deleted");
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
      showToast(`Project "${data.name}" created!`);
    }
  }

  // Clipboard copy
  function handleCopy(value: string, idKey?: string) {
    navigator.clipboard.writeText(value);
    setCopiedId(idKey || "main");
    showToast("Copied to clipboard!");
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
    showToast("File downloaded!");
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
        setMessage(data.error || "Payment gateway unavailable.");
      }
    } catch (e) {
      console.error(e);
      setMessage("Failed to start payment.");
    }
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
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
    showToast("Sample loaded into workspace");
  };

  return (
    <div className="min-h-screen font-sans text-brand-100 selection:bg-accent selection:text-text-primary">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-4 z-[60] flex items-center gap-2 border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass px-4 py-3 text-sm font-medium text-brand-100 lg:bottom-6 lg:right-6">
          <Check className="h-4 w-4 text-accent-bright" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 border-b border-glass-border bg-glass-bg backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Branding */}
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <Logo theme="dark" size="sm" showTagline={false} />
          </Link>

          {/* Desktop status + workspace controls */}
          <div className="hidden items-center gap-3 md:flex">
            {/* AI Active status badge */}
            <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent-bright">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" />
              AI Active
            </span>

            {/* Plan / Credits badge */}
            <span
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                plan === "pro"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-glass-border bg-glass-bg-elevated text-brand-200"
              }`}
            >
              <Zap className="h-3 w-3" />
              {plan === "pro" ? "Pro Plan" : "Free Plan"} · {credits} credits
            </span>

            {/* Workspace selector */}
            <div className="flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg-elevated px-3.5 py-1.5 text-xs text-brand-200">
              <Folder className="h-3.5 w-3.5 text-accent-bright" />
              <span className="hidden lg:inline">Workspace:</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent font-medium text-text-primary focus:outline-none"
              >
                <option value="" className="bg-ink-800 text-brand-100">Default Workspace</option>
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
              New Project
            </button>
          </div>

          {/* Mobile AI Active chip */}
          <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-accent-bright md:hidden">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" />
            AI Active
          </span>

          {/* User Account Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 rounded-2xl border border-transparent p-1.5 transition-colors hover:bg-glass-bg-hover"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-glass-border bg-glass-bg-elevated text-sm font-bold text-accent-bright">
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatar} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  fullName ? fullName.charAt(0).toUpperCase() : "U"
                )}
              </div>
              <div className="hidden pr-1 text-left sm:block">
                <p className="text-xs font-semibold leading-tight text-text-primary">{fullName || "CopyCoach User"}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium capitalize text-brand-300">
                  <span className={`h-1.5 w-1.5 rounded-full ${plan === "pro" ? "bg-amber-400" : "bg-accent-bright"}`} />
                  {plan === "pro" ? "Pro Plan" : "Free Plan"}
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
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-glass-border bg-glass-bg p-2.5 text-brand-100 backdrop-blur-xl shadow-glass">
                  {/* Profile Header */}
                  <div className="mb-2 rounded-xl border border-glass-border-subtle bg-glass-bg-deep px-3 py-2.5">
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
                        <p className="truncate text-xs font-bold text-text-primary">{fullName || "CopyCoach User"}</p>
                        <p className="mt-0.5 truncate text-[11px] text-brand-300">{userEmail || userId}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-glass-border pt-2 text-[11px] text-brand-300">
                      <span className="flex items-center gap-1 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-accent-bright" />
                        <span>{plan === "pro" ? "Pro Membership" : "Starter Free Plan"}</span>
                      </span>
                      <span className="font-bold text-accent-bright">{credits} Credits Left</span>
                    </div>
                  </div>

                  {/* Account & Settings Group */}
                  <div className="mb-2 space-y-0.5">
                    <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                      Account & Workspace
                    </span>

                    <Link
                      href="/dashboard/admin/feedback"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-brand-200 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-amber-400" />
                        <span>Admin Feedback Triage</span>
                      </div>
                      <span className="rounded border border-amber-800/50 bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">Admin</span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowMenu(false)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-brand-200 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="h-4 w-4 text-accent-bright" />
                        <span>Profile Settings</span>
                      </div>
                      <span className="text-[10px] text-brand-300">Edit</span>
                    </Link>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setProfileTab("brand_voice");
                        setShowProfileModal(true);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-brand-200 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sliders className="h-4 w-4 text-accent-bright" />
                        <span>Brand Voice & AI Persona</span>
                      </div>
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent-bright">Custom</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setProfileTab("billing");
                        setShowProfileModal(true);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-brand-200 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="h-4 w-4 text-amber-400" />
                        <span>Subscription & Plan</span>
                      </div>
                      <span className={`text-[10px] font-bold ${plan === "pro" ? "text-amber-400" : "text-accent-bright"}`}>
                        {plan === "pro" ? "Pro Active" : "Upgrade"}
                      </span>
                    </button>
                  </div>

                  {/* Preferences Group */}
                  <div className="mb-2 space-y-0.5 border-t border-glass-border pt-2">
                    <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                      Preferences
                    </span>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setProfileTab("preferences");
                        setShowProfileModal(true);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-brand-200 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        {isDarkMode ? <Moon className="h-4 w-4 text-accent-bright" /> : <Sun className="h-4 w-4 text-amber-400" />}
                        <span>Appearance & Theme</span>
                      </div>
                      <span className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-0.5 text-[10px] font-medium text-accent-bright">
                        {themeMode === "system" ? "System Sync" : isDarkMode ? "Dark Theme" : "Light Theme"}
                      </span>
                    </button>
                  </div>

                  {/* Resources & Help Group */}
                  <div className="mb-2 space-y-0.5 border-t border-glass-border pt-2">
                    <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                      Support & Tools
                    </span>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowShortcutsModal(true);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-brand-200 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        <Keyboard className="h-4 w-4 text-accent-bright" />
                        <span>Keyboard Shortcuts</span>
                      </div>
                      <span className="font-mono text-[10px] text-brand-300">⌘K</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowSupportModal(true);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-brand-200 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
                    >
                      <div className="flex items-center gap-2.5">
                        <HelpCircle className="h-4 w-4 text-accent-bright" />
                        <span>Help & AI Support</span>
                      </div>
                      <span className="text-[10px] text-brand-300">24/7</span>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <div className="border-t border-glass-border pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-950/50 hover:text-rose-300"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </div>
                      <span className="text-[10px] opacity-70">Exit</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Prominent Persistent Banner Warning for Placeholder Supabase Config */}
      {showConfigBanner && (
        <div className="relative z-30 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3.5 text-amber-200 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-amber-500/20 p-2 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Supabase Configuration Warning
                </p>
                <p className="mt-0.5 text-xs text-amber-200/80">
                  The application is using a placeholder Supabase URL (<code className="rounded bg-black/40 px-1.5 py-0.5 text-amber-300">{activeSupabaseUrl || "placeholder.supabase.co"}</code>). Please set <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-black/40 px-1 py-0.5 text-amber-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in project Settings to enable database features.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300">
                Invalid Configuration Detected
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
            <p className="text-[13px] font-medium text-brand-300">
              Welcome back, {fullName.split(" ")[0] || "Creator"}
            </p>
            <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-text-primary sm:text-3xl">
              Create high-converting copy in seconds
            </h1>
            <p className="mt-1.5 text-sm text-brand-200">
              Describe your offer, choose a category and tone, then let CopyCoach AI do the writing.
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent-bright">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" />
            AI Active
          </span>
        </div>

        {/* STAT CARDS */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {/* Credits & Plan */}
          <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass p-4 sm:p-5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">AI Generation Credits</span>
              <Zap className="h-4 w-4 text-accent-bright" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text-primary">{credits}</span>
                <span className="text-xs text-brand-300">/ {plan === "pro" ? 100 : 5} left today</span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-glass-bg-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent-bright transition-all duration-500"
                  style={{ width: `${Math.min(100, (credits / (plan === "pro" ? 100 : 5)) * 100)}%` }}
                />
              </div>
            </div>
            {plan === "free" ? (
              <button
                onClick={upgradeToPro}
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-accent-bright hover:text-[#7C7CF7]"
              >
                Upgrade to Pro (100 daily)
                <ArrowRight className="h-3.5 w-3.5 transition-transform" />
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Unlimited Pro Access Active
              </span>
            )}
          </div>

          {/* Total Generations */}
          <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass p-4 sm:p-5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">Total Copy Improvements</span>
              <FileText className="h-4 w-4 text-accent-bright" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-text-primary">{totalCopies}</div>
              <p className="mt-1 text-xs text-brand-300">Saved in history library</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-brand-300">
              <TrendingUp className="h-3.5 w-3.5 text-accent-bright" />
              Real-time persistence
            </span>
          </div>

          {/* Favorites */}
          <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass p-4 sm:p-5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">Starred Favorites</span>
              <Star className="h-4 w-4 fill-amber-500/20 text-amber-500" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-text-primary">{favoriteCount}</div>
              <p className="mt-1 text-xs text-brand-300">High-converting snippets</p>
            </div>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              {showFavorites ? "View All Copies" : "Filter Favorites"}
            </button>
          </div>

          {/* Projects */}
          <div className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass p-4 sm:p-5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">Active Projects</span>
              <Layers className="h-4 w-4 text-accent-bright" />
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-text-primary">{projects.length}</div>
              <p className="mt-1 text-xs text-brand-300">Organized campaigns</p>
            </div>
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-accent-bright hover:text-[#7C7CF7]"
            >
              + Create Project
            </button>
          </div>
        </div>

        {/* WORKSPACE GRID: LEFT INPUT & RIGHT OUTPUT */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT PANEL: GENERATOR FORM */}
          <div className="flex flex-col justify-between rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass md:col-span-7">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-glass-border p-6">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                  <Sparkles className="h-5 w-5 text-accent-bright" />
                  CopyCoach AI Studio
                </h2>
                <p className="mt-1 text-xs text-brand-300">
                  Build your product offer, category, and tone — then let CopyCoach AI write copy that converts.
                </p>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent-bright sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-bright" />
                AI Ready
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-8 p-6">
              {/* Section 1: Select Category */}
              <section>
                <SectionHeading
                  number="1"
                  title="Select Category"
                  subtitle="What type of marketing copy are you creating?"
                />
                <div className="mt-4">
                  <CategorySelector value={copyType} onChange={setCopyType} />
                </div>
              </section>

              {/* Section 2: Offer & Product Details */}
              <section>
                <SectionHeading
                  number="2"
                  title="Offer & Product Details"
                  subtitle="Tell CopyCoach about your offer so it can write copy that converts."
                />
                <div className="mt-5 rounded-2xl border border-glass-border-subtle bg-glass-bg-deep p-5">
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
                  number="3"
                  title="Select Tone of Voice"
                  subtitle="How should your brand sound?"
                />
                <div className="mt-4">
                  <ToneSelector value={tone} onChange={setTone} />
                </div>
              </section>

              {/* Inline error message */}
              {message && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-800/60 bg-rose-950/60 p-3.5 text-xs text-rose-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  <span>{message}</span>
                </div>
              )}

              {/* Generate CTA */}
              <div className="mt-auto pt-2">
                <GenerateButton
                  loading={loading}
                  disabled={loading || credits <= 0}
                  onClick={improveCopy}
                />

                {credits <= 0 && !loading && (
                  <p className="mt-2 text-center text-xs text-amber-400">
                    You&apos;ve used all your free credits.{" "}
                    <button onClick={upgradeToPro} className="font-semibold underline underline-offset-2 hover:text-amber-300">
                      Upgrade to Pro
                    </button>{" "}
                    for 100 daily generations.
                  </p>
                )}

                <div className="mt-5">
                  <ProTipCard />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: AI COACHING OUTPUT */}
          <div className="flex min-h-[480px] flex-col rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass md:col-span-5">
            {result ? (
              <div className="flex flex-1 flex-col gap-5 p-6">
                {/* Score header */}
                <div className="flex items-center justify-between border-b border-glass-border pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">AI Copy Evaluation</span>
                    <h3 className="mt-0.5 flex items-center gap-2 text-lg font-bold text-text-primary">
                      <BarChart3 className="h-5 w-5 text-accent-bright" />
                      Optimization Score
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-3xl font-extrabold ${
                        (typeof result === "object" && result.score && result.score >= 80)
                          ? "text-emerald-400"
                          : (typeof result === "object" && result.score && result.score >= 60)
                          ? "text-amber-400"
                          : "text-accent-bright"
                      }`}
                    >
                      {typeof result === "object" && result.score ? `${result.score}/100` : "70/100"}
                    </span>
                    <p className="text-[10px] uppercase tracking-wider text-brand-300">Conversion Ready</p>
                  </div>
                </div>

                {/* Framework & Strengths */}
                {typeof result === "object" && (
                  <div className="space-y-3">
                    {result.framework && (
                      <div className="flex items-center justify-between rounded-xl border border-glass-border-subtle bg-glass-bg-deep p-3 text-xs text-brand-200">
                        <span className="text-brand-300">Framework Applied:</span>
                        <span className="rounded bg-accent/15 px-2.5 py-0.5 font-semibold text-accent-bright">
                          {result.framework}
                        </span>
                      </div>
                    )}

                    {result.weaknesses && result.weaknesses.length > 0 && (
                      <div className="space-y-1.5 rounded-xl border border-glass-border-subtle bg-glass-bg-deep p-3.5 text-xs">
                        <div className="mb-1 flex items-center gap-1.5 font-semibold text-rose-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Areas to Improve
                        </div>
                        <ul className="space-y-1 text-brand-200">
                          {result.weaknesses.map((w, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="font-bold text-rose-400">•</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.strengths && result.strengths.length > 0 && (
                      <div className="space-y-1.5 rounded-xl border border-glass-border-subtle bg-glass-bg-deep p-3.5 text-xs">
                        <div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Key Strengths Identified
                        </div>
                        <ul className="space-y-1 text-brand-200">
                          {result.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="font-bold text-emerald-400">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.coachAdvice && (
                      <div className="space-y-1 rounded-xl border border-glass-border-subtle bg-glass-bg-deep p-3.5 text-xs">
                        <div className="mb-1 flex items-center gap-1.5 font-semibold text-amber-400">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Coach Advice
                        </div>
                        <p className="leading-relaxed text-brand-200">{result.coachAdvice}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Improved Copy Output Box */}
                <div className="relative rounded-2xl border border-accent/30 bg-glass-bg-deep p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent-bright">
                      <Award className="h-3.5 w-3.5" />
                      Optimized Copy Version
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportPDF(typeof result === "object" ? result.improvedCopy || "" : String(result))}
                        className="inline-flex items-center gap-1 rounded-lg border border-glass-border bg-glass-bg-elevated px-2.5 py-1 text-[11px] font-semibold text-accent-bright transition-colors hover:bg-glass-bg-hover"
                        title="Export as PDF"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        Export PDF
                      </button>

                      <button
                        onClick={() => setShowFullOutput(true)}
                        className="inline-flex items-center gap-1 rounded-lg border border-glass-border bg-glass-bg-elevated px-2.5 py-1 text-[11px] font-semibold text-brand-200 transition-colors hover:bg-glass-bg-hover"
                        title="Expand to Full View"
                      >
                        <Maximize2 className="h-3.5 w-3.5 text-accent-bright" />
                        Show Full
                      </button>

                      <button
                        onClick={() =>
                          handleCopy(
                            typeof result === "object" ? result.improvedCopy || "" : String(result),
                            "result"
                          )
                        }
                        className="rounded-lg bg-glass-bg-elevated p-1.5 text-brand-200 transition-colors hover:bg-glass-bg-hover"
                        title="Copy text"
                      >
                        {copiedId === "result" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() =>
                          handleDownload(
                            typeof result === "object" ? result.improvedCopy || "" : String(result)
                          )
                        }
                        className="rounded-lg bg-glass-bg-elevated p-1.5 text-brand-200 transition-colors hover:bg-glass-bg-hover"
                        title="Download text"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-brand-100">
                    {typeof result === "object" ? result.improvedCopy : String(result)}
                  </p>

                  {/* Inline Drill Critique Feedback */}
                  <div className="mt-4 border-t border-glass-border pt-3">
                    <DrillCritiqueFeedback
                      userCopyInput={text}
                      aiOutputString={typeof result === "object" ? result.improvedCopy : String(result)}
                      userTier={plan === "pro" ? "Pro" : "Spark"}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-accent/30 bg-glass-bg-deep text-accent-bright">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-text-primary">Awaiting Copy Analysis</h3>
                <p className="max-w-xs text-xs leading-relaxed text-brand-300">
                  Enter your offer on the left and click <strong className="text-brand-100">Generate AI Marketing Copy</strong> to receive AI scoring, strategic recommendations, and high-converting rewrites.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* LIBRARY / COPY HISTORY */}
        <section id="copy-library" className="mt-4 scroll-mt-24">
          <div className="rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-glass p-5 sm:p-7">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                  <FileText className="h-5 w-5 text-accent-bright" />
                  Copy History & Saved Library
                </h2>
                <p className="mt-0.5 text-xs text-brand-200">
                  Manage, filter, copy, or export your past optimized copy generations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {plan === "free" ? (
                  <button
                    onClick={upgradeToPro}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-deep to-accent-bright px-3.5 py-2 text-xs font-bold text-text-primary shadow-accent-soft transition-colors hover:opacity-90"
                  >
                    Upgrade to Pro
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Pro Active
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-300" />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg py-2 pl-9 pr-3 text-xs text-brand-100 sm:w-56"
                    />
                  </div>

                  <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      showFavorites
                        ? "border-amber-500/40 bg-amber-500/20 text-amber-400"
                        : "border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${showFavorites ? "fill-amber-400" : ""}`} />
                    {showFavorites ? "Starred Only" : "All Copies"}
                  </button>
                </div>
              </div>
            </div>

            {/* History Cards */}
            {filteredHistory.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-glass-border bg-glass-bg-deep p-5 transition-all hover:border-glass-border"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-bright">
                            {item.copy_type || "Copy"}
                          </span>
                          <span className="rounded bg-glass-bg-elevated px-2 py-0.5 text-[11px] text-brand-300">
                            Tone: {item.tone || "Default"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleFavorite(item.id, item.favorite)}
                            className={`rounded-lg border p-1.5 transition-colors ${
                              item.favorite
                                ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                                : "border-glass-border bg-glass-bg-elevated text-brand-300 hover:text-text-primary"
                            }`}
                            title="Star favorite"
                          >
                            <Star className={`h-3.5 w-3.5 ${item.favorite ? "fill-amber-300" : ""}`} />
                          </button>

                          <button
                            onClick={() => handleCopy(item.improved_text, item.id)}
                            className="rounded-lg border border-glass-border bg-glass-bg-elevated p-1.5 text-brand-300 transition-colors hover:text-text-primary"
                            title="Copy text"
                          >
                            {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDownload(item.improved_text, `${item.copy_type || "copy"}-improved.txt`)}
                            className="rounded-lg border border-glass-border bg-glass-bg-elevated p-1.5 text-brand-300 transition-colors hover:text-text-primary"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => deleteHistory(item.id)}
                            className="rounded-lg border border-glass-border bg-glass-bg-elevated p-1.5 text-brand-300 transition-colors hover:bg-rose-950/60 hover:text-rose-300"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="mb-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-brand-100 line-clamp-4">
                        {item.improved_text}
                      </p>
                    </div>

                    {item.original_text && (
                      <div className="flex items-center justify-between border-t border-glass-border pt-2.5 text-[11px] text-brand-300">
                        <span className="max-w-[240px] truncate">Original: &quot;{item.original_text}&quot;</span>
                        <span className="shrink-0">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-glass-border py-12 text-center text-xs text-brand-300">
                No saved copy history found. Run a copy improvement above to populate your library!
              </div>
            )}
          </div>
        </section>
      </main>

      {/* NEW PROJECT MODAL */}
      {showProjectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowProjectModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-glass-border bg-glass-bg p-6 backdrop-blur-xl shadow-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-text-primary">
              <FolderPlus className="h-5 w-5 text-accent-bright" />
              Create New Project Workspace
            </h3>
            <p className="mb-5 text-xs text-brand-200">
              Organize campaigns, clients, or product lines into separate workspaces.
            </p>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Summer Marketing Campaign"
                className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-sm text-brand-100"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowProjectModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="rounded-xl bg-gradient-to-r from-accent-deep to-accent-bright px-5 py-2 text-xs font-bold text-text-primary shadow-accent-soft transition-colors hover:opacity-90"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PROFILE & SETTINGS MODAL */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-md sm:p-6"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="my-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-glass-border bg-glass-bg text-brand-100 backdrop-blur-xl shadow-glass"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-glass-border bg-glass-bg-deep p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 text-accent-bright">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Profile & Account Settings</h3>
                  <p className="text-xs text-brand-200">Manage your persona, brand voices, security, and preferences</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
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
                      ? "bg-accent text-text-primary shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Personal Profile
                </button>

                <button
                  onClick={() => setProfileTab("brand_voice")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "brand_voice"
                      ? "bg-accent text-text-primary shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  Brand Voice
                </button>

                <button
                  onClick={() => setProfileTab("preferences")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "preferences"
                      ? "bg-accent text-text-primary shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Theme & AI Engine
                </button>

                <button
                  onClick={() => setProfileTab("security")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "security"
                      ? "bg-accent text-text-primary shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Security
                </button>

                <button
                  onClick={() => setProfileTab("billing")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "billing"
                      ? "bg-accent text-text-primary shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Subscription
                </button>

                <button
                  onClick={() => setProfileTab("support")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    profileTab === "support"
                      ? "bg-accent text-text-primary shadow-accent-soft"
                      : "border border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:text-text-primary"
                  }`}
                >
                  <LifeBuoy className="h-4 w-4" />
                  Support Hub
                </button>
              </div>

              {/* TAB 1: PERSONAL PROFILE */}
              {profileTab === "profile" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. S_last_born"
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        Email Address
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
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Copywriter"
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. CopyCoach Labs"
                        className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      Bio & Strategic Copy Goals
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Briefly describe your copywriting goals..."
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
                        Target Audience
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
                        Brand Niche
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
                      Custom Brand Guidelines
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
                      Theme Mode
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
                        Dark Mode
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTheme("light")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                          themeMode === "light"
                            ? "border-amber-400 bg-amber-500 font-bold text-ink-950"
                            : "border-glass-border-subtle bg-glass-bg-deep text-brand-300 hover:bg-glass-bg-hover hover:text-brand-100"
                        }`}
                      >
                        <Sun className="h-4 w-4" />
                        Light Mode
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
                        System Sync
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      Default AI Engine
                    </label>
                    <select
                      value={preferredModel}
                      onChange={(e) => setPreferredModel(e.target.value)}
                      className="cc-input w-full cursor-pointer rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                    >
                      <option value="Gemini 2.5 Flash (Recommended)">Gemini 2.5 Flash (Recommended - Super Fast)</option>
                      <option value="Gemini 2.5 Pro (Deep Copywriting Reasoning)">Gemini 2.5 Pro (Deep Strategy)</option>
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
                        New Password
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
                        Confirm Password
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
                      <p className="text-xs font-semibold text-text-primary">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-brand-300">Add an extra layer of security to your CopyCoach account</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        showToast(!twoFactorEnabled ? "2FA Enabled" : "2FA Disabled");
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        twoFactorEnabled ? "bg-emerald-500 text-ink-950" : "bg-glass-bg-elevated text-brand-200"
                      }`}
                    >
                      {twoFactorEnabled ? "Enabled" : "Enable"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: BILLING & SUBSCRIPTION */}
              {profileTab === "billing" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-accent/10 to-accent/10 p-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Current Plan</span>
                      <h4 className="text-lg font-bold capitalize text-text-primary">{plan} Plan</h4>
                      <p className="mt-0.5 text-xs text-brand-200">
                        {plan === "pro" ? "100 AI Generations Daily" : "5 Free Generations Daily"}
                      </p>
                    </div>

                    {plan !== "pro" && (
                      <button
                        type="button"
                        onClick={upgradeToPro}
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-xs font-bold text-ink-950 shadow-accent-soft"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SUPPORT HUB */}
              {profileTab === "support" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs font-medium text-emerald-300">
                    <Activity className="h-4 w-4 animate-pulse text-emerald-400" />
                    CopyCoach AI Status: All Systems Operational (100% Uptime)
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                      Submit Support Ticket
                    </label>
                    <input
                      type="text"
                      placeholder="Subject line..."
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="cc-input mb-3 w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                    />
                    <textarea
                      rows={3}
                      placeholder="Describe your issue or question..."
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
                  Close
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem("copycoach_user_settings", JSON.stringify({
                      role, company, bio, targetAudience, brandNiche, preferredLanguage, brandGuidelines, preferredModel
                    }));
                    showToast("Profile Settings Saved Successfully!");
                    setShowProfileModal(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-deep to-accent-bright px-6 py-2 text-xs font-bold text-text-primary shadow-accent-soft transition-colors hover:opacity-90"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-glass-border bg-glass-bg p-6 backdrop-blur-xl shadow-glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <Keyboard className="h-5 w-5 text-accent-bright" />
                Keyboard Shortcuts & Productivity
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-lg p-1 text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">Run Copy Optimization</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">⌘</kbd>
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">Enter</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">Toggle Star Favorite</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">⌘</kbd>
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">F</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">Copy Improved Text</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">⌘</kbd>
                  <kbd className="rounded border border-glass-border bg-glass-bg-elevated px-2 py-1 text-accent-bright">C</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-glass-input-border bg-glass-input-bg p-3 text-xs">
                <span className="text-brand-200">Create New Project</span>
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP & AI SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-glass-border bg-glass-bg p-6 backdrop-blur-xl shadow-glass">
            <div className="mb-4 flex items-center justify-between border-b border-glass-border pb-3">
              <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <HelpCircle className="h-5 w-5 text-accent-bright" />
                CopyCoach AI Support & Feedback
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="rounded-lg p-1 text-brand-300 transition-colors hover:bg-glass-bg-hover hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-brand-200">
              Have a question about your copy analysis or need help setting up custom brand voices? Send us a message and our team will assist you shortly.
            </p>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g., Custom Brand Tone Request"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="cc-input w-full rounded-xl border border-glass-input-border bg-glass-input-bg px-4 py-2.5 text-xs text-brand-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-300">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or feedback..."
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
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSupportModal(false);
                  setSupportSubject("");
                  setSupportMessage("");
                  showToast("Support ticket submitted! We'll reply via email.");
                }}
                className="rounded-xl bg-gradient-to-r from-accent-deep to-accent-bright px-5 py-2 text-xs font-bold text-text-primary shadow-accent-soft transition-colors hover:opacity-90"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}