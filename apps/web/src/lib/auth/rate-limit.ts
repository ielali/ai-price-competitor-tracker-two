type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

/** Default: 30 requests per sliding minute per key */
export function checkRateLimit(
  key: string,
  maxRequests = 30,
  windowMs = 60_000,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (bucket.count >= maxRequests) {
    const retryAfterMs = windowMs - (now - bucket.windowStart);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  bucket.count += 1;
  return { ok: true };
}

export function __resetRateLimitsForTests(): void {
  buckets.clear();
}
