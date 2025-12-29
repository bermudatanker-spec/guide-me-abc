type ClickEventType = "whatsapp" | "route" | "call" | "website" | "email";

type TrackClickArgs = {
  businessId: string;
  eventType: ClickEventType;
  path?: string;
  lang?: string;
  island?: string;
};

/**
 * Fire-and-forget tracking. Mag nooit de UX blokkeren.
 */
export async function trackClick(args: TrackClickArgs): Promise<void> {
  try {
    // relative URL works on all envs
    await fetch("/api/track/click", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(args),
      // keepalive helps on mobile / when navigating away
      keepalive: true,
    });
  } catch {
    // silently ignore
  }
}