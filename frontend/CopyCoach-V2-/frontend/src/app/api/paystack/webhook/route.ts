import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { activateSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (process.env.PAYSTACK_SECRET_KEY) {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (signature !== hash) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const email = event.data?.customer?.email;
    const metadataUserId = event.data?.metadata?.user_id;

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
      const { data: updatedUsage, error: updateError } = await activateSubscription(userId);
      console.log("PAYSTACK WEBHOOK UPDATED USAGE:", updatedUsage, updateError);
    }
  }

  return NextResponse.json({ received: true });
}