import { NextResponse } from "next/server";
import { activateSubscription } from "@/lib/subscription";
import { getServerUser } from "@/lib/auth-server";
import { trackServerEvent } from "@/lib/analytics";

export async function GET(req: Request) {
  const user = await getServerUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "No reference provided" },
      { status: 400 }
    );
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { error: "Paystack is not configured on the server." },
      { status: 500 }
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
      const metadataUserId = data.data.metadata?.user_id as string | undefined;
      const customerEmail = data.data.customer?.email as string | undefined;

      // Only activate for the authenticated user. Never trust redirect query
      // params or a caller-supplied identity.
      const belongsToUser =
        (metadataUserId && metadataUserId === user.id) ||
        (customerEmail &&
          user.email &&
          customerEmail.toLowerCase() === user.email.toLowerCase());

      if (belongsToUser) {
        const result = await activateSubscription(user.id);
        console.log(
          `Successfully activated Pro subscription for user ${user.id}`,
          { alreadyActive: result.alreadyActive, error: result.error?.message }
        );
        await trackServerEvent(user.id, "upgrade_completed", {
          gateway: "paystack",
          source: "verify",
          alreadyActive: result.alreadyActive,
        });
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