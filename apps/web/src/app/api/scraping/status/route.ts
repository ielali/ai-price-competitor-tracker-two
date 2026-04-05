import { NextResponse } from "next/server";

import { getScrapingStatus } from "@/lib/scraping-status";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = getScrapingStatus();
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
