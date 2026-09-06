import { supabaseAdmin } from "@/lib/supabase-admin";

export async function activateSubscription(userId: string) {
  // Idempotency guard: rapid duplicate activations (e.g. Paystack webhook +
  // client-side verify firing for the same payment) must not reset the billing
  // window or re-extend it. A real renewal is still honored once the previous
  // activation is older than DUPLICATE_WINDOW_MS.
  const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

  const { data: existing } = await supabaseAdmin
    .from("user_usage")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.plan === "pro" && existing.subscription_status === "active") {
    const lastPayment = existing.last_payment_date
      ? new Date(existing.last_payment_date).getTime()
      : 0;
    if (Date.now() - lastPayment < DUPLICATE_WINDOW_MS) {
      return {
        data: existing,
        error: null,
        alreadyActive: true,
      };
    }
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const now = new Date().toISOString();

  const result = await supabaseAdmin
    .from("user_usage")
    .upsert({
      user_id: userId,
      plan: "pro",
      subscription_status: "active",
      subscription_expires_at: expiresAt.toISOString(),
      last_payment_date: now,
      monthly_generations_used: 0,
      monthly_reset_date: now,
    }, { onConflict: "user_id" })
    .select()
    .single();

  return {
    data: result.data,
    error: result.error,
    alreadyActive: false,
  };
}

export async function checkSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_usage")
    .select("plan, subscription_status, subscription_expires_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  if (
    data.plan === "pro" &&
    data.subscription_expires_at &&
    new Date() > new Date(data.subscription_expires_at)
  ) {
    await expireSubscription(userId);

    return {
      ...data,
      plan: "free",
      subscription_status: "expired",
    };
  }

  return data;
}

export async function expireSubscription(userId: string) {
  return await supabaseAdmin
    .from("user_usage")
    .update({
      plan: "free",
      subscription_status: "expired",
    })
    .eq("user_id", userId);
}