import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { validateDemoCredentials } from '@/lib/demo-auth';

function resolveAuthSecret(): string {
  const fromEnv = process.env.AUTH_SECRET;
  const isProd = process.env.NODE_ENV === 'production';
  /** During `next build`, Next sets this phase while evaluating server modules. */
  const isNextProdBuild = process.env.NEXT_PHASE === 'phase-production-build';

  if (isProd && !fromEnv) {
    if (isNextProdBuild) {
      return 'build-placeholder-set-AUTH_SECRET-for-runtime';
    }
    throw new Error('AUTH_SECRET is required in production');
  }
  return fromEnv ?? 'dev-auth-secret-change-me';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: resolveAuthSecret(),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }
        if (!validateDemoCredentials(email, password)) {
          return null;
        }
        return {
          id: email.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          name: email.split('@')[0] ?? email,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
