import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { activateSubscription } from "@/lib/subscription";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "No reference provided" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status && data.data?.status === "success") {
      const metadataUserId = data.data.metadata?.user_id;
      const customerEmail = data.data.customer?.email;

      let userId = metadataUserId;

      if (!userId && customerEmail) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .maybeSingle();

        if (profile?.id) {
          userId = profile.id;
        }
      }

      if (userId) {
        await activateSubscription(userId);
        console.log(`Successfully activated Pro subscription for user ${userId}`);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json(
      { error: "Verification error" },
      { status: 500 }
    );
  }
}