import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    const origin = req.headers.get("origin") || req.headers.get("referer");
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl && origin) {
      try {
        const u = new URL(origin);
        baseUrl = `${u.protocol}//${u.host}`;
      } catch {
        baseUrl = "http://localhost:3000";
      }
    }
    if (!baseUrl) {
      baseUrl = "http://localhost:3000";
    }

    const callback_url = `${baseUrl}/payment/success`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: 5000 * 100, // ₦5,000 in kobo
          callback_url,
          metadata: {
            user_id: userId,
            email: email,
          },
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}