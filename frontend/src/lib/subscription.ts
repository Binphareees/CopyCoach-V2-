import { supabaseAdmin } from "@/lib/supabase-admin";

export async function activateSubscription(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const now = new Date().toISOString();

  return await supabaseAdmin
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