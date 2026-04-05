/**
 * Demo credentials gate for development. Replace with real IdP / API auth in production.
 */
export function validateDemoCredentials(email: string, password: string): boolean {
  const expectedEmail =
    process.env.AUTH_DEMO_EMAIL?.trim().toLowerCase() ?? 'demo@example.com'.toLowerCase();
  const expectedPassword = process.env.AUTH_DEMO_PASSWORD ?? 'demo-password';

  if (!email?.trim()) return false;

  return email.trim().toLowerCase() === expectedEmail && password === expectedPassword;
}
