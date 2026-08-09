import { supabaseAdmin } from "@/lib/supabase-admin";

const FREE_DAILY_LIMIT = 5;
const PREMIUM_MONTHLY_LIMIT = 100;

export async function getOrCreateUsage(userId: string) {
  const { data: usage, error } = await supabaseAdmin
    .from("user_usage")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !usage) {
    const now = new Date().toISOString();
    const newUsage = {
      user_id: userId,
      plan: "free",
      daily_generations_used: 0,
      daily_reset_date: now,
      monthly_generations_used: 0,
      monthly_reset_date: now,
      subscription_status: "active"
    };

    const { data: created } = await supabaseAdmin
      .from("user_usage")
      .upsert(newUsage, { onConflict: "user_id" })
      .select()
      .maybeSingle();

    return created || newUsage;
  }

  return usage;
}

export async function canGenerate(userId: string) {
  const usage = await getOrCreateUsage(userId);
  const now = new Date();

  // Expire pro subscription if past expiration date
  if (usage.plan === "pro" && usage.subscription_expires_at) {
    if (now > new Date(usage.subscription_expires_at)) {
      usage.plan = "free";
      usage.subscription_status = "expired";
      await supabaseAdmin
        .from("user_usage")
        .update({ plan: "free", subscription_status: "expired" })
        .eq("user_id", userId);
    }
  }

  if (usage.plan === "pro") {
    const resetDate = usage.monthly_reset_date ? new Date(usage.monthly_reset_date) : now;
    if (
      resetDate.getMonth() !== now.getMonth() ||
      resetDate.getFullYear() !== now.getFullYear()
    ) {
      await supabaseAdmin
        .from("user_usage")
        .update({
          monthly_generations_used: 0,
          monthly_reset_date: now.toISOString()
        })
        .eq("user_id", userId);

      usage.monthly_generations_used = 0;
    }

    const used = usage.monthly_generations_used || 0;
    if (used >= PREMIUM_MONTHLY_LIMIT) {
      return {
        allowed: false,
        reason: "You've reached your monthly Pro limit of 100 generations.",
        remaining: 0,
        plan: "pro"
      };
    }

    return {
      allowed: true,
      remaining: PREMIUM_MONTHLY_LIMIT - used,
      plan: "pro"
    };
  }

  // Free User
  const resetDate = usage.daily_reset_date ? new Date(usage.daily_reset_date) : now;
  if (resetDate.toDateString() !== now.toDateString()) {
    await supabaseAdmin
      .from("user_usage")
      .update({
        daily_generations_used: 0,
        daily_reset_date: now.toISOString()
      })
      .eq("user_id", userId);

    usage.daily_generations_used = 0;
  }

  const used = usage.daily_generations_used || 0;
  if (used >= FREE_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: "You've used all 5 free generations for today. Upgrade to Pro or come back tomorrow.",
      remaining: 0,
      plan: "free"
    };
  }

  return {
    allowed: true,
    remaining: FREE_DAILY_LIMIT - used,
    plan: "free"
  };
}

export async function consumeCredit(userId: string) {
  const usage = await getOrCreateUsage(userId);

  if (usage.plan === "pro") {
    const nextMonthly = (usage.monthly_generations_used || 0) + 1;
    const { error } = await supabaseAdmin
      .from("user_usage")
      .update({ monthly_generations_used: nextMonthly })
      .eq("user_id", userId);

    if (error) {
      console.error("Pro credit update error:", error);
      return { success: false, reason: error.message };
    }
  } else {
    const nextDaily = (usage.daily_generations_used || 0) + 1;
    const { error } = await supabaseAdmin
      .from("user_usage")
      .update({ daily_generations_used: nextDaily })
      .eq("user_id", userId);

    if (error) {
      console.error("Free credit update error:", error);
      return { success: false, reason: error.message };
    }
  }

  return { success: true };
}
