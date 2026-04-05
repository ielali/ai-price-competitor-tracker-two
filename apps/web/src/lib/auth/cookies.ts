import {
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} from "./constants";

const secure = process.env.NODE_ENV === "production";

export const accessCookieBase = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: ACCESS_MAX_AGE_SEC,
};

export const refreshCookieBase = {
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: REFRESH_MAX_AGE_SEC,
};

export { ACCESS_COOKIE, REFRESH_COOKIE };

export function clearCookie(name: string) {
  return { name, value: "", maxAge: 0, path: "/" };
}
