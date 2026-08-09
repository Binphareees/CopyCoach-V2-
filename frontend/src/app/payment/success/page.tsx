"use client";

import { useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verifyPayment = useCallback(async () => {
    const reference = searchParams.get("reference");

    console.log("PAYSTACK REFERENCE:", reference);

    if (!reference) {
      console.log("No reference found");
      router.push("/dashboard");
      return;
    }

    const response = await fetch(
      `/api/paystack/verify?reference=${reference}`
    );

    const data = await response.json();

    console.log("PAYSTACK VERIFY RESPONSE:", data);

    if (data.status && data.data?.status === "success") {
      console.log("Payment verified successfully.");
    } else {
      console.error("Payment verification failed.");
    }

    router.push("/dashboard");
  }, [router, searchParams]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B1020] text-white">
      <p className="text-xl">Confirming your payment...</p>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0B1020] text-white"><p className="text-xl">Loading...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}