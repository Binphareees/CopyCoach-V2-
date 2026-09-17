"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatDate } from "@/i18n/format";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const WARNING_DAYS = 7;

interface PlanExpiryBannerProps {
  onResubscribe?: () => void;
}

export default function PlanExpiryBanner({ onResubscribe }: PlanExpiryBannerProps) {
  const { t } = useTranslation("common");
  const { locale } = useLanguage();
  const [state, setState] = useState<
    | { kind: "expiring"; expiresAt: string; daysLeft: number }
    | { kind: "expired" }
    | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data } = await supabase
        .from("user_usage")
        .select("plan, subscription_status, subscription_expires_at, last_payment_date")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!data || cancelled) return;

      const { plan, subscription_status, subscription_expires_at } = data;
      const expiresAt = subscription_expires_at ? new Date(subscription_expires_at) : null;

      // Expired: the app flips an expired Pro to plan=free + status=expired
      // (see credits.ts). Detect both the flipped and the still-marked states.
      const alreadyExpired =
        subscription_status === "expired" ||
        (plan === "pro" && !!expiresAt && expiresAt.getTime() <= Date.now());

      if (!alreadyExpired && (plan === "pro" || subscription_status === "active")) {
        if (expiresAt && expiresAt.getTime() > Date.now()) {
          const daysLeft = Math.max(
            0,
            Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          );
          if (daysLeft <= WARNING_DAYS) {
            setState({ kind: "expiring", expiresAt: expiresAt.toISOString(), daysLeft });
            return;
          }
        }
      }

      if (alreadyExpired) {
        setState({ kind: "expired" });
        return;
      }

      setState(null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state) return null;

  if (state.kind === "expired") {
    return (
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl border border-danger/30 bg-danger/10 text-danger text-sm animate-appear">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-danger" />
        <span className="flex-1 min-w-40">{t("planExpiredMessage")}</span>
        {onResubscribe && (
          <button
            onClick={onResubscribe}
            className="bg-danger text-white hover:opacity-90 font-semibold px-4 py-1.5 rounded-lg text-xs transition-opacity cursor-pointer"
          >
            {t("resubscribe")}
          </button>
        )}
      </div>
    );
  }

  const expiresAtLabel = formatDate(locale, state.expiresAt, { dateStyle: "medium" });

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl border border-warning/30 bg-warning/10 text-warning text-sm animate-appear">
      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
      <span className="flex-1 min-w-40">
        {state.daysLeft === 0
          ? t("planExpiresTodayMessage")
          : t("planExpiringSoon", {
              days: state.daysLeft,
              date: expiresAtLabel,
            })}
      </span>
      {onResubscribe && (
        <button
          onClick={onResubscribe}
          className="bg-warning text-ink-900 hover:opacity-90 font-semibold px-4 py-1.5 rounded-lg text-xs transition-opacity cursor-pointer"
        >
          {t("renewNow")}
        </button>
      )}
    </div>
  );
}