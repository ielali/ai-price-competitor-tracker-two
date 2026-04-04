import { NextResponse } from "next/server"

const CHANNELS = ["email", "slack", "webhook"] as const

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  if (!body || typeof body !== "object" || !("channel" in body)) {
    return NextResponse.json({ error: "channel required" }, { status: 400 })
  }

  const channel = (body as { channel: unknown }).channel
  if (typeof channel !== "string" || !CHANNELS.includes(channel as (typeof CHANNELS)[number])) {
    return NextResponse.json({ error: "invalid channel" }, { status: 400 })
  }

  return NextResponse.json({ ok: true, channel })
}
