/**
 * Returns the path if it is same-origin relative (single leading slash, not protocol-relative).
 */
export function safeAppPath(path: string): string | null {
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return path;
}

/** pathname + search from the incoming request URL. */
export function safeRelativeCallback(pathname: string, search: string): string | null {
  return safeAppPath(`${pathname}${search}`);
}
