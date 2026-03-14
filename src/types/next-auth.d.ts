import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      mfaEnabled?: boolean;
      mfaVerified?: boolean;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    mfaEnabled?: boolean;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    mfaEnabled?: boolean;
    mfaVerified?: boolean;
    role?: string;
  }
}
