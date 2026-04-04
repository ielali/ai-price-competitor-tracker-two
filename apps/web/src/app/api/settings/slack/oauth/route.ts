import { NextResponse } from "next/server"

/**
 * Placeholder for Slack OAuth start. In production this redirects to Slack's
 * authorize URL with client_id, scopes, and state.
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Slack OAuth would redirect from here in production.",
    simulateNextStep: "Open the Finish Slack connection dialog to pick workspace and channel.",
  })
}
