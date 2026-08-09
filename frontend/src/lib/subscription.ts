import { supabaseAdmin } from "@/lib/supabase-admin";

export async function activateSubscription(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  return await supabaseAdmin
    .from("user_usage")
    .update({
      plan: "pro",
      subscription_status: "active",
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq("user_id", userId)
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