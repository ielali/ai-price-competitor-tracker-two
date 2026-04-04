import type { NotificationPayload } from "./types";

function assertHttpUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Webhook url must be a valid URL");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Webhook url must use http or https");
  }
}

/** POST JSON to a customer endpoint (generic webhook delivery). */
export async function deliverHttpWebhook(
  url: string,
  payload: NotificationPayload,
  headers?: Record<string, string>,
): Promise<void> {
  if (!url?.trim()) {
    throw new Error("Webhook url is required");
  }
  assertHttpUrl(url);

  const body = JSON.stringify({
    event: "notification",
    title: payload.title,
    body: payload.body,
    metadata: payload.metadata ?? {},
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Webhook delivery failed: ${res.status} ${res.statusText}${detail ? ` — ${detail.slice(0, 200)}` : ""}`,
    );
  }
}
