import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

export async function POST() {
  const c = cookies();
  c.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  c.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
