"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Logo from "@/components/ui/Logo";
import { GradientButton } from "@/components/ui/gradient-button";
import { getAccessToken } from "@/lib/supabase";
import { CheckCircle2, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function PaymentSuccessContent() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(t("verifyingTransaction"));

  useEffect(() => {
    let ignore = false;
    async function runVerification() {
      const reference = searchParams.get("reference");

      if (!reference) {
        if (!ignore) {
          setVerifying(false);
          setSuccess(false);
          setMessage(t("noReferenceFound"));
        }
        return;
      }

      try {
        const accessToken = await getAccessToken();
        const response = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, {
          headers: {
            Authorization: `Bearer ${accessToken || ""}`,
          },
        });
        const data = await response.json();

        if (!ignore) {
          if (data.status && data.data?.status === "success") {
            setSuccess(true);
            setMessage(t("paymentVerifiedSuccess"));
          } else {
            setSuccess(false);
            setMessage(data.message || t("paymentUnconfirmed"));
          }
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        if (!ignore) {
          setSuccess(false);
          setMessage(t("paymentVerifyFailed"));
        }
      } finally {
        if (!ignore) {
          setVerifying(false);
        }
      }
    }

    runVerification();

    return () => {
      ignore = true;
    };
  }, [searchParams, t]);

  return (
    <div className="min-h-screen text-text-primary flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-surface-elevated border border-border rounded-3xl p-8 shadow-2xl backdrop-blur text-center relative overflow-hidden">
        <div className="absolute top-0 end-0 -mt-12 -me-12 w-48 h-48 bg-success/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-6">
          <Logo theme="dark" size="md" showTagline={false} />
        </div>

        {verifying ? (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">{t("confirmingPayment")}</h2>
            <p className="text-xs text-text-muted max-w-xs">{message}</p>
          </div>
        ) : success ? (
          <div className="py-4 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-success/10 border border-success/30 text-success mb-4 animate-pop">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("proActivatedBadge")}</span>
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">{t("paymentSuccessful")}</h2>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              {t("paymentSuccessDesc")}
            </p>

            <GradientButton
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              <span>{t("goToDashboard")}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </GradientButton>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-danger/10 border border-danger/30 text-danger mb-4">
              <AlertCircle className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-2">{t("paymentStatusNotice")}</h2>
            <p className="text-xs text-text-muted mb-6 leading-relaxed">{message}</p>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-muted text-text-primary font-medium text-xs py-3 rounded-xl transition-colors"
              >
                <span>{t("returnToDashboard")}</span>
              </button>

              <Link
                href="/#support"
                className="text-xs text-accent hover:underline pt-2"
              >
                {t("contactSupportLink")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-text-secondary">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}