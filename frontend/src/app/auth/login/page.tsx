"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CleanMinimalSignIn } from "@/components/ui/clean-minimal-sign-in";
import { getIsSupabaseConfigured, getActiveSupabaseUrl, ensureSupabaseConfig } from "@/lib/supabase";

const TIMEOUT_ERROR = "Connection timed out.";

export default function LoginPage() {

  const router = useRouter();
  const { t } = useTranslation("auth");

  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);
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

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        showSuccess(t("loginGoogleSuccess"));
        window.location.href = "/dashboard";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router, t]);


  async function handleLogin(email: string, password: string) {
    if (!email || !password) {
      showError(t("loginMissingFields"));
      return;
    }

    setLoading(true);
    showError(t("connecting"));

    try {
      const activeClient = await ensureSupabaseConfig();

      if (!getIsSupabaseConfigured()) {
        setLoading(false);
        showError(t("supabaseConfigMissing"));
        return;
      }

      showError(t("loggingIn"));

      const timeoutPromise = new Promise<{ data: { user: null; session: null }; error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error(TIMEOUT_ERROR)), 10000)
      );

      const authPromise = activeClient.auth.signInWithPassword({
        email,
        password,
      });

      const res = await Promise.race([authPromise, timeoutPromise]);
      const { error } = res;

      setLoading(false);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          showError(t("loginInvalidCredentials"));
        } else if (error.message.includes("Email rate limit exceeded")) {
          showError(t("loginRateLimit"));
        } else if (error.message.includes("Email not confirmed")) {
          showError(t("loginEmailConfirmRetry"));
          const retry = await activeClient.auth.signInWithPassword({ email, password });
          if (retry.data?.session) {
            showSuccess(t("loginSuccess"));
            window.location.href = "/dashboard";
            return;
          }
          showError(t("loginEmailUnconfirmed"));
        } else {
          showError(error.message);
        }
        return;
      }

      showSuccess(t("loginSuccess"));
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error && err.message === TIMEOUT_ERROR) {
        showError(t("connectionTimedOut"));
      } else {
        const errorMsg = err instanceof Error ? err.message : t("loginGenericError");
        showError(errorMsg);
      }
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    showError(t("connectingGoogle"));

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

      const { data, error } = await activeClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error("Google Auth error:", error);
        if (error.message.toLowerCase().includes("provider is not enabled") || error.message.toLowerCase().includes("unsupported provider")) {
          showError(t("googleProviderDisabled"));
        } else {
          showError(t("googleLoginError", { message: error.message }));
        }
        setLoading(false);
        return;
      }

      if (data?.url) {
        if (data.url.includes("placeholder.supabase.co")) {
          showError(t("supabasePlaceholderUrl"));
          setLoading(false);
          return;
        }

        showError(t("redirectingGoogle"));
        window.location.href = data.url;
      } else {
        showError(t("googleLinkError"));
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t("googleInitError");
      console.error("Google login exception:", err);
      showError(errorMsg);
      setLoading(false);
    }
  }

  async function signInWithGitHub() {
    setLoading(true);
    showError(t("connectingGithub"));

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

      const { data, error } = await activeClient.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error("GitHub Auth error:", error);
        if (error.message.toLowerCase().includes("provider is not enabled") || error.message.toLowerCase().includes("unsupported provider")) {
          showError(t("githubProviderDisabled"));
        } else {
          showError(t("githubLoginError", { message: error.message }));
        }
        setLoading(false);
        return;
      }

      if (data?.url) {
        if (data.url.includes("placeholder.supabase.co")) {
          showError(t("supabasePlaceholderUrl"));
          setLoading(false);
          return;
        }

        showError(t("redirectingGithub"));
        window.location.href = data.url;
      } else {
        showError(t("githubLinkError"));
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t("githubInitError");
      console.error("GitHub login exception:", err);
      showError(errorMsg);
      setLoading(false);
    }
  }

  return (
    <>
      {!checkingConfig && !configured && (
        <div className="fixed top-4 start-4 end-4 z-50 mx-auto max-w-md rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning backdrop-blur">
          <strong>{t("notice")}:</strong> {t("supabaseConfigBanner")} (`{activeUrl || "placeholder.supabase.co"}`).
        </div>
      )}
      <CleanMinimalSignIn
        onSignIn={handleLogin}
        onGoogleSignIn={signInWithGoogle}
        onGitHubSignIn={signInWithGitHub}
        onSignUp={() => router.push("/auth/signup")}
        loading={loading}
        error={message}
        tone={messageTone}
      />
    </>
  );

}