import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    email?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email?: string;
  }
}
