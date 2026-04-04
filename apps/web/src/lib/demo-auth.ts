export type DemoUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Validates credentials against demo env vars (MVP until Fastify auth API exists).
 */
export function validateDemoCredentials(
  email: string | undefined,
  password: string | undefined,
  demoEmail: string | undefined,
  demoPassword: string | undefined,
): DemoUser | null {
  if (!email || !password || !demoEmail || !demoPassword) {
    return null;
  }
  if (email === demoEmail && password === demoPassword) {
    return { id: 'demo-user', email: demoEmail, name: 'Demo User' };
  }
  return null;
}
