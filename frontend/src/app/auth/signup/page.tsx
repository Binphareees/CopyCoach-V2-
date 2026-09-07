"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CleanMinimalSignUp } from "@/components/ui/clean-minimal-sign-up";
import { getIsSupabaseConfigured, getActiveSupabaseUrl, ensureSupabaseConfig } from "@/lib/supabase";

export default function SignupPage() {

  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [activeUrl, setActiveUrl] = useState("");

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
        setMessage("Google sign-up successful! Redirecting to dashboard...");
        window.location.href = "/dashboard";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);


  async function handleSignup(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (!isPasswordValid(password)) {
      setMessage("Password must be at least 6 characters, contain an uppercase letter (A-Z), and a special character.");
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

      setMessage("Creating account...");

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
          setMessage(apiData.error || "User already exists. Attempting to log in...");
          apiSuccess = true;
        } else if (!apiRes.ok && apiData.error) {
          setMessage(apiData.error);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Server signup route unreachable, falling back to direct auth:", e);
      }

      if (!apiSuccess) {
        const timeoutPromise = new Promise<{ data: { user: null; session: null }; error: { message: string } }>((_, reject) =>
          setTimeout(() => reject(new Error("Connection timed out. Please check your Supabase URL and network connection.")), 10000)
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
          setMessage(res.error.message);
          setLoading(false);
          return;
        }
      }

      setMessage("Signing in...");
      const { data: signInData, error: signInError } = await activeClient.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (signInError) {
        setMessage(`Account created successfully! ${signInError.message}. Please try logging in on the Login page.`);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
        return;
      }

      if (signInData?.session) {
        setMessage("Account created and signed in! Redirecting to dashboard...");
        window.location.href = "/dashboard";
      } else {
        setMessage("Account created! Please log in on the Login page.");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (err: unknown) {
      setLoading(false);
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred during sign up.";
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
          setMessage(`Google sign-up error: ${error.message}`);
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
        setMessage("Could not generate Google sign-up link.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate Google sign up";
      console.error("Google sign up exception:", err);
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
          setMessage(`GitHub sign-up error: ${error.message}`);
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
        setMessage("Could not generate GitHub sign-up link.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate GitHub sign up";
      console.error("GitHub sign up exception:", err);
      setMessage(errorMsg);
      setLoading(false);
    }
  }

  return (
    <>
      {!checkingConfig && !configured && (
        <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 backdrop-blur">
          <strong>Notice:</strong> Supabase environment variables are currently missing or set to placeholder (`{activeUrl || "placeholder.supabase.co"}`).
        </div>
      )}
      <CleanMinimalSignUp
        onSignUp={handleSignup}
        onGoogleSignIn={signInWithGoogle}
        onGitHubSignIn={signInWithGitHub}
        onSignIn={() => router.push("/auth/login")}
        loading={loading}
        error={message}
      />
    </>
  );

}
