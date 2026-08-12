"use client";

import { useEffect, useState, useCallback } from "react";
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
  RefreshCw,
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
  ExternalLink,
  Activity,
  Laptop
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

  // Copy Generator Inputs & Outputs
  const [text, setText] = useState("");
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
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

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
  const loadProfile = useCallback(async (id: string, userObj: { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string; picture?: string } }) => {
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
      setMessage("Please enter or paste some copy to analyze and improve.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({
          text,
          copyType,
          tone
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, userId: user.id })
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
    <div className={`min-h-screen font-sans transition-colors duration-200 selection:bg-cyan-500 selection:text-slate-950 ${isDarkMode ? "bg-[#0B1020] text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 border ${isDarkMode ? "bg-slate-900 border-cyan-500/40 text-cyan-200" : "bg-white border-cyan-500 text-slate-800"}`}>
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Professional Header Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 ${isDarkMode ? "bg-[#0B1020]/90 border-slate-800/80" : "bg-white/95 border-slate-200/80 shadow-xs"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand Branding */}
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
            <Logo theme={isDarkMode ? "dark" : "light"} size="md" showTagline={true} />
          </Link>

          {/* Quick Active Project Indicator & Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className={`flex items-center gap-2 border rounded-xl px-3.5 py-1.5 text-xs transition-colors ${isDarkMode ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>Workspace:</span>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className={`bg-transparent font-medium focus:outline-none cursor-pointer ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                <option value="" className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>Default Workspace</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className={isDarkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 hover:bg-cyan-900/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center gap-3 p-1.5 rounded-2xl border transition-all cursor-pointer ${isDarkMode ? "hover:bg-slate-800/60 border-transparent hover:border-slate-800 text-slate-200" : "hover:bg-slate-200/60 border-transparent hover:border-slate-300 text-slate-800"}`}
            >
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-800 border border-cyan-500/30 flex items-center justify-center font-bold text-sm text-cyan-400 shrink-0">
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={avatar} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  fullName ? fullName.charAt(0).toUpperCase() : "U"
                )}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <p className={`text-xs font-semibold leading-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>{fullName || "CopyCoach User"}</p>
                <p className={`text-[11px] font-medium capitalize mt-0.5 flex items-center gap-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${plan === "pro" ? "bg-amber-400" : "bg-cyan-400"}`} />
                  {plan === "pro" ? "Pro Plan" : "Free Plan"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Comprehensive Professional Dropdown Menu */}
            {showMenu && (
              <div className={`absolute right-0 mt-2 w-72 rounded-2xl border p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl ${isDarkMode ? "bg-slate-900 border-slate-800/90 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-xl"}`}>
                {/* Profile Header */}
                <div className={`px-3 py-2.5 border rounded-xl mb-2 ${isDarkMode ? "bg-slate-950/80 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300 shrink-0">
                      {avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={avatar} alt={fullName} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        fullName ? fullName.charAt(0).toUpperCase() : "U"
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>{fullName || "CopyCoach User"}</p>
                      <p className={`text-[11px] truncate mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{userEmail || userId}</p>
                    </div>
                  </div>

                  <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${isDarkMode ? "border-slate-800/60 text-slate-400" : "border-slate-200 text-slate-600"}`}>
                    <span className="font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{plan === "pro" ? "Pro Membership" : "Starter Free Plan"}</span>
                    </span>
                    <span className="font-bold text-cyan-400">{credits} Credits Left</span>
                  </div>
                </div>

                {/* Account & Settings Group */}
                <div className="space-y-0.5 mb-2">
                  <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Account & Workspace
                  </span>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setProfileTab("profile");
                      setShowProfileModal(true);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${isDarkMode ? "text-slate-200 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span>Profile Settings</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setProfileTab("brand_voice");
                      setShowProfileModal(true);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${isDarkMode ? "text-slate-200 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>Brand Voice & AI Persona</span>
                    </div>
                    <span className="text-[10px] text-purple-400/80 bg-purple-950/40 px-1.5 py-0.5 rounded">Custom</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setProfileTab("billing");
                      setShowProfileModal(true);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${isDarkMode ? "text-slate-200 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>Subscription & Plan</span>
                    </div>
                    <span className={`text-[10px] font-bold ${plan === "pro" ? "text-amber-400" : "text-cyan-400"}`}>
                      {plan === "pro" ? "Pro Active" : "Upgrade"}
                    </span>
                  </button>
                </div>

                {/* Preferences Group */}
                <div className={`pt-2 border-t space-y-0.5 mb-2 ${isDarkMode ? "border-slate-800/80" : "border-slate-200"}`}>
                  <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Preferences
                  </span>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setProfileTab("preferences");
                      setShowProfileModal(true);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${isDarkMode ? "text-slate-200 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isDarkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                      <span>Appearance & Theme</span>
                    </div>
                    <span className="text-[10px] font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
                      {themeMode === "system" ? "System Sync" : isDarkMode ? "Dark Theme" : "Light Theme"}
                    </span>
                  </button>
                </div>

                {/* Resources & Help Group */}
                <div className="pt-2 border-t border-slate-800/80 space-y-0.5 mb-2">
                  <span className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Support & Tools
                  </span>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowShortcutsModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Keyboard className="w-4 h-4 text-emerald-400" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">⌘K</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowSupportModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>Help & AI Support</span>
                    </div>
                    <span className="text-[10px] text-slate-500">24/7</span>
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </div>
                    <span className="text-[10px] opacity-70">Exit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Prominent Persistent Banner Warning for Placeholder Supabase Config */}
      {showConfigBanner && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 px-4 py-3.5 sm:px-6 relative z-30">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Supabase Configuration Warning
                </p>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  The application is using a placeholder Supabase URL (<code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">{activeSupabaseUrl || "placeholder.supabase.co"}</code>). Please set <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in project Settings to enable database features.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg font-medium">
                Invalid Configuration Detected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Analytics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Credits & Plan Gauge */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group transition-colors ${isDarkMode ? "bg-slate-900/60 border-slate-800/90 text-slate-100" : "bg-white border-slate-200/90 text-slate-900 shadow-xs"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>AI Generation Credits</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{credits}</span>
                <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>/ {plan === "pro" ? 100 : 5} left today</span>
              </div>
              <div className={`w-full rounded-full h-2 mt-2.5 overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}>
                <div
                  className="bg-gradient-to-r from-cyan-400 to-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (credits / (plan === "pro" ? 100 : 5)) * 100)}%` }}
                />
              </div>
            </div>
            {plan === "free" ? (
              <button
                onClick={upgradeToPro}
                className="text-xs font-semibold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 group/btn cursor-pointer"
              >
                <span>Upgrade to Pro (100 daily)</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            ) : (
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unlimited Pro Access Active</span>
              </span>
            )}
          </div>

          {/* Stat 2: Total Generations */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-colors ${isDarkMode ? "bg-slate-900/60 border-slate-800/90 text-slate-100" : "bg-white border-slate-200/90 text-slate-900 shadow-xs"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Total Copy Improvements</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="my-3">
              <div className={`text-3xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{totalCopies}</div>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Saved in history library</p>
            </div>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Real-time persistence</span>
            </span>
          </div>

          {/* Stat 3: Favorites Saved */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-colors ${isDarkMode ? "bg-slate-900/60 border-slate-800/90 text-slate-100" : "bg-white border-slate-200/90 text-slate-900 shadow-xs"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Starred Favorites</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            </div>
            <div className="my-3">
              <div className={`text-3xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{favoriteCount}</div>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>High-converting snippets</p>
            </div>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="text-xs font-semibold text-amber-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
            >
              <span>{showFavorites ? "View All Copies" : "Filter Favorites"}</span>
            </button>
          </div>

          {/* Stat 4: Active Workspaces */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-colors ${isDarkMode ? "bg-slate-900/60 border-slate-800/90 text-slate-100" : "bg-white border-slate-200/90 text-slate-900 shadow-xs"}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Active Projects</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <div className="my-3">
              <div className={`text-3xl font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{projects.length}</div>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Organized campaigns</p>
            </div>
            <button
              onClick={() => setShowProjectModal(true)}
              className="text-xs font-semibold text-purple-500 hover:text-purple-600 flex items-center gap-1 cursor-pointer"
            >
              <span>+ Create Project</span>
            </button>
          </div>
        </div>

        {/* WORKSPACE GRID: LEFT INPUT & RIGHT OUTPUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* LEFT PANEL: INPUT FORM & STARTERS */}
          <div className={`lg:col-span-7 border rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-colors ${isDarkMode ? "bg-slate-900/70 border-slate-800 text-slate-100" : "bg-white border-slate-200/90 text-slate-900 shadow-md"}`}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    <span>CopyCoach AI Studio</span>
                  </h2>
                  <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Paste raw copy to receive strategic coaching, score analysis, and instant AI optimization.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className={`text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Tone:</span>
                  <span className="text-xs font-medium text-cyan-500 bg-cyan-50 border border-cyan-200 dark:bg-cyan-950/60 dark:border-cyan-800/40 dark:text-cyan-300 px-2.5 py-1 rounded-lg">
                    {tone}
                  </span>
                </div>
              </div>

              {/* Selector Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Content Type
                  </label>
                  <select
                    value={copyType}
                    onChange={(e) => setCopyType(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer ${isDarkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-800"}`}
                  >
                    <option value="Advertisement">Social Media & Search Ad</option>
                    <option value="Email">Sales & Nurture Email</option>
                    <option value="Landing Page">Landing Page & Hero Headline</option>
                    <option value="Social Media">LinkedIn & Twitter Post</option>
                    <option value="Blog">Blog Post & Article Intro</option>
                    <option value="Product Description">E-commerce Product Copy</option>
                    <option value="SMS">SMS & Push Notification</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Brand Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer ${isDarkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-800"}`}
                  >
                    <option value="Professional">Professional & Direct</option>
                    <option value="Persuasive">Persuasive & High Energy</option>
                    <option value="Bold & Punchy">Bold & Punchy</option>
                    <option value="Friendly">Conversational & Warm</option>
                    <option value="Luxury">Luxury & Premium</option>
                    <option value="Urgent">Urgent & FOMO Driven</option>
                    <option value="Witty">Witty & Engaging</option>
                  </select>
                </div>
              </div>

              {/* Quick Prompt Starters */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Templates</span>
                  </span>
                  {text && (
                    <button
                      onClick={() => setText("")}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Clear Input
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => insertSample("Double your sales team efficiency with our AI CRM platform that automates follow-ups in seconds.", "Advertisement", "Bold & Punchy")}
                    className={`text-xs border px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"}`}
                  >
                    ⚡ SaaS Ad Headline
                  </button>
                  <button
                    onClick={() => insertSample("Hey John, you left something behind in your cart! Grab your discount before midnight.", "Email", "Urgent")}
                    className={`text-xs border px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"}`}
                  >
                    🛒 Cart Abandonment Email
                  </button>
                  <button
                    onClick={() => insertSample("Transform your morning routine with our organic cold-pressed matcha blend.", "Product Description", "Luxury")}
                    className={`text-xs border px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"}`}
                  >
                    ✨ E-commerce Hook
                  </button>
                </div>
              </div>

              {/* Main Copy Input Box */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or write your raw copywriting draft here... (e.g. ad hooks, email subject lines, landing page copy)"
                  className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-sans ${isDarkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"}`}
                />
                <div className={`absolute bottom-3 right-4 text-[11px] font-mono ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {text.length} chars
                </div>
              </div>

              {message && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
            </div>

            {/* Action Trigger Button */}
            <div className={`mt-6 pt-4 border-t flex items-center justify-between ${isDarkMode ? "border-slate-800/80" : "border-slate-200"}`}>
              <span className={`text-xs hidden sm:inline ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Cost: <strong className={isDarkMode ? "text-slate-200" : "text-slate-800"}>1 Credit</strong>
              </span>

              <button
                onClick={improveCopy}
                disabled={loading || credits <= 0}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing & Refining Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                    <span>Improve Copy with CopyCoach AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: REAL-TIME AI COACHING ANALYSIS & OUTPUT */}
          <div className={`lg:col-span-5 border rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl min-h-[480px] transition-colors ${isDarkMode ? "bg-slate-900/70 border-slate-800 text-slate-100" : "bg-white border-slate-200/90 text-slate-900 shadow-md"}`}>
            {result ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Header with Score */}
                <div className={`flex items-center justify-between border-b pb-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>AI Copy Evaluation</span>
                    <h3 className={`text-lg font-bold flex items-center gap-2 mt-0.5 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      <BarChart3 className="w-5 h-5 text-cyan-500" />
                      <span>Optimization Score</span>
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-3xl font-extrabold ${
                        (typeof result === "object" && result.score && result.score >= 80)
                          ? "text-emerald-500"
                          : (typeof result === "object" && result.score && result.score >= 60)
                          ? "text-amber-500"
                          : "text-cyan-500"
                      }`}
                    >
                      {typeof result === "object" && result.score ? `${result.score}/100` : "85/100"}
                    </span>
                    <p className={`text-[10px] uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Conversion Ready</p>
                  </div>
                </div>

                {/* Framework & Strengths */}
                {typeof result === "object" && (
                  <div className="grid grid-cols-1 gap-3">
                    {result.framework && (
                      <div className={`border p-3 rounded-xl flex items-center justify-between text-xs ${isDarkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Framework Applied:</span>
                        <span className="font-semibold text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40">
                          {result.framework}
                        </span>
                      </div>
                    )}

                    {result.strengths && result.strengths.length > 0 && (
                      <div className={`border p-3.5 rounded-xl text-xs space-y-1.5 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                        <div className="font-semibold text-emerald-500 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Key Strengths Identified</span>
                        </div>
                        <ul className={`space-y-1 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                          {result.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.coachAdvice && (
                      <div className={`border p-3.5 rounded-xl text-xs space-y-1 ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                        <div className="font-semibold text-amber-500 flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Coach Advice</span>
                        </div>
                        <p className={`leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>{result.coachAdvice}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Improved Copy Output Box */}
                <div className={`border rounded-2xl p-4.5 shadow-xs relative ${isDarkMode ? "bg-slate-950 border-cyan-500/30 text-slate-100" : "bg-slate-50 border-cyan-400 text-slate-900"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Optimized Copy Version</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopy(
                            typeof result === "object" ? result.improvedCopy || "" : String(result),
                            "result"
                          )
                        }
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? "bg-slate-900 hover:bg-slate-800 text-slate-300" : "bg-white hover:bg-slate-200 text-slate-700"}`}
                        title="Copy text"
                      >
                        {copiedId === "result" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() =>
                          handleDownload(
                            typeof result === "object" ? result.improvedCopy || "" : String(result)
                          )
                        }
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? "bg-slate-900 hover:bg-slate-800 text-slate-300" : "bg-white hover:bg-slate-200 text-slate-700"}`}
                        title="Download text"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-sm whitespace-pre-wrap font-sans leading-relaxed ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}>
                    {typeof result === "object" ? result.improvedCopy : String(result)}
                  </p>
                </div>
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className={`h-16 w-16 rounded-3xl border flex items-center justify-center mb-4 text-cyan-500 shadow-xl ${isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Awaiting Copy Analysis</h3>
                <p className={`text-xs max-w-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Enter your copy on the left and click <strong className={isDarkMode ? "text-slate-200" : "text-slate-800"}>&quot;Improve Copy&quot;</strong> to receive AI scoring, strategic recommendations, and high-converting rewrites.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: COPY HISTORY & SAVED LIBRARY */}
        <div className={`border rounded-3xl p-6 sm:p-8 transition-colors ${isDarkMode ? "bg-slate-900/60 border-slate-800 text-slate-100" : "bg-white border-slate-200/90 text-slate-900 shadow-md"}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                <FileText className="w-5 h-5 text-cyan-500" />
                <span>Copy History & Saved Library</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Manage, filter, copy, or export your past optimized copy generations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cyan-500 ${isDarkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-300 text-slate-800"}`}
                />
              </div>

              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  showFavorites
                    ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                    : isDarkMode
                    ? "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    : "bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${showFavorites ? "fill-amber-500" : ""}`} />
                <span>{showFavorites ? "Starred Only" : "All Copies"}</span>
              </button>
            </div>
          </div>

          {/* History Cards List */}
          {filteredHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl ${isDarkMode ? "bg-slate-950/80 border-slate-800/80 hover:border-slate-700/80 text-slate-100" : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-900"}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-md">
                          {item.copy_type || "Copy"}
                        </span>
                        <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                          Tone: {item.tone || "Default"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleFavorite(item.id, item.favorite)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            item.favorite
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                          title="Star favorite"
                        >
                          <Star className={`w-3.5 h-3.5 ${item.favorite ? "fill-amber-300" : ""}`} />
                        </button>

                        <button
                          onClick={() => handleCopy(item.improved_text, item.id)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDownload(item.improved_text, `${item.copy_type || "copy"}-improved.txt`)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteHistory(item.id)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-4 leading-relaxed font-sans mb-3">
                      {item.improved_text}
                    </p>
                  </div>

                  {item.original_text && (
                    <div className="pt-2.5 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="truncate max-w-[240px]">Original: &quot;{item.original_text}&quot;</span>
                      <span className="shrink-0">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              No saved copy history found. Run a copy improvement above to populate your library!
            </div>
          )}
        </div>
      </main>

      {/* NEW PROJECT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-cyan-400" />
              <span>Create New Project Workspace</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Organize campaigns, clients, or product lines into separate workspaces.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Summer Marketing Campaign"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PROFILE & SETTINGS MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className={`border rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 my-auto max-h-[90vh] flex flex-col overflow-hidden transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"}`}>
            {/* Modal Top Header */}
            <div className={`p-5 sm:p-6 border-b flex items-center justify-between shrink-0 ${isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Profile & Account Settings</h3>
                  <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Manage your persona, brand voices, security, and preferences</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-900"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Tab Navigation Pill Bar */}
              <div className={`flex flex-wrap items-center gap-2 border-b pb-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
                <button
                  onClick={() => setProfileTab("profile")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "profile"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : isDarkMode
                      ? "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Personal Profile</span>
                </button>

                <button
                  onClick={() => setProfileTab("brand_voice")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "brand_voice"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : isDarkMode
                      ? "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Brand Voice</span>
                </button>

                <button
                  onClick={() => setProfileTab("preferences")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "preferences"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : isDarkMode
                      ? "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Theme & AI Engine</span>
                </button>

                <button
                  onClick={() => setProfileTab("security")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "security"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : isDarkMode
                      ? "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security</span>
                </button>

                <button
                  onClick={() => setProfileTab("billing")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "billing"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : isDarkMode
                      ? "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Subscription</span>
                </button>

                <button
                  onClick={() => setProfileTab("support")}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    profileTab === "support"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : isDarkMode
                      ? "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>Support Hub</span>
                </button>
              </div>

              {/* TAB 1: PERSONAL PROFILE */}
              {profileTab === "profile" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. S_last_born"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userEmail || "user@example.com"}
                        disabled
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-400 opacity-80 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Copywriter"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. CopyCoach Labs"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Bio & Strategic Copy Goals
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Briefly describe your copywriting goals..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: BRAND VOICE */}
              {profileTab === "brand_voice" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Brand Niche
                      </label>
                      <input
                        type="text"
                        value={brandNiche}
                        onChange={(e) => setBrandNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Custom Brand Guidelines
                    </label>
                    <textarea
                      rows={4}
                      value={brandGuidelines}
                      onChange={(e) => setBrandGuidelines(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: THEME & AI PREFERENCES */}
              {profileTab === "preferences" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Theme Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => applyTheme("dark")}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          themeMode === "dark"
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                            : isDarkMode
                            ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            : "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                        }`}
                      >
                        <Moon className="w-4 h-4 text-indigo-300" />
                        <span>Dark Mode</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTheme("light")}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          themeMode === "light"
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20"
                            : isDarkMode
                            ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            : "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                        }`}
                      >
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Light Mode</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => applyTheme("system")}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          themeMode === "system"
                            ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                            : isDarkMode
                            ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            : "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                        }`}
                      >
                        <Laptop className="w-4 h-4 text-purple-400" />
                        <span>System Sync</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Default AI Engine
                    </label>
                    <select
                      value={preferredModel}
                      onChange={(e) => setPreferredModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div>
                      <p className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-slate-400">Add an extra layer of security to your CopyCoach account</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        showToast(!twoFactorEnabled ? "2FA Enabled" : "2FA Disabled");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        twoFactorEnabled ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
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
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Current Plan</span>
                      <h4 className="text-lg font-bold text-white capitalize">{plan} Plan</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {plan === "pro" ? "100 AI Generations Daily" : "5 Free Generations Daily"}
                      </p>
                    </div>

                    {plan !== "pro" && (
                      <button
                        type="button"
                        onClick={upgradeToPro}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
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
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>CopyCoach AI Status: All Systems Operational (100% Uptime)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Submit Support Ticket
                    </label>
                    <input
                      type="text"
                      placeholder="Subject line..."
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 mb-3"
                    />
                    <textarea
                      rows={3}
                      placeholder="Describe your issue or question..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
              <Link
                href="/dashboard/profile"
                className="text-xs text-cyan-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>Open Dedicated Profile Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-emerald-400" />
                <span>Keyboard Shortcuts & Productivity</span>
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Run Copy Optimization</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">Enter</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Toggle Star Favorite</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">F</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Copy Improved Text</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">C</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-300">Create New Project</span>
                <div className="flex items-center gap-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-cyan-300 border border-slate-700">P</kbd>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2 rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP & AI SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>CopyCoach AI Support & Feedback</span>
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Have a question about your copy analysis or need help setting up custom brand voices? Send us a message and our team will assist you shortly.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g., Custom Brand Tone Request"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or feedback..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer"
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
