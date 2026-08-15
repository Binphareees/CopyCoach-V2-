"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { CheckCircle2, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your transaction with Paystack...");

  useEffect(() => {
    let ignore = false;
    async function runVerification() {
      const reference = searchParams.get("reference");

      if (!reference) {
        if (!ignore) {
          setVerifying(false);
          setSuccess(false);
          setMessage("No transaction reference found in URL.");
        }
        return;
      }

      try {
        const response = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`);
        const data = await response.json();

        if (!ignore) {
          if (data.status && data.data?.status === "success") {
            setSuccess(true);
            setMessage("Payment verified successfully! Your CopyCoach Pro features have been unlocked.");
          } else {
            setSuccess(false);
            setMessage(data.message || "Payment verification could not be confirmed. Please contact support if debited.");
          }
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        if (!ignore) {
          setSuccess(false);
          setMessage("Unable to verify payment status automatically. Please return to dashboard or contact support.");
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
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-6">
          <Logo theme="dark" size="md" showTagline={false} />
        </div>

        {verifying ? (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Confirming Payment</h2>
            <p className="text-xs text-slate-400 max-w-xs">{message}</p>
          </div>
        ) : success ? (
          <div className="py-4 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 animate-in zoom-in-90">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CopyCoach Pro Activated</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Thank you for upgrading! You now have full access to 100 monthly AI coaching generations, advanced AIDA &amp; PAS drills, and priority support.
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm py-3 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
              <AlertCircle className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Payment Status Notice</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">{message}</p>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs py-3 rounded-xl transition-colors"
              >
                <span>Return to Dashboard</span>
              </button>

              <Link
                href="/#support"
                className="text-xs text-cyan-400 hover:underline pt-2"
              >
                Need help? Contact Customer Support
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
        <div className="min-h-screen flex items-center justify-center bg-[#0B1020] text-slate-300">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
