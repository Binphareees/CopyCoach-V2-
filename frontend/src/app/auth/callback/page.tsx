"use client";

import { useEffect, useState } from "react";
import { ensureSupabaseConfig } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    let isSubscribed = true;

    const processAuth = async () => {
      try {
        const activeClient = await ensureSupabaseConfig();

        // Check for PKCE code in URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          setStatus("Exchanging authentication code...");
          const { error } = await activeClient.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Code exchange error:", error.message);
          }
        }

        // Fetch current session
        let { data: { session } } = await activeClient.auth.getSession();

        // If session is not immediately ready (e.g. hash parsing in progress), wait briefly
        if (!session) {
          for (let i = 0; i < 5; i++) {
            await new Promise((res) => setTimeout(res, 500));
            const retry = await activeClient.auth.getSession();
            if (retry.data.session) {
              session = retry.data.session;
              break;
            }
          }
        }

        if (!session) {
          if (isSubscribed) {
            setStatus("Authentication failed. Redirecting to login...");
            setTimeout(() => router.push("/auth/login"), 1500);
          }
          return;
        }

        if (isSubscribed) {
          setStatus("Creating your profile...");
        }

        const user = session.user;
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        // Sync profile via server endpoint
        try {
          await fetch("/api/auth/profile-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              fullName,
              avatarUrl,
            }),
          });
        } catch (e) {
          console.warn("Profile sync warning:", e);
        }

        if (isSubscribed) {
          setStatus("Success! Redirecting...");
        }

        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: "OAUTH_AUTH_SUCCESS" }, "*");
          window.close();
        } else {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        console.error("Callback error:", err);
        if (isSubscribed) {
          setStatus("An unexpected error occurred. Redirecting to login...");
          setTimeout(() => router.push("/auth/login"), 2000);
        }
      }
    };

    processAuth();

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-medium text-slate-300">{status}</p>
    </div>
  );
}
