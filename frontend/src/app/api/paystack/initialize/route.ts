import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { trackServerEvent } from "@/lib/analytics";

const PRO_PRICE_KOBO = 5000 * 100; // ₦5,000 in kobo

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser(req);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paystack is not configured on the server." },
        { status: 500 }
      );
    }

    const email = user.email || "";
    const userId = user.id;

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
          amount: PRO_PRICE_KOBO,
          callback_url,
          metadata: {
            user_id: userId,
            email,
          },
        }),
      }
    );

    const data = await response.json();

    await trackServerEvent(userId, "upgrade_started", { gateway: "paystack" });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}