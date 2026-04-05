/**
 * Demo credential check for the credentials provider until the Fastify auth API exists.
 * Compares against DEMO_USER_EMAIL / DEMO_USER_PASSWORD from the environment.
 */
export function validateDemoCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.DEMO_USER_EMAIL;
  const expectedPassword = process.env.DEMO_USER_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return email === expectedEmail && password === expectedPassword;
}
