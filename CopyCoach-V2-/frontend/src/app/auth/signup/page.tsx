"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        setMessage("Google sign-up successful! Redirecting...");
        router.push("/dashboard");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);


  async function handleSignup() {

    if (!name || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }


    setLoading(true);
    setMessage("Creating account...");


    const { error } = await supabase.auth.signUp({

      email,
      password,

      options: {
        data: {
          full_name: name,
        },
      },

    });


    setLoading(false);


    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    setMessage("Account created successfully! Redirecting...");
    window.location.href = "/dashboard";
  }


  async function signInWithGoogle() {
    try {
      setLoading(true);
      setMessage("Connecting to Google...");

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "http://localhost:3000/auth/callback";

      const { data, error } = await supabase.auth.signInWithOAuth({
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
            "Supabase URL is using placeholder values. Please configure NEXT_PUBLIC_SUPABASE_URL and Google OAuth."
          );
          setLoading(false);
          return;
        }

        const authWindow = window.open(
          data.url,
          "google_oauth_popup",
          "width=600,height=700"
        );

        if (!authWindow) {
          setMessage("Popup blocked by browser. Please allow popups for this site to sign in with Google.");
          setLoading(false);
          return;
        }

        setMessage("Opening Google Sign-In popup...");
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


        <h1 className="text-3xl font-bold text-white">
          Create your account
        </h1>


        <p className="mt-2 text-gray-400">
          Start improving your copywriting skills with AI.
        </p>


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
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-gray-500 focus:border-[#5B5CEB]"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />


        <p className="mt-2 text-xs text-gray-500">
          Use at least 6 characters.
        </p>


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


        <p className="mt-4 text-sm text-gray-400">
          {message}
        </p>


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