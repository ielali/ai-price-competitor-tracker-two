import type { NotificationPayload } from "./types";

function assertHttpsUrl(url: string, label: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${label} must use https`);
  }
}

/** Post a plain-text message to a Slack Incoming Webhook. */
export async function deliverSlack(
  webhookUrl: string,
  payload: NotificationPayload,
): Promise<void> {
  if (!webhookUrl?.trim()) {
    throw new Error("Slack webhookUrl is required");
  }
  assertHttpsUrl(webhookUrl, "Slack webhookUrl");

  const text = [payload.title, payload.body].filter(Boolean).join("\n\n");
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Slack webhook failed: ${res.status} ${res.statusText}${detail ? ` — ${detail.slice(0, 200)}` : ""}`,
    );
  }
}
