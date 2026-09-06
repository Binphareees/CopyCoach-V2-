import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { activateSubscription } from "@/lib/subscription";
import { trackServerEvent } from "@/lib/analytics";

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  // Fail closed: if the secret is missing, never trust the event.
  if (!secretKey) {
    console.error(
      "[paystack-webhook] PAYSTACK_SECRET_KEY is not configured. Refusing to process webhook."
    );
    return NextResponse.json(
      { error: "Payment webhook is not configured on the server. Contact admin." },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(body)
    .digest("hex");

  if (!signature || signature !== hash) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let event: { event?: string; data?: { customer?: { email?: string }; metadata?: { user_id?: string }; reference?: string } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (event.event === "charge.success") {
    const email = event.data?.customer?.email;
    const metadataUserId = event.data?.metadata?.user_id;
    const reference = event.data?.reference;

    let userId = metadataUserId;

    if (!userId && email) {
      const { data: user } = await supabaseAdmin
        .from("profiles")
        .select("id,email")
        .eq("email", email)
        .maybeSingle();

      if (user?.id) {
        userId = user.id;
      }
    }

    if (userId) {
      // Idempotent activation: repeated deliveries of the same successful
      // charge do not reset/re-extend the subscription window.
      const result = await activateSubscription(userId);
      console.log("PAYSTACK WEBHOOK UPDATED USAGE:", {
        userId,
        reference,
        alreadyActive: result.alreadyActive,
        error: result.error?.message,
      });

      await trackServerEvent(userId, "upgrade_completed", {
        gateway: "paystack",
        source: "webhook",
        reference,
        alreadyActive: result.alreadyActive,
      });
    }
  }

  return NextResponse.json({ received: true });
}