import { PostHog } from "posthog-node";

let client: PostHog | null = null;
let disabledLogged = false;

function getPostHog(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    if (!disabledLogged && process.env.NODE_ENV === "production") {
      console.warn("[posthog] NEXT_PUBLIC_POSTHOG_KEY missing — analytics disabled.");
    }
    disabledLogged = true;
    return null;
  }
  if (!client) {
    client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    });
  }
  return client;
}

export async function trackServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const posthog = getPostHog();
  if (!posthog) return;
  try {
    posthog.capture({
      distinctId,
      event,
      properties: {
        app: "copycoach",
        ...properties,
      },
    });
  } catch (err) {
    console.error("[posthog] capture error:", err);
  }
}

export function trackServerUser(distinctId: string, email?: string | null): void {
  const posthog = getPostHog();
  if (!posthog) return;
  try {
    posthog.identify({ distinctId, properties: email ? { email } : {} });
  } catch (err) {
    console.error("[posthog] identify error:", err);
  }
}