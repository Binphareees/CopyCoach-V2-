"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CleanMinimalSignUp } from "@/components/ui/clean-minimal-sign-up";
import { getIsSupabaseConfigured, getActiveSupabaseUrl, ensureSupabaseConfig } from "@/lib/supabase";

const TIMEOUT_ERROR = "Connection timed out.";

export default function SignupPage() {

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

  // Real-time Password Rules Validation
  const hasMinLength = (pwd: string) => pwd.length >= 6;
  const hasUppercase = (pwd: string) => /[A-Z]/.test(pwd);
  const hasSpecialChar = (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
  const isPasswordValid = (pwd: string) => hasMinLength(pwd) && hasUppercase(pwd) && hasSpecialChar(pwd);

  useEffect(() => {
    ensureSupabaseConfig().then(() => {
      setConfigured(getIsSupabaseConfigured());
      setActiveUrl(getActiveSupabaseUrl());
      setCheckingConfig(false);
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        showSuccess(t("signupGoogleSuccess"));
        window.location.href = "/dashboard";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router, t]);


  async function handleSignup(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      showError(t("signupMissingFields"));
      return;
    }

    if (!isPasswordValid(password)) {
      showError(t("signupPasswordRules"));
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

      showError(t("creatingAccountAction"));

      let apiSuccess = false;
      try {
        const apiRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const apiData = await apiRes.json();
        if (apiRes.ok && apiData.success) {
          apiSuccess = true;
        } else if (apiRes.status === 409) {
          showError(apiData.error || t("userAlreadyExists"));
          apiSuccess = true;
        } else if (!apiRes.ok && apiData.error) {
          showError(apiData.error);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Server signup route unreachable, falling back to direct auth:", e);
      }

      if (!apiSuccess) {
        const timeoutPromise = new Promise<{ data: { user: null; session: null }; error: { message: string } }>((_, reject) =>
          setTimeout(() => reject(new Error(TIMEOUT_ERROR)), 10000)
        );

        const authPromise = activeClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        const res = await Promise.race([authPromise, timeoutPromise]);
        if (res.error) {
          showError(res.error.message);
          setLoading(false);
          return;
        }
      }

      showError(t("signingInAction"));
      const { data: signInData, error: signInError } = await activeClient.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (signInError) {
        showSuccess(t("accountCreatedCheckLogin", { message: signInError.message }));
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
        return;
      }

      if (signInData?.session) {
        showSuccess(t("signupSuccess"));
        window.location.href = "/dashboard";
      } else {
        showSuccess(t("accountCreatedLogin"));
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error && err.message === TIMEOUT_ERROR) {
        showError(t("connectionTimedOut"));
      } else {
        const errorMsg = err instanceof Error ? err.message : t("signupGenericError");
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
          showError(t("googleSignupError", { message: error.message }));
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
        showError(t("googleSignupLinkError"));
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t("googleSignupInitError");
      console.error("Google sign up exception:", err);
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
          showError(t("githubSignupError", { message: error.message }));
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
        showError(t("githubSignupLinkError"));
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t("githubSignupInitError");
      console.error("GitHub sign up exception:", err);
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
      <CleanMinimalSignUp
        onSignUp={handleSignup}
        onGoogleSignIn={signInWithGoogle}
        onGitHubSignIn={signInWithGitHub}
        onSignIn={() => router.push("/auth/login")}
        loading={loading}
        error={message}
        tone={messageTone}
      />
    </>
  );

}