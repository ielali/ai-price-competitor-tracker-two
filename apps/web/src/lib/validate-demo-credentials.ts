const DEFAULT_EMAIL = 'demo@example.com';
const DEFAULT_PASSWORD = 'demo';

/** Resolved demo user for the credentials provider (env-driven). */
export function getExpectedDemoCredentials(): { email: string; password: string } {
  const email =
    process.env.DEMO_USER_EMAIL ??
    process.env.AUTH_DEMO_EMAIL ??
    DEFAULT_EMAIL;
  const password =
    process.env.DEMO_USER_PASSWORD ??
    process.env.AUTH_DEMO_PASSWORD ??
    DEFAULT_PASSWORD;
  return { email, password };
}

/** Validates email/password against configured demo credentials (stand-in until API auth exists). */
export function validateDemoCredentials(email: string, password: string): boolean {
  const expected = getExpectedDemoCredentials();
  return email === expected.email && password === expected.password;
}
