/** HMAC-SHA256 hex digest for optional X-Price-Tracker-Signature header. */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("")
}

export function buildTestWebhookPayload(): string {
  return JSON.stringify({
    event: "price_tracker.test",
    sentAt: new Date().toISOString(),
    message: "Sample alert delivery from Price Tracker notification settings.",
  })
}
