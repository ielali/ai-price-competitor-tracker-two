/** Prevent open redirects: only same-origin relative paths. */
export function safeInternalPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('://')) {
    return '/';
  }
  return raw;
}

type SearchParamsLike = { get(name: string): string | null };

/** Prefer callbackUrl (AC); fall back to legacy `from` query param. */
export function authCallbackDestination(searchParams: SearchParamsLike): string {
  const raw = searchParams.get('callbackUrl') ?? searchParams.get('from');
  return safeInternalPath(raw);
}
