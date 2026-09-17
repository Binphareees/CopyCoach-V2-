"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  SquarePen,
  History,
  Folder,
  UserRound,
  ShieldAlert,
  Sliders,
  CreditCard,
  Moon,
  Sun,
  Monitor,
  Keyboard,
  HelpCircle,
  LogOut,
  Zap,
} from "lucide-react";
import { supabase, getAccessToken } from "@/lib/supabase";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useDashboardShell } from "@/components/dashboard/DashboardShell";
import { useTranslation } from "react-i18next";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import {
  DashboardNavButton,
  DashboardNavGroup,
  DashboardNavLink,
} from "@/components/dashboard/DashboardNav";

const NAV_ICON_CLASSES = "h-[15px] w-[15px]";
const ACCOUNT_MODAL_EVENT = "copycoach:open-account-modal";

interface SidebarInnerProps {
  onNavigate?: () => void;
}

function SidebarInner({ onNavigate }: SidebarInnerProps) {
  const router = useRouter();
  const { themeMode, setThemeMode, isDarkMode } = useTheme();
  const { t } = useTranslation("dashboard");

  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState("free");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/auth/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      } catch (err) {
        console.error("Admin status check failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const usageRes = await supabase
        .from("user_usage")
        .select("daily_generations_used, monthly_generations_used, plan")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!usageRes.data || cancelled) return;

      const isPro = usageRes.data.plan === "pro";
      setPlan(usageRes.data.plan || "free");
      setCredits(
        Math.max(0, isPro ? 100 - (usageRes.data.monthly_generations_used || 0) : 5 - (usageRes.data.daily_generations_used || 0))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [router]);

  const openAccountModal = useCallback(
    (modal: "brand_voice" | "billing" | "shortcuts" | "support") => {
      window.dispatchEvent(new CustomEvent(ACCOUNT_MODAL_EVENT, { detail: { modal } }));
      onNavigate?.();
    },
    [onNavigate]
  );

  const cycleTheme = useCallback(() => {
    const order = ["dark", "light", "system"] as const;
    const next = order[(order.indexOf(themeMode) + 1) % order.length];
    setThemeMode(next);
  }, [themeMode, setThemeMode]);

  const themeLabel =
    themeMode === "light" ? t("lightTheme") : themeMode === "system" ? t("systemTheme") : t("darkTheme");
  const themeIcon =
    themeMode === "light" ? (
      <Sun className={NAV_ICON_CLASSES} />
    ) : themeMode === "system" ? (
      <Monitor className={NAV_ICON_CLASSES} />
    ) : (
      <Moon className={NAV_ICON_CLASSES} />
    );

  return (
    <>
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-3 pt-5 pb-4 transition-opacity hover:opacity-90"
      >
        <Logo theme="dark" size="sm" variant="app-icon" />
        <div className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-bold text-text-primary">CopyCoach AI</span>
          <span className="block text-[11px] text-text-muted">{t("writingWorkspace")}</span>
        </div>
      </Link>

      <div className="mx-3 border-t border-border-subtle" />

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {/* Sidebar promo card — 2:3 portrait asset, above the nav and scrolls with it */}
        <div className="relative mx-auto my-4 block w-[220px] overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isDarkMode ? "/images/sidebar-promo.jpeg" : "/images/sidebar-promo-light.jpeg"}
            alt=""
            className="aspect-[2/3] w-full object-cover"
          />
          <span
            className={`pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t p-3 ${
              isDarkMode ? "from-black/80 via-black/20 to-transparent" : "from-white/90 via-white/40 to-transparent"
            }`}
          >
            <span className="flex items-center gap-1 text-xs font-bold text-accent">
              <Zap className="h-3.5 w-3.5" />
              Pro
            </span>
            <span className="mt-0.5 text-[11px] font-medium leading-snug text-text-primary/90">
              {t("promoCardBody", { defaultValue: "100 monthly generations & premium models" })}
            </span>
          </span>
        </div>

        <div className="mx-1 border-t border-border-subtle" />
        <DashboardNavGroup label={t("workspaceGroup")}>
          <DashboardNavLink
            href="/dashboard"
            label={t("overview")}
            icon={<LayoutDashboard className={NAV_ICON_CLASSES} />}
            onNavigate={onNavigate}
          />
          <DashboardNavLink
            href="/dashboard#generate"
            label={t("newCopy")}
            icon={<SquarePen className={NAV_ICON_CLASSES} />}
            onNavigate={onNavigate}
          />
          <DashboardNavLink
            href="/dashboard#copy-library"
            label={t("copyHistory")}
            icon={<History className={NAV_ICON_CLASSES} />}
            onNavigate={onNavigate}
          />
          <DashboardNavLink
            href="/dashboard"
            matchPrefix="/dashboard/projects"
            label={t("projects")}
            icon={<Folder className={NAV_ICON_CLASSES} />}
            onNavigate={onNavigate}
          />
        </DashboardNavGroup>

        <DashboardNavGroup label={t("accountGroup")}>
          <DashboardNavLink
            href="/dashboard/profile"
            label={t("profileSettings")}
            icon={<UserRound className={NAV_ICON_CLASSES} />}
            badge={<span className="text-[10px] text-text-muted">{t("navEdit")}</span>}
            onNavigate={onNavigate}
          />
          {isAdmin && (
            <DashboardNavLink
              href="/dashboard/admin/feedback"
              label={t("adminFeedbackTriage")}
              icon={<ShieldAlert className={NAV_ICON_CLASSES} />}
              badge={
                <span className="rounded bg-accent/15 px-1 py-0.5 text-[10px] font-medium text-accent-bright">
                  {t("admin")}
                </span>
              }
              onNavigate={onNavigate}
            />
          )}
          <DashboardNavButton
            label={t("brandVoice")}
            icon={<Sliders className={NAV_ICON_CLASSES} />}
            badge={
              <span className="rounded bg-accent/15 px-1 py-0.5 text-[10px] font-medium text-accent-bright">
                {t("custom")}
              </span>
            }
            onClick={() => openAccountModal("brand_voice")}
          />
          <DashboardNavButton
            label={t("subscriptionAndPlan")}
            icon={<CreditCard className={NAV_ICON_CLASSES} />}
            badge={
              <span className={`text-[10px] font-bold ${plan === "pro" ? "text-warning" : "text-accent-bright"}`}>
                {plan === "pro" ? t("proActive") : t("upgrade")}
              </span>
            }
            onClick={() => openAccountModal("billing")}
          />
        </DashboardNavGroup>

        <DashboardNavGroup label={t("preferencesGroup")}>
          <DashboardNavButton
            label={t("appearanceTheme")}
            icon={themeIcon}
            badge={
              <span className="rounded border border-glass-border bg-glass-bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-accent-bright">
                {themeLabel}
              </span>
            }
            onClick={cycleTheme}
            title={t("switchTheme", { theme: themeLabel })}
          />
        </DashboardNavGroup>

        <DashboardNavGroup label={t("supportTools")}>
          <DashboardNavButton
            label={t("keyboardShortcuts")}
            icon={<Keyboard className={NAV_ICON_CLASSES} />}
            badge={<span className="font-mono text-[10px] text-text-muted">⌘K</span>}
            onClick={() => openAccountModal("shortcuts")}
          />
          <DashboardNavButton
            label={t("helpSupport")}
            icon={<HelpCircle className={NAV_ICON_CLASSES} />}
            badge={<span className="text-[10px] text-text-muted">24/7</span>}
            onClick={() => openAccountModal("support")}
          />
        </DashboardNavGroup>

        <div className="mt-2 border-t border-border-subtle" />
        <DashboardNavButton
          variant="danger"
          label={t("signOut")}
          icon={<LogOut className={NAV_ICON_CLASSES} />}
          onClick={handleSignOut}
        />

        </nav>

      <div className="shrink-0 border-t border-border-subtle px-3 pb-3 pt-3">
        <div className="mb-2">
          <LanguageSwitcher direction="up" />
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
              <Zap className="h-3.5 w-3.5 text-accent-bright" />
              AI Credits
            </span>
            <span className="text-[11px] font-bold text-accent-bright">
              {credits === null ? "—" : credits}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-text-muted">
            {credits === null
              ? t("syncing")
              : plan === "pro"
                ? t("proMonthly")
                : t("freeDaily")}
          </p>
        </div>
      </div>
    </>
  );
}

export default function DashboardSidebar() {
  const { open, setOpen, collapsed } = useDashboardShell();
  const close = useCallback(() => setOpen(false), [setOpen]);

  return (
    <>
      {!collapsed && (
        <aside className="fixed inset-y-0 start-0 z-50 hidden w-[264px] flex-col border-e border-border-subtle bg-sidebar lg:flex">
          <SidebarInner />
        </aside>
      )}

      {open && (
        <aside className="fixed inset-y-0 start-0 z-50 flex w-[264px] flex-col border-e border-border-subtle bg-sidebar lg:hidden">
          <SidebarInner onNavigate={close} />
        </aside>
      )}
    </>
  );
}