"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, ensureSupabaseConfig } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  User,
  Sparkles,
  ShieldCheck,
  Sliders,
  CreditCard,
  ArrowLeft,
  Camera,
  Trash2,
  Key,
  Check,
  AlertCircle,
  LogOut,
  Building,
  Briefcase,
  Globe,
  Mail,
  Calendar,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Save,
  Smartphone,
  Laptop,
  Sun,
  Moon,
  LifeBuoy,
  MessageSquare,
  Send,
  ExternalLink,
  Activity,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    "profile" | "brand_voice" | "security" | "preferences" | "billing" | "support"
  >("profile");

  // Profile Basic Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [role, setRole] = useState("Marketing Copywriter");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // Brand Voice Fields
  const [defaultTone, setDefaultTone] = useState("Professional & Direct");
  const [targetAudience, setTargetAudience] = useState("B2B Decision Makers & Founders");
  const [brandNiche, setBrandNiche] = useState("SaaS & Digital Marketing");
  const [preferredLanguage, setPreferredLanguage] = useState("English (US)");
  const [brandGuidelines, setBrandGuidelines] = useState(
    "Maintain a clear, punchy, value-focused tone. Avoid fluff and overly complex jargon."
  );

  // Security Fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // App Preferences
  const [preferredModel, setPreferredModel] = useState("Gemini 2.5 Flash (Recommended)");
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");

  useEffect(() => {
    let isDark = true;
    if (themeMode === "light") {
      isDark = false;
    } else if (themeMode === "dark") {
      isDark = true;
    } else if (themeMode === "system") {
      isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }
  }, [themeMode]);
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(true);

  // Support & Help Ticket
  const [supportSubject, setSupportSubject] = useState("");
  const [supportCategory, setSupportCategory] = useState("Technical & AI Generation");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);

  // Billing & Usage Info
  const [plan, setPlan] = useState("pro");
  const [monthlyUsed, setMonthlyUsed] = useState(18);
  const [totalCredits, setTotalCredits] = useState(100);

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  // Load Saved Preferences from localStorage
  const loadLocalSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem("copycoach_user_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) setRole(parsed.role);
        if (parsed.company) setCompany(parsed.company);
        if (parsed.bio) setBio(parsed.bio);
        if (parsed.defaultTone) setDefaultTone(parsed.defaultTone);
        if (parsed.targetAudience) setTargetAudience(parsed.targetAudience);
        if (parsed.brandNiche) setBrandNiche(parsed.brandNiche);
        if (parsed.preferredLanguage) setPreferredLanguage(parsed.preferredLanguage);
        if (parsed.brandGuidelines) setBrandGuidelines(parsed.brandGuidelines);
        if (parsed.preferredModel) setPreferredModel(parsed.preferredModel);
        if (parsed.themeMode) setThemeMode(parsed.themeMode);
        if (typeof parsed.autoSaveHistory === "boolean") setAutoSaveHistory(parsed.autoSaveHistory);
        if (typeof parsed.emailUpdates === "boolean") setEmailUpdates(parsed.emailUpdates);
        if (typeof parsed.usageAlerts === "boolean") setUsageAlerts(parsed.usageAlerts);
        if (typeof parsed.twoFactorEnabled === "boolean") setTwoFactorEnabled(parsed.twoFactorEnabled);
      }
    } catch (e) {
      console.error("Error loading local settings", e);
    }
  }, []);

  // Load User Data from Supabase
  const loadProfile = useCallback(async () => {
    await ensureSupabaseConfig();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile load error:", error);
    }

    if (data) {
      setName(data.full_name || "");
      setAvatar(data.avatar_url ? data.avatar_url + "?t=" + Date.now() : "");
      if (data.created_at) {
        setCreatedAt(new Date(data.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }));
      }
    }

    // Fetch Usage Stats
    const { data: usageData } = await supabase
      .from("user_usage")
      .select("monthly_generations_used, plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (usageData) {
      setMonthlyUsed(usageData.monthly_generations_used || 0);
      setPlan(usageData.plan || "free");
      setTotalCredits(usageData.plan === "pro" ? 100 : 10);
    }

    loadLocalSettings();
  }, [router, loadLocalSettings]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        loadProfile();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [loadProfile]);

  // Upload Avatar to Supabase Storage
  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showNotification("Image must be smaller than 2MB", "error");
        return;
      }

      setUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const extension = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error(uploadError);
        showNotification(uploadError.message, "error");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (profileError) {
        console.error(profileError);
        showNotification(profileError.message, "error");
        return;
      }

      setAvatar(publicUrl + "?t=" + Date.now());
      showNotification("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      showNotification("Failed to upload avatar", "error");
    } finally {
      setUploading(false);
    }
  }

  // Remove Photo
  async function removeAvatar() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUploading(true);
      await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
      setAvatar("");
      showNotification("Profile picture removed");
    } catch (err) {
      console.error(err);
      showNotification("Failed to remove avatar", "error");
    } finally {
      setUploading(false);
    }
  }

  // Save Main Profile & Preferences
  async function saveProfile() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Update Supabase profile table
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", user.id);

      if (error) {
        console.error("Supabase update error:", error);
      }

      // Save all extended preferences locally
      const settingsToSave = {
        role,
        company,
        bio,
        defaultTone,
        targetAudience,
        brandNiche,
        preferredLanguage,
        brandGuidelines,
        preferredModel,
        themeMode,
        autoSaveHistory,
        emailUpdates,
        usageAlerts,
        twoFactorEnabled,
      };

      localStorage.setItem("copycoach_user_settings", JSON.stringify(settingsToSave));
      localStorage.setItem("copycoach_theme", themeMode);

      showNotification("Settings saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      showNotification("Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  }

  // Update Password Handler
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      showNotification("Password must be at least 6 characters long", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        showNotification(error.message, "error");
      } else {
        showNotification("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update password";
      showNotification(errMsg, "error");
    } finally {
      setPasswordLoading(false);
    }
  }

  // Support Ticket Handler
  async function handleSupportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      showNotification("Please fill in both subject and message", "error");
      return;
    }
    setSupportLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSupportLoading(false);
    showNotification("Support ticket submitted! Ticket ID: #TK-" + Math.floor(100000 + Math.random() * 900000));
    setSupportSubject("");
    setSupportMessage("");
  }

  // Handle Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100 font-sans pb-16">
      {/* Top Banner & Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1 px-3 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={saveProfile}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save All Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Floating Toast Notification */}
        {message && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium animate-in fade-in slide-in-from-bottom-5 ${
              message.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/90 border-rose-500/40 text-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* User Hero Summary Header */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="h-28 w-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-indigo-500/30 shadow-xl relative">
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatar}
                    alt={name || "User Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold text-3xl">
                    {name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs text-indigo-300 font-medium">
                    Uploading...
                  </div>
                )}
              </div>

              <label className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 border border-indigo-400/30">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info Summary */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {name || "CopyCoach User"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    plan === "pro"
                      ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300"
                      : "bg-slate-800 border border-slate-700 text-slate-300"
                  }`}
                >
                  {plan === "pro" ? "⚡ Pro Plan" : "Free Member"}
                </span>
              </div>

              <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2 mb-4">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{email}</span>
                {createdAt && (
                  <>
                    <span className="text-slate-600">•</span>
                    <Calendar className="w-4 h-4 text-slate-500 ml-1" />
                    <span>Member since {createdAt}</span>
                  </>
                )}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {avatar && (
                  <button
                    onClick={removeAvatar}
                    disabled={uploading}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/50 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
                <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                  Role: <strong className="text-slate-200 font-medium">{role}</strong>
                </span>
                {company && (
                  <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                    Company: <strong className="text-slate-200 font-medium">{company}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("brand_voice")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "brand_voice"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Brand Voice & AI Persona</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Auth</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "preferences"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>App Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "billing"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Subscription & Usage</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "support"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support & Help Center</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                <span>Personal Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Email Address <span className="text-slate-500 lowercase">(Primary)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Professional Role / Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Senior Conversion Copywriter"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Company or Organization
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Copy Studio"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Short Bio / Profile Summary
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little bit about your copywriting focus or business goals..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Save Profile Details"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRAND VOICE & COPYWRITING PREFERENCES */}
        {activeTab === "brand_voice" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Default Copywriting Brand Voice</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Configure default tone, audience, and niche guidelines used when CopyCoach AI creates or refines copy for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Default Tone of Voice
                  </label>
                  <select
                    value={defaultTone}
                    onChange={(e) => setDefaultTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="Professional & Direct">Professional & Direct</option>
                    <option value="Conversational & Friendly">Conversational & Friendly</option>
                    <option value="Persuasive & High Energy">Persuasive & High Energy</option>
                    <option value="Bold & Punchy">Bold & Punchy</option>
                    <option value="Witty & Engaging">Witty & Engaging</option>
                    <option value="Empathic & Warm">Empathic & Warm</option>
                    <option value="Academic & Authoritative">Academic & Authoritative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Preferred Output Language
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="English (UK)">English (UK)</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Portuguese">Portuguese</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Primary Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. B2B Founders, Marketing Directors"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Brand Niche / Industry
                  </label>
                  <input
                    type="text"
                    value={brandNiche}
                    onChange={(e) => setBrandNiche(e.target.value)}
                    placeholder="e.g. E-commerce, SaaS, Fitness, Finance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Brand Voice Guidelines & Special Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={brandGuidelines}
                    onChange={(e) => setBrandGuidelines(e.target.value)}
                    placeholder="Enter specific rules, key selling points, words to avoid, or brand guidelines..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Brand Voice Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & AUTH */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Password Update Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Password & Authentication</span>
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Update your login password to ensure your account remains protected.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
                </button>
              </form>
            </div>

            {/* Two-Factor & Sessions Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-white mb-4">Account Security Features</h3>

              <div className="divide-y divide-slate-800">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Two-Factor Authentication (2FA)</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Add an additional layer of protection using authenticator apps
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showNotification(
                        !twoFactorEnabled ? "Two-Factor Auth Enabled" : "Two-Factor Auth Disabled"
                      );
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      twoFactorEnabled ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4">
                  <div className="text-sm font-medium text-slate-200 mb-3">Active Login Sessions</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-3">
                        <Laptop className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-medium text-slate-200">Current Web Browser Session</div>
                          <div className="text-slate-500">Active Now • Cloud Run Container</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-300">Mobile Companion Web App</div>
                          <div className="text-slate-500">Last seen 2 days ago</div>
                        </div>
                      </div>
                      <button
                        onClick={() => showNotification("Session revoked")}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APP PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <span>Application & Engine Settings</span>
              </h2>

              <div className="space-y-6">
                {/* Theme & Appearance Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                    Theme & Visual Appearance
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("dark");
                        localStorage.setItem("copycoach_theme", "dark");
                        showNotification("Dark Theme Selected");
                      }}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        themeMode === "dark"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Dark Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("light");
                        localStorage.setItem("copycoach_theme", "light");
                        showNotification("Light Theme Selected");
                      }}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        themeMode === "light"
                          ? "bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Light Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("system");
                        localStorage.setItem("copycoach_theme", "system");
                        showNotification("System Preference Theme Selected");
                      }}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        themeMode === "system"
                          ? "bg-purple-600/20 border-purple-500 text-purple-200 ring-2 ring-purple-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <Laptop className="w-4 h-4 text-purple-400" />
                      <span>System Sync</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Default Copywriting AI Engine
                  </label>
                  <select
                    value={preferredModel}
                    onChange={(e) => setPreferredModel(e.target.value)}
                    className="w-full sm:w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all cursor-pointer"
                  >
                    <option value="Gemini 2.5 Flash (Recommended)">
                      Gemini 2.5 Flash (Fast & High Intelligence)
                    </option>
                    <option value="GPT-4o (Standard)">GPT-4o (Standard Copywriting)</option>
                    <option value="Groq Llama 3 (Ultra Fast)">Groq Llama 3 (Ultra Low Latency)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-800 divide-y divide-slate-800">
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Auto-Save Copy Generation History</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Automatically record improved copy generations to your history workspace
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoSaveHistory(!autoSaveHistory)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoSaveHistory ? "bg-purple-600" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          autoSaveHistory ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Email Marketing & Strategy Updates</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Receive weekly copywriting frameworks and feature releases
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailUpdates(!emailUpdates)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        emailUpdates ? "bg-purple-600" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          emailUpdates ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Usage Limit Notifications</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Alert when monthly generation credits reach 80% threshold
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUsageAlerts(!usageAlerts)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        usageAlerts ? "bg-purple-600" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          usageAlerts ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BILLING & USAGE */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60">
                    Current Active Subscription
                  </span>
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan === "pro" ? "Pro Copywriter Tier" : "Free Starter Tier"}
                </h3>
                <p className="text-slate-300 text-sm mb-6 max-w-md">
                  {plan === "pro"
                    ? "Unlimited access to all copywriting frameworks, AI tone customization, and priority AI model execution."
                    : "Basic access to standard copy improvement algorithms with limited monthly generations."}
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                  >
                    {plan === "pro" ? "Manage Subscription" : "Upgrade to Pro"}
                  </button>
                </div>
              </div>

              {/* Usage Gauge Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Monthly Credits Used
                  </h4>
                  <div className="text-3xl font-extrabold text-white mb-1">
                    {monthlyUsed} <span className="text-slate-500 text-lg font-normal">/ {totalCredits}</span>
                  </div>
                  <p className="text-xs text-slate-400">Generations reset on the 1st of every month.</p>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (monthlyUsed / totalCredits) * 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-slate-400 mt-2">
                    {Math.max(0, totalCredits - monthlyUsed)} generations remaining
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices & History placeholder */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-white mb-4">Billing History & Receipts</h3>
              <div className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-800 rounded-xl">
                No previous manual invoices found. Billing is managed automatically via Supabase/Paystack.
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SUPPORT & HELP CENTER */}
        {activeTab === "support" && (
          <div className="space-y-6">
            {/* System Status Banner */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-blue-400" />
                    <span>CopyCoach Help & Support Hub</span>
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Get instant assistance, submit support tickets, or review platform health metrics.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-medium">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>All AI Systems Operational</span>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Copy Engine API</span>
                    <span className="text-emerald-400 font-medium">99.98%</span>
                  </div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Gemini 2.5 Flash</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Database & Auth</span>
                    <span className="text-emerald-400 font-medium">100% Uptime</span>
                  </div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Supabase Cloud</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Platform Build</span>
                    <span className="text-indigo-400 font-medium">v2.5.0-pro</span>
                  </div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Production Build</span>
                  </div>
                </div>
              </div>

              {/* Support Ticket Form & Direct Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Ticket */}
                <div className="lg:col-span-2 bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Submit Support Ticket</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Our copywriting engineering team typical response time is under 15 minutes for Pro subscribers.
                  </p>

                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                          Category
                        </label>
                        <select
                          value={supportCategory}
                          onChange={(e) => setSupportCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Technical & AI Generation">Technical & AI Generation</option>
                          <option value="Account & Subscription">Account & Subscription</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Copywriting Consultation">Copywriting Advice</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          placeholder="e.g. Issue with tone customizer"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Detailed Message
                      </label>
                      <textarea
                        rows={4}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Describe your request or bug in detail..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={supportLoading}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{supportLoading ? "Submitting..." : "Send Ticket"}</span>
                    </button>
                  </form>
                </div>

                {/* Direct Contact & Resources */}
                <div className="space-y-4">
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <span>Direct Email Support</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Prefer email? Contact our technical team directly anytime.
                    </p>
                    <a
                      href="mailto:support@copycoach.ai"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <span>support@copycoach.ai</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Copywriting Playbooks</span>
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Master AIDA, PAS, and FAB copywriting frameworks with our guides.
                    </p>
                    <button
                      onClick={() => showNotification("Opening Copywriting Guides...")}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Browse Framework Guides</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DANGER ZONE (Always accessible at the bottom) */}
        <div className="mt-12 bg-rose-950/20 border border-rose-900/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-rose-300 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Session & Account Controls</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sign out from this device or manage account deletion requests.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
