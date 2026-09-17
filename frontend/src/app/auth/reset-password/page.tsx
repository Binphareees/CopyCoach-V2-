"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { EmailOtpType } from "@supabase/supabase-js";
import Logo from "@/components/ui/Logo";
import { getIsSupabaseConfigured, getActiveSupabaseUrl, ensureSupabaseConfig } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation("auth");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [activeUrl, setActiveUrl] = useState("");

  const hasMinLength = (pwd: string) => pwd.length >= 6;
  const hasUppercase = (pwd: string) => /[A-Z]/.test(pwd);
  const hasSpecialChar = (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
  const hasNumber = (pwd: string) => /[0-9]/.test(pwd);
  const isPasswordValid = (pwd: string) => hasMinLength(pwd) && hasUppercase(pwd) && hasSpecialChar(pwd) && hasNumber(pwd);

  const showError = (msg: string) => {
    setMessageTone("error");
    setMessage(msg);
  };

  const showSuccess = (msg: string) => {
    setMessageTone("success");
    setMessage(msg);
  };

  useEffect(() => {
    let isSubscribed = true;

    const init = async () => {
      try {
        const activeClient = await ensureSupabaseConfig();
        if (isSubscribed) {
          setConfigured(getIsSupabaseConfigured());
          setActiveUrl(getActiveSupabaseUrl());
          setCheckingConfig(false);
        }

        if (!getIsSupabaseConfigured()) {
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const tokenHash = urlParams.get("token_hash");
        const otpType = urlParams.get("type");

        if (tokenHash && otpType) {
          const { error } = await activeClient.auth.verifyOtp({
            type: otpType as EmailOtpType,
            token_hash: tokenHash,
          });
          if (error) {
            console.error("Recovery token verification error:", error.message);
            if (isSubscribed) setInvalidLink(true);
            return;
          }
          const clean = new URL(window.location.href);
          clean.searchParams.delete("token_hash");
          clean.searchParams.delete("type");
          window.history.replaceState({}, "", clean.toString());
        }

        const { data: { session } } = await activeClient.auth.getSession();
        if (isSubscribed) {
          if (session) {
            setReady(true);
          } else {
            setInvalidLink(true);
          }
          setChecking(false);
        }
      } catch (err) {
        console.error("Reset password init error:", err);
        if (isSubscribed) {
          setInvalidLink(true);
          setChecking(false);
          setCheckingConfig(false);
        }
      }
    };

    init();

    return () => {
      isSubscribed = false;
    };
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!password) {
      showError(t("resetPasswordMissingFields"));
      return;
    }

    if (!isPasswordValid(password)) {
      showError(t("signupPasswordRules"));
      return;
    }

    setLoading(true);
    showError(t("resetPasswordSubmitting"));

    try {
      const activeClient = await ensureSupabaseConfig();

      const { error } = await activeClient.auth.updateUser({ password });
      if (error) {
        setLoading(false);
        const msg = error.message || "";
        if (/password/i.test(msg) && /(character|digit|number|uppercase|lowercase)/i.test(msg)) {
          showError(t("signupPasswordRules"));
        } else {
          showError(msg);
        }
        return;
      }

      try {
        await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
      } catch {
        // Ignored — cookie bridge cleanup is best-effort.
      }
      await activeClient.auth.signOut();

      setLoading(false);
      showSuccess(t("resetPasswordSuccess"));
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: unknown) {
      setLoading(false);
      const errorMsg = err instanceof Error ? err.message : t("resetPasswordGenericError");
      showError(errorMsg);
    }
  }

  return (
    <>
      {!checkingConfig && !configured && (
        <div className="fixed top-4 start-4 end-4 z-50 mx-auto max-w-md rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning backdrop-blur">
          <strong>{t("notice")}:</strong> {t("supabaseConfigBanner")} (`{activeUrl || "placeholder.supabase.co"}`).
        </div>
      )}
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 text-text-primary">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo variant="app-icon" size="md" />
            <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-[28px]">{t("resetPasswordTitle")}</h1>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              {t("resetPasswordSubtitle")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8">
            {checking ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-text-secondary">
                <span className="h-4 w-4 shrink-0 rounded-full border-2 border-border border-t-accent animate-spin" />
                {t("callbackAuthenticating")}
              </div>
            ) : invalidLink ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary">{t("resetPasswordInvalidLink")}</p>
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("resetPasswordRequestNew")}
                </button>
              </div>
            ) : ready ? (
              <form onSubmit={handleUpdatePassword} noValidate className="space-y-4">
                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={
                      messageTone === "success"
                        ? "rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-xs text-success"
                        : "rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger"
                    }
                  >
                    {message}
                  </p>
                )}

                <div>
                  <label htmlFor="reset-password" className="mb-1.5 block text-xs font-medium text-text-secondary">
                    {t("resetPasswordNewPasswordLabel")}
                  </label>
                  <input
                    id="reset-password"
                    placeholder={t("resetPasswordNewPasswordPlaceholder")}
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    className="cc-field rounded-lg px-3.5 py-2.5 text-sm placeholder:text-text-muted/60"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password.length > 0 && (
                    <ul className="mt-2.5 grid gap-1 text-[11px]">
                      <li className={`flex items-center gap-1.5 ${hasMinLength(password) ? "text-success" : "text-text-muted"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hasMinLength(password) ? "bg-success" : "bg-border"}`} />
                        {t("passwordMinLength")}
                      </li>
                      <li className={`flex items-center gap-1.5 ${hasUppercase(password) ? "text-success" : "text-text-muted"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hasUppercase(password) ? "bg-success" : "bg-border"}`} />
                        {t("passwordUppercase")}
                      </li>
                      <li className={`flex items-center gap-1.5 ${hasSpecialChar(password) ? "text-success" : "text-text-muted"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hasSpecialChar(password) ? "bg-success" : "bg-border"}`} />
                        {t("passwordSpecial")}
                      </li>
                      <li className={`flex items-center gap-1.5 ${hasNumber(password) ? "text-success" : "text-text-muted"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hasNumber(password) ? "bg-success" : "bg-border"}`} />
                        {t("passwordNumber")}
                      </li>
                    </ul>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {loading ? t("resetPasswordSubmitting") : t("resetPasswordUpdate")}
                </button>
              </form>
            ) : null}
          </div>

          {!checking && (
            <p className="mt-6 text-center text-sm text-text-secondary">
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="rounded font-semibold text-accent-bright transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("forgotPasswordBackToLogin")}
              </button>
            </p>
          )}

          <p className="mt-4 text-center text-[11px] leading-relaxed text-text-muted">
            {t("termsAgreement")}
          </p>
        </div>
      </div>
    </>
  );
}