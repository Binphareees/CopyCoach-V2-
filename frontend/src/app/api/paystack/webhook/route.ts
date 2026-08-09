import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { activateSubscription } from "@/lib/subscription";
export async function POST(req: Request) {

  const body = await req.text();

  const signature =
    req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac(
      "sha512",
      process.env.PAYSTACK_SECRET_KEY!
    )
    .update(body)
    .digest("hex");

  if (signature !== hash) {

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );

  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
console.log("CHARGE SUCCESS REACHED");
    const email =
      event.data.customer.email;
console.log("PAYMENT EMAIL:", email);


    const {
      data: user,
      error: profileError
    } = await supabaseAdmin
      .from("profiles")
      .select("id,email")
      .eq("email", email)
      .maybeSingle();


    if (!user) {

      console.error("No matching profile found for payment email.");
      return NextResponse.json({
        received: true
      });

    }

   const {
  data: updatedUsage,
  error: updateError
} = await activateSubscription(user.id);

console.log("UPDATED USAGE:", updatedUsage);
console.log("UPDATE ERROR:", updateError);



  }

  return NextResponse.json({
    received: true
  });

}