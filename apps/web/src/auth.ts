import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { validateDemoCredentials } from "@/lib/validate-demo-credentials";
import { safeRelativeCallback } from "@/lib/safe-relative-path";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        if (!validateDemoCredentials(email, password)) return null;
        return { id: email, email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ request, auth }) {
      const url = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const pathname = url.pathname;
      const isApiAuth = pathname.startsWith("/api/auth");
      const isLogin = pathname === "/login";

      if (isApiAuth) return true;

      if (isLogin) {
        if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
        return true;
      }

      if (!isLoggedIn) {
        const login = new URL("/login", request.url);
        const safe = safeRelativeCallback(pathname, url.search);
        if (safe && safe !== "/login") {
          login.searchParams.set("callbackUrl", safe);
        }
        return NextResponse.redirect(login);
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.email = token.email as string;
      return session;
    },
  },
});
