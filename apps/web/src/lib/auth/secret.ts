const DEV_FALLBACK = 'dev-insecure-auth-secret-32chars!';

let cached: Uint8Array | null = null;

/**
 * HS256 key for JWT signing. Requires AUTH_SECRET (≥32 chars) in production.
 */
export function getJwtSecret(): Uint8Array {
  if (cached) {
    return cached;
  }
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set and at least 32 characters in production');
    }
    cached = new TextEncoder().encode(DEV_FALLBACK);
    return cached;
  }
  cached = new TextEncoder().encode(secret);
  return cached;
}

/**
 * Test helper: reset cached secret between cases.
 */
export function __resetJwtSecretCacheForTests(): void {
  cached = null;
}
