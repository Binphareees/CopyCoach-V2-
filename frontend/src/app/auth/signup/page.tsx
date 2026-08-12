"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { getIsSupabaseConfigured, getActiveSupabaseUrl, ensureSupabaseConfig } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [activeUrl, setActiveUrl] = useState("");

  // Real-time Password Rules Validation
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecialChar;

  useEffect(() => {
    ensureSupabaseConfig().then(() => {
      setConfigured(getIsSupabaseConfigured());
      setActiveUrl(getActiveSupabaseUrl());
      setCheckingConfig(false);
    });

    const handleMessage = (event: MessageEvent) => {
      // Handle post-OAuth registration success
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setMessage("Google sign-up successful! Redirecting to dashboard...");
        window.location.href = "/dashboard";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);


  async function handleSignup() {
    setPasswordTouched(true);

    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (!isPasswordValid) {
      setPasswordError("Password requirement not met! Must be at least 6 characters, contain an uppercase letter (A-Z), and a special character (e.g. !@#$).");
      return;
    } else {
      setPasswordError("");
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
        // Redirect directly to avoid popup blockers or stuck iframe states
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

  return (

    <main className="flex min-h-screen items-center justify-center bg-[#0B1020] px-6">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">

        <div className="mb-6 flex justify-center">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo theme="dark" size="lg" showTagline={true} />
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Create your account
        </h1>


        <p className="mt-2 text-gray-400">
          Start improving your copywriting skills with AI.
        </p>

        {!checkingConfig && !configured && (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            <strong>Notice:</strong> Supabase environment variables are currently missing or set to placeholder (`{activeUrl || "placeholder.supabase.co"}`).
            Please add <code className="bg-black/30 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-black/30 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in project Settings.
          </div>
        )}

        <input
          className="mt-6 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-gray-500 focus:border-[#5B5CEB]"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />


        <input
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-gray-500 focus:border-[#5B5CEB]"
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />


        <input
          className={`mt-4 w-full rounded-lg border p-3 text-white outline-none placeholder:text-gray-500 transition-colors ${
            passwordTouched && !isPasswordValid
              ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
              : "border-white/10 bg-white/10 focus:border-[#5B5CEB]"
          }`}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordTouched(true);
            if (passwordError) setPasswordError("");
          }}
        />

        {/* Real-time Password Requirements Checklist & Error Box directly below password box */}
        <div className="mt-2.5 rounded-xl border border-white/10 bg-black/40 p-3 text-xs space-y-2">
          <p className="font-semibold text-gray-300">Password Requirements:</p>
          <div className="grid grid-cols-1 gap-1 text-[11px]">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-medium" : passwordTouched ? "text-rose-400" : "text-gray-400"}`}>
              <span>{hasMinLength ? "✓" : "•"}</span>
              <span>At least 6 characters long</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400 font-medium" : passwordTouched ? "text-rose-400" : "text-gray-400"}`}>
              <span>{hasUppercase ? "✓" : "•"}</span>
              <span>At least 1 UPPERCASE letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecialChar ? "text-emerald-400 font-medium" : passwordTouched ? "text-rose-400" : "text-gray-400"}`}>
              <span>{hasSpecialChar ? "✓" : "•"}</span>
              <span>At least 1 special character (e.g. !@#$)</span>
            </div>
          </div>

          {/* Explicit Error Alert Box below password */}
          {((passwordTouched && !isPasswordValid && password.length > 0) || passwordError) && (
            <div className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/15 p-2.5 text-rose-200 text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <span className="text-rose-400 font-bold shrink-0">⚠️</span>
              <span>
                {passwordError || "Password does not meet required security criteria. Please include 6+ characters, 1 uppercase letter, and 1 special character."}
              </span>
            </div>
          )}
        </div>


        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-[#5B5CEB] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>


        {message && (
          <p className="mt-4 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg p-3">
            {message}
          </p>
        )}


        <p className="mt-6 text-center text-sm text-gray-400">

          Already have an account?{" "}

          <Link
            href="/auth/login"
            className="text-[#7CFFB2] hover:underline"
          >
            Login
          </Link>

        </p>


      </div>

    </main>

  );

}
