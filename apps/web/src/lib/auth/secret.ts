/** Returns a UTF-8 key for HS256 (jose); Uint8Array works in Node route handlers and Edge middleware. */
export function getAuthSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET must be set to a string of at least 32 characters in production"
      );
    }
    return new TextEncoder().encode("dev-secret-32-characters-minimum!!");
  }
  return new TextEncoder().encode(s);
}
