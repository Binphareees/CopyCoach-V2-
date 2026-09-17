"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Logo from "@/components/ui/Logo";
import { getIsSupabaseConfigured, getActiveSupabaseUrl, ensureSupabaseConfig } from "@/lib/supabase";

const TIMEOUT_ERROR = "Connection timed out.";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [activeUrl, setActiveUrl] = useState("");

  const showError = (msg: string) => {
    setMessageTone("error");
    setMessage(msg);
  };

  const showSuccess = (msg: string) => {
    setMessageTone("success");
    setMessage(msg);
  };

  useEffect(() => {
    ensureSupabaseConfig().then(() => {
      setConfigured(getIsSupabaseConfigured());
      setActiveUrl(getActiveSupabaseUrl());
      setCheckingConfig(false);
    });
  }, []);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      showError(t("forgotPasswordMissingEmail"));
      return;
    }

    setLoading(true);
    showError(t("forgotPasswordSending"));

    try {
      const activeClient = await ensureSupabaseConfig();

      if (!getIsSupabaseConfigured()) {
        setLoading(false);
        showError(t("supabaseConfigMissing"));
        return;
      }

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "http://localhost:3000/auth/callback";

      const maxAttempts = 3;
      let lastError: { message: string; code?: string } | null = null;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { error } = await activeClient.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (!error) {
          lastError = null;
          break;
        }
        lastError = error;
        if (error.message?.includes("rate limit") || error.message?.includes("rate_limit")) {
          await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
        } else {
          break;
        }
      }

      setLoading(false);

      if (lastError) {
        const msg = lastError.message || "";
        if (msg.includes("rate limit") || msg.includes("rate_limit")) {
          showError(t("forgotPasswordRateLimit"));
        } else if (
          lastError.code === "unexpected_failure" ||
          msg.includes("Error sending recovery email")
        ) {
          showError(t("forgotPasswordSendFailed"));
        } else {
          showError(msg);
        }
        return;
      }

      setSent(true);
      showSuccess(t("forgotPasswordSent"));
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error && err.message === TIMEOUT_ERROR) {
        showError(t("connectionTimedOut"));
      } else {
        const errorMsg = err instanceof Error ? err.message : t("forgotPasswordGenericError");
        showError(errorMsg);
      }
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
            <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-[28px]">{t("forgotPasswordTitle")}</h1>
            <p className="mt-2 max-w-xs text-sm text-text-secondary">
              {t("forgotPasswordSubtitle")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8">
            {message && (
              <p
                role="status"
                aria-live="polite"
                className={
                  messageTone === "success"
                    ? "mb-4 rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-xs text-success"
                    : "mb-4 rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger"
                }
              >
                {message}
              </p>
            )}

            {sent ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary">{t("forgotPasswordSentDetail")}</p>
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("forgotPasswordBackToLogin")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} noValidate className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-medium text-text-secondary">
                    {t("emailLabel")}
                  </label>
                  <input
                    id="forgot-email"
                    placeholder={t("emailPlaceholder")}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    className="cc-field rounded-lg px-3.5 py-2.5 text-sm placeholder:text-text-muted/60"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {loading ? t("forgotPasswordSending") : t("forgotPasswordSubmit")}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="rounded font-semibold text-accent-bright transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("forgotPasswordBackToLogin")}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}