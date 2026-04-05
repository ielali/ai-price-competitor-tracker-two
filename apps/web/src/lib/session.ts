import type { SessionOptions } from "iron-session";

export interface SessionData {
  isLoggedIn: boolean;
  user?: {
    email: string;
  };
}

function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function getSessionPassword(): string {
  const pwd = process.env.SESSION_SECRET;
  if (pwd && pwd.length >= 32) {
    return pwd;
  }
  // `next build` sets NODE_ENV=production while prerendering; allow fallback then only.
  const requireSecret =
    process.env.NODE_ENV === "production" && !isNextProductionBuild();
  if (requireSecret) {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters in production.",
    );
  }
  return "development-only-secret-32chars!!";
}

export const sessionOptions: SessionOptions = {
  cookieName: "price_tracker_session",
  password: getSessionPassword(),
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  },
};
