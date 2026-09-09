"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ensureSupabaseConfig } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";

export default function CallbackPage() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [status, setStatus] = useState(t("callbackAuthenticating"));

  useEffect(() => {
    let isSubscribed = true;

    const processAuth = async () => {
      try {
        const activeClient = await ensureSupabaseConfig();

        // Check for PKCE code in URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          setStatus(t("callbackExchanging"));
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
            setStatus(t("callbackFailed"));
            setTimeout(() => router.push("/auth/login"), 1500);
          }
          return;
        }

        if (isSubscribed) {
          setStatus(t("callbackCreatingProfile"));
        }

        // Sync profile via server endpoint (identity is derived from the token)
        try {
          await fetch("/api/auth/profile-sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({}),
          });
        } catch (e) {
          console.warn("Profile sync warning:", e);
        }

        if (isSubscribed) {
          setStatus(t("callbackSuccess"));
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
          setStatus(t("callbackUnexpectedError"));
          setTimeout(() => router.push("/auth/login"), 2000);
        }
      }
    };

    processAuth();

    return () => {
      isSubscribed = false;
    };
  }, [router, t]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-text-primary">
      <div className="flex flex-col items-center text-center">
        <Logo variant="app-icon" size="md" />
        <div
          role="status"
          aria-live="polite"
          className="mt-8 h-8 w-8 rounded-full border-2 border-border border-t-accent animate-spin"
        />
        <p className="mt-4 max-w-xs text-sm text-text-secondary">{status}</p>
      </div>
    </div>
  );
}