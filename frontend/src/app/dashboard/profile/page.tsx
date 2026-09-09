"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, ensureSupabaseConfig } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatDate } from "@/i18n/format";
import { useTranslation } from "react-i18next";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import {
  User,
  Sparkles,
  ShieldCheck,
  Sliders,
  CreditCard,
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
  const { t } = useTranslation("profile");
  const { locale } = useLanguage();

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
  const { themeMode, setThemeMode } = useTheme();
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
  }, [setThemeMode]);

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
        setCreatedAt(formatDate(locale, data.created_at, {
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
  }, [router, loadLocalSettings, locale]);

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
        showNotification(t("imgTooLarge"), "error");
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
      showNotification(t("profilePicUpdated"));
    } catch (err) {
      console.error(err);
      showNotification(t("failedUploadAvatar"), "error");
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
      showNotification(t("profilePicRemoved"));
    } catch (err) {
      console.error(err);
      showNotification(t("failedRemoveAvatar"), "error");
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

      showNotification(t("settingsSaved"));
    } catch (err) {
      console.error("Save error:", err);
      showNotification(t("failedSaveChanges"), "error");
    } finally {
      setLoading(false);
    }
  }

  // Update Password Handler
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      showNotification(t("passwordTooShort"), "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification(t("passwordsMismatch"), "error");
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
        showNotification(t("passwordUpdated"));
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t("failedUpdatePassword");
      showNotification(errMsg, "error");
    } finally {
      setPasswordLoading(false);
    }
  }

  // Support Ticket Handler
  async function handleSupportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      showNotification(t("supportFillFields"), "error");
      return;
    }
    setSupportLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSupportLoading(false);
    showNotification(t("supportTicketId", { id: Math.floor(100000 + Math.random() * 900000) }));
    setSupportSubject("");
    setSupportMessage("");
  }

  // Handle Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <main className="min-h-screen text-text-primary font-sans pb-16">
      {/* Top Banner & Header */}
      <DashboardTopbar
        title={t("profileTitle")}
        back={{ href: "/dashboard", label: t("backToDashboard") }}
        right={
          <button
            onClick={saveProfile}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? t("saving") : t("saveAllChanges")}</span>
          </button>
        }
      />

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Floating Toast Notification */}
        {message && (
          <div
            className={`fixed bottom-6 end-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium animate-fade-up ${
              message.type === "success"
                ? "bg-success/20 border-success/40 text-success"
                : "bg-danger/20 border-danger/40 text-danger"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5 text-success shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* User Hero Summary Header */}
        <div className="bg-surface-elevated border border-border rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="h-28 w-28 rounded-2xl overflow-hidden bg-surface border-2 border-accent/25 shadow-xl relative">
                {avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatar}
                    alt={name || t("userAvatarAlt")}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-accent-deep to-accent text-text-primary font-bold text-3xl">
                    {name ? name.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-surface/80 flex items-center justify-center text-xs text-accent-bright font-medium">
                    {t("uploading")}
                  </div>
                )}
              </div>

              <label className="absolute -bottom-2 -end-2 bg-glass-bg-elevated hover:bg-glass-bg-hover text-text-primary p-2 rounded-xl shadow-glass cursor-pointer transition-transform hover:scale-105 border border-glass-border">
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
            <div className="flex-1 text-center sm:text-start">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  {name || t("copycoachUser")}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    plan === "pro"
                      ? "border-warning/30 bg-warning-surface text-warning"
                      : "bg-surface border border-border text-text-secondary"
                  }`}
                >
                  {plan === "pro" ? t("proPlan") : t("freeMember")}
                </span>
              </div>

              <p className="text-text-muted text-sm flex items-center justify-center sm:justify-start gap-2 mb-4">
                <Mail className="w-4 h-4 text-text-muted" />
                <span>{email}</span>
                {createdAt && (
                  <>
                    <span className="text-text-muted">•</span>
                    <Calendar className="w-4 h-4 text-text-muted ms-1" />
                    <span>{t("memberSince", { date: createdAt })}</span>
                  </>
                )}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {avatar && (
                  <button
                    onClick={removeAvatar}
                    disabled={uploading}
                    className="text-xs text-danger hover:text-danger flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger/30 hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t("removePhoto")}</span>
                  </button>
                )}
                <span className="text-xs text-text-muted bg-surface/80 px-3 py-1.5 rounded-lg border border-border/60">
                  {t("roleLabel")} <strong className="text-text-primary font-medium">{role}</strong>
                </span>
                {company && (
                  <span className="text-xs text-text-muted bg-surface/80 px-3 py-1.5 rounded-lg border border-border/60">
                    {t("companyLabel")} <strong className="text-text-primary font-medium">{company}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-accent text-accent-foreground shadow-accent-soft"
                : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted border border-border"
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t("personalProfile")}</span>
          </button>

          <button
            onClick={() => setActiveTab("brand_voice")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "brand_voice"
                ? "bg-accent text-accent-foreground shadow-accent-soft"
                : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted border border-border"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("brandVoiceTitle")}</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-accent text-accent-foreground shadow-accent-soft"
                : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted border border-border"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t("securityTitle")}</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "preferences"
                ? "bg-accent text-accent-foreground shadow-accent-soft"
                : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted border border-border"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t("appPreferences")}</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "billing"
                ? "bg-accent text-accent-foreground shadow-accent-soft"
                : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted border border-border"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t("subscriptionUsage")}</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "support"
                ? "bg-accent text-accent-foreground shadow-accent-soft"
                : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface-muted border border-border"
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>{t("supportHelpCenter")}</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-surface-elevated border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-accent-bright" />
                <span>{t("personalInfo")}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("fullName")}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-muted absolute start-3.5 top-3.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("namePlaceholder")}
                      className="cc-field text-sm rounded-xl ps-10 pe-4 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("emailAddress")} <span className="text-text-muted lowercase">{t("primary")}</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute start-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-surface/60 border border-border rounded-xl ps-10 pe-4 py-2.5 text-text-muted text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("professionalRole")}
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-text-muted absolute start-3.5 top-3.5" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder={t("rolePlaceholder")}
                      className="cc-field text-sm rounded-xl ps-10 pe-4 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("companyOrg")}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-text-muted absolute start-3.5 top-3.5" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={t("companyPlaceholder")}
                      className="cc-field text-sm rounded-xl ps-10 pe-4 py-2.5"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("shortBio")}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("bioPlaceholder")}
                    className="cc-field text-sm rounded-xl p-3.5"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-soft flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? t("saving") : t("saveProfileDetails")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRAND VOICE & COPYWRITING PREFERENCES */}
        {activeTab === "brand_voice" && (
          <div className="space-y-6">
            <div className="bg-surface-elevated border border-border rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-bright" />
                  <span>{t("defaultBrandVoice")}</span>
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  {t("brandVoiceDesc")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("defaultTone")}
                  </label>
                  <select
                    value={defaultTone}
                    onChange={(e) => setDefaultTone(e.target.value)}
                    className="cc-field text-sm rounded-xl px-4 py-2.5 cursor-pointer"
                  >
                    <option value="Professional & Direct">{t("toneProfessionalDirect")}</option>
                    <option value="Conversational & Friendly">{t("toneConversational")}</option>
                    <option value="Persuasive & High Energy">{t("tonePersuasiveHighEnergy")}</option>
                    <option value="Bold & Punchy">{t("toneBoldPunchy")}</option>
                    <option value="Witty & Engaging">{t("toneWittyEngaging")}</option>
                    <option value="Empathic & Warm">{t("toneEmpathicWarm")}</option>
                    <option value="Academic & Authoritative">{t("toneAcademic")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("preferredOutputLanguage")}
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-text-muted absolute start-3.5 top-3.5" />
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="cc-field text-sm rounded-xl ps-10 pe-4 py-2.5 cursor-pointer"
                    >
                      <option value="English (US)">{t("langEnglishUS")}</option>
                      <option value="English (UK)">{t("langEnglishUK")}</option>
                      <option value="Spanish">{t("langSpanish")}</option>
                      <option value="French">{t("langFrench")}</option>
                      <option value="German">{t("langGerman")}</option>
                      <option value="Portuguese">{t("langPortuguese")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("primaryTargetAudience")}
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder={t("audiencePlaceholder")}
                    className="cc-field text-sm rounded-xl px-4 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("brandNicheIndustry")}
                  </label>
                  <input
                    type="text"
                    value={brandNiche}
                    onChange={(e) => setBrandNiche(e.target.value)}
                    placeholder={t("nichePlaceholder")}
                    className="cc-field text-sm rounded-xl px-4 py-2.5"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("brandGuidelines")}
                  </label>
                  <textarea
                    rows={4}
                    value={brandGuidelines}
                    onChange={(e) => setBrandGuidelines(e.target.value)}
                    placeholder={t("guidelinesPlaceholder")}
                    className="cc-field text-sm rounded-xl p-3.5"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                   className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-accent-soft flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t("saveBrandVoiceSettings")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & AUTH */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Password Update Card */}
            <div className="bg-surface-elevated border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-text-primary mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-success" />
                <span>{t("passwordAuth")}</span>
              </h2>
              <p className="text-text-muted text-sm mb-6">
                {t("passwordAuthDesc")}
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-text-muted absolute start-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("newPasswordPlaceholder")}
                      className="cc-field text-sm rounded-xl ps-10 pe-10 py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3 text-text-muted hover:text-text-secondary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("confirmNewPassword")}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-text-muted absolute start-3.5 top-3.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("confirmPasswordPlaceholder")}
                      className="cc-field text-sm rounded-xl ps-10 pe-4 py-2.5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-success hover:bg-success/85 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-soft flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{passwordLoading ? t("updating") : t("updatePassword")}</span>
                </button>
              </form>
            </div>

            {/* Two-Factor & Sessions Card */}
            <div className="bg-surface-elevated border border-border rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t("accountSecurityFeatures")}</h3>

              <div className="divide-y divide-border">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{t("twoFactor")}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {t("twoFactorDesc")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showNotification(
                        !twoFactorEnabled ? t("twoFactorEnabledToast") : t("twoFactorDisabledToast")
                      );
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      twoFactorEnabled ? "bg-success" : "bg-surface"
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
                  <div className="text-sm font-medium text-text-primary mb-3">{t("activeLoginSessions")}</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/80 text-xs">
                      <div className="flex items-center gap-3">
                        <Laptop className="w-4 h-4 text-success" />
                        <div>
                          <div className="font-medium text-text-primary">{t("currentBrowserSession")}</div>
                          <div className="text-text-muted">{t("activeNowCloudRun")}</div>
                        </div>
                      </div>
                      <span className="text-success font-medium bg-success/10 px-2 py-0.5 rounded border border-success/30">
                        {t("active")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-border text-xs">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-text-muted" />
                        <div>
                          <div className="font-medium text-text-secondary">{t("mobileCompanionApp")}</div>
                          <div className="text-text-muted">{t("lastSeen2days")}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => showNotification(t("sessionRevoked"))}
                        className="text-text-muted hover:text-danger"
                      >
                        {t("revoke")}
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
            <div className="bg-surface-elevated border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-accent-bright" />
                <span>{t("appEngineSettings")}</span>
              </h2>

              <div className="space-y-6">
                {/* Theme & Appearance Selector */}
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                    {t("themeAppearance")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("dark");
                        showNotification(t("darkThemeSelected"));
                      }}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        themeMode === "dark"
                          ? "border-transparent bg-accent text-accent-foreground ring-2 ring-accent/30"
                          : "bg-surface border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                      }`}
                    >
                      <Moon className="w-4 h-4 text-accent-bright" />
                      <span>{t("darkMode")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("light");
                        showNotification(t("lightThemeSelected"));
                      }}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        themeMode === "light"
                          ? "border-transparent bg-accent text-accent-foreground ring-2 ring-accent/30"
                          : "bg-surface border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                      }`}
                    >
                      <Sun className="w-4 h-4 text-warning" />
                      <span>{t("lightMode")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setThemeMode("system");
                        showNotification(t("systemThemeSelected"));
                      }}
                      className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        themeMode === "system"
                          ? "border-transparent bg-accent text-accent-foreground ring-2 ring-accent/30"
                          : "bg-surface border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                      }`}
                    >
                      <Laptop className="w-4 h-4 text-accent-bright" />
                      <span>{t("systemSync")}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    {t("defaultAiEngine")}
                  </label>
                  <select
                    value={preferredModel}
                    onChange={(e) => setPreferredModel(e.target.value)}
                    className="cc-field text-sm sm:w-1/2 rounded-xl px-4 py-2.5 cursor-pointer"
                  >
                    <option value="Gemini 2.5 Flash (Recommended)">
                      {t("modelGeminiFlash")}
                    </option>
                    <option value="GPT-4o (Standard)">{t("modelGpt4o")}</option>
                    <option value="Groq Llama 3 (Ultra Fast)">{t("modelGroqLlama")}</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border divide-y divide-border">
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{t("autoSaveHistory")}</div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {t("autoSaveHistoryDesc")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoSaveHistory(!autoSaveHistory)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoSaveHistory ? "bg-accent" : "bg-surface"
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
                      <div className="text-sm font-medium text-text-primary">{t("emailUpdates")}</div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {t("emailUpdatesDesc")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailUpdates(!emailUpdates)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        emailUpdates ? "bg-accent" : "bg-surface"
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
                      <div className="text-sm font-medium text-text-primary">{t("usageAlerts")}</div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {t("usageAlertsDesc")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUsageAlerts(!usageAlerts)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        usageAlerts ? "bg-accent" : "bg-surface"
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

              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-soft flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t("savePreferences")}</span>
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
              <div className="bg-surface-elevated border border-border rounded-2xl p-6 relative overflow-hidden md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent-bright bg-accent/10 px-3 py-1 rounded-full border border-accent/25">
                    {t("currentSubscription")}
                  </span>
                  <Zap className="w-6 h-6 text-warning" />
                </div>

                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {plan === "pro" ? t("proTier") : t("freeTier")}
                </h3>
                <p className="text-text-secondary text-sm mb-6 max-w-md">
                  {plan === "pro" ? t("proPlanDesc") : t("freePlanDesc")}
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="bg-accent text-accent-foreground hover:bg-accent-hover font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-accent-soft cursor-pointer"
                  >
                    {plan === "pro" ? t("manageSubscription") : t("upgradeToPro")}
                  </button>
                </div>
              </div>

              {/* Usage Gauge Card */}
              <div className="bg-surface-elevated border border-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    {t("monthlyCreditsUsed")}
                  </h4>
                  <div className="text-3xl font-extrabold text-text-primary mb-1">
                    {monthlyUsed} <span className="text-text-muted text-lg font-normal">/ {totalCredits}</span>
                  </div>
                  <p className="text-xs text-text-muted">{t("generationsResetMonthly")}</p>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-surface rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent-deep to-accent-bright h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (monthlyUsed / totalCredits) * 100)}%` }}
                    />
                  </div>
                  <div className="text-end text-xs text-text-muted mt-2">
                    {t("generationsRemaining", { count: Math.max(0, totalCredits - monthlyUsed) })}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices & History placeholder */}
            <div className="bg-surface-elevated border border-border rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4">{t("billingHistory")}</h3>
              <div className="text-sm text-text-muted py-6 text-center border border-dashed border-border rounded-xl">
                {t("noInvoicesFound")}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SUPPORT & HELP CENTER */}
        {activeTab === "support" && (
          <div className="space-y-6">
            {/* System Status Banner */}
            <div className="bg-surface-elevated border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-accent-bright" />
                    <span>{t("supportHubTitle")}</span>
                  </h2>
                  <p className="text-text-muted text-sm mt-1">
                    {t("supportHubDesc")}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-success/10 border border-success/30 text-success px-3.5 py-1.5 rounded-full text-xs font-medium">
                  <Activity className="w-3.5 h-3.5 text-success animate-pulse" />
                  <span>{t("allSystemsOperational")}</span>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span>{t("copyEngineApi")}</span>
                    <span className="text-success font-medium">99.98%</span>
                  </div>
                  <div className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>{t("geminiFlash")}</span>
                  </div>
                </div>

                <div className="bg-surface p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span>{t("databaseAuth")}</span>
                    <span className="text-success font-medium">{t("uptime100")}</span>
                  </div>
                  <div className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>{t("supabaseCloud")}</span>
                  </div>
                </div>

                <div className="bg-surface p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span>{t("platformBuild")}</span>
                    <span className="text-accent-bright font-medium">v2.5.0-pro</span>
                  </div>
                  <div className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>{t("productionBuild")}</span>
                  </div>
                </div>
              </div>

              {/* Support Ticket Form & Direct Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Ticket */}
                <div className="lg:col-span-2 bg-surface/80 p-6 rounded-2xl border border-border/80">
                  <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent-bright" />
                    <span>{t("submitSupportTicket")}</span>
                  </h3>
                  <p className="text-xs text-text-muted mb-6">
                    {t("supportResponseTime")}
                  </p>

                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1.5">
                          {t("category")}
                        </label>
                        <select
                          value={supportCategory}
                          onChange={(e) => setSupportCategory(e.target.value)}
                          className="cc-field text-sm rounded-xl px-3.5 py-2.5 cursor-pointer"
                        >
                          <option value="Technical & AI Generation">{t("catTechnical")}</option>
                          <option value="Account & Subscription">{t("catAccount")}</option>
                          <option value="Feature Request">{t("catFeature")}</option>
                          <option value="Copywriting Consultation">{t("catAdvice")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1.5">
                          {t("subjectLine")}
                        </label>
                        <input
                          type="text"
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          placeholder={t("subjectPlaceholder")}
                          className="cc-field text-sm rounded-xl px-3.5 py-2.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        {t("detailedMessage")}
                      </label>
                      <textarea
                        rows={4}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder={t("messagePlaceholder")}
                        className="cc-field text-sm rounded-xl px-3.5 py-2.5 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={supportLoading}
                      className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium px-6 py-2.5 rounded-xl text-sm transition-all shadow-soft flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{supportLoading ? t("submitting") : t("sendTicket")}</span>
                    </button>
                  </form>
                </div>

                {/* Direct Contact & Resources */}
                <div className="space-y-4">
                  <div className="bg-surface/80 p-5 rounded-2xl border border-border/80">
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent-bright" />
                      <span>{t("directEmailSupport")}</span>
                    </h4>
                    <p className="text-xs text-text-muted mb-3">
                      {t("emailSupportDesc")}
                    </p>
                    <a
                      href="mailto:support@copycoach.ai"
                      className="inline-flex items-center gap-1.5 text-xs text-accent-bright hover:text-accent font-medium"
                    >
                      <span>support@copycoach.ai</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="bg-surface/80 p-5 rounded-2xl border border-border/80">
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-warning" />
                      <span>{t("copywritingPlaybooks")}</span>
                    </h4>
                    <p className="text-xs text-text-muted mb-3">
                      {t("playbooksDesc")}
                    </p>
                    <button
                      onClick={() => showNotification(t("openingGuides"))}
                      className="text-xs text-warning hover:text-warning font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t("browseGuides")}</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DANGER ZONE (Always accessible at the bottom) */}
        <div className="mt-12 bg-danger/10 border border-danger/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-danger flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>{t("sessionControls")}</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {t("sessionControlsDesc")}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleLogout}
              className="bg-danger hover:bg-danger/85 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-soft flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("signOut")}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}