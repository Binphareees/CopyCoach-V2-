"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CleanMinimalSignIn } from "@/components/ui/clean-minimal-sign-in";
import { getIsSupabaseConfigured, getActiveSupabaseUrl, ensureSupabaseConfig } from "@/lib/supabase";

export default function LoginPage() {

  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [activeUrl, setActiveUrl] = useState("");

  useEffect(() => {
    ensureSupabaseConfig().then(() => {
      setConfigured(getIsSupabaseConfigured());
      setActiveUrl(getActiveSupabaseUrl());
      setCheckingConfig(false);
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setMessage("Google login successful! Redirecting to dashboard...");
        window.location.href = "/dashboard";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);


  async function handleLogin(email: string, password: string) {
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setMessage("Connecting...");

    try {
      const activeClient = await ensureSupabaseConfig();

      if (!getIsSupabaseConfigured()) {
        setLoading(false);
        setMessage("Supabase credentials are missing or set to placeholder. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Settings.");
        return;
      }

      setMessage("Logging in...");

const timeoutPromise = new Promise<{ data: { user: null; session: null }; error: { message: string } }>((_, reject) =>
        setTimeout(() => reject(new Error("Connection timed out. Please check your Supabase URL and network connection.")), 10000)
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
          setMessage("Invalid email or password. If you haven't created an account yet, please click 'Sign Up' below.");
        } else if (error.message.includes("Email rate limit exceeded")) {
          setMessage("Supabase email rate limit reached. Your account is already registered; please try logging in again in a moment.");
        } else if (error.message.includes("Email not confirmed")) {
          setMessage("Email confirmation pending. Retrying sign in...");
          const retry = await activeClient.auth.signInWithPassword({ email, password });
          if (retry.data?.session) {
            setMessage("Login successful! Redirecting to dashboard...");
            window.location.href = "/dashboard";
            return;
          }
          setMessage("Email unconfirmed. Please check your inbox or log in again.");
        } else {
          setMessage(error.message);
        }
        return;
      }

      setMessage("Login successful! Redirecting to dashboard...");
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setLoading(false);
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred during login.";
      setMessage(errorMsg);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("Connecting to Google...");

    try {
      const activeClient = await ensureSupabaseConfig();

      if (!getIsSupabaseConfigured()) {
        setLoading(false);
        setMessage("Supabase credentials are missing or set to placeholder. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Settings.");
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
          setMessage("Google provider is disabled in Supabase. Please enable Google under Supabase Dashboard -> Authentication -> Providers.");
        } else {
          setMessage(`Google login error: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      if (data?.url) {
        if (data.url.includes("placeholder.supabase.co")) {
          setMessage(
            "Supabase URL is using placeholder values. Please configure NEXT_PUBLIC_SUPABASE_URL in Settings."
          );
          setLoading(false);
          return;
        }

        setMessage("Redirecting to Google Sign-In...");
        window.location.href = data.url;
      } else {
        setMessage("Could not generate Google login link.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate Google sign in";
      console.error("Google login exception:", err);
      setMessage(errorMsg);
      setLoading(false);
    }
  }

  async function signInWithGitHub() {
    setLoading(true);
    setMessage("Connecting to GitHub...");

    try {
      const activeClient = await ensureSupabaseConfig();

      if (!getIsSupabaseConfigured()) {
        setLoading(false);
        setMessage("Supabase credentials are missing or set to placeholder. Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Settings.");
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
          setMessage("GitHub provider is disabled in Supabase. Please enable GitHub under Supabase Dashboard -> Authentication -> Providers.");
        } else {
          setMessage(`GitHub login error: ${error.message}`);
        }
        setLoading(false);
        return;
      }

      if (data?.url) {
        if (data.url.includes("placeholder.supabase.co")) {
          setMessage(
            "Supabase URL is using placeholder values. Please configure NEXT_PUBLIC_SUPABASE_URL in Settings."
          );
          setLoading(false);
          return;
        }

        setMessage("Redirecting to GitHub Sign-In...");
        window.location.href = data.url;
      } else {
        setMessage("Could not generate GitHub login link.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate GitHub sign in";
      console.error("GitHub login exception:", err);
      setMessage(errorMsg);
      setLoading(false);
    }
  }

  return (
    <>
      {!checkingConfig && !configured && (
        <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning backdrop-blur">
          <strong>Notice:</strong> Supabase environment variables are currently missing or set to placeholder (`{activeUrl || "placeholder.supabase.co"}`).
        </div>
      )}
      <CleanMinimalSignIn
        onSignIn={handleLogin}
        onGoogleSignIn={signInWithGoogle}
        onGitHubSignIn={signInWithGitHub}
        onSignUp={() => router.push("/auth/signup")}
        loading={loading}
        error={message}
      />
    </>
  );

}
