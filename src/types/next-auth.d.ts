import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      mfaEnabled?: boolean;
      mfaVerified?: boolean;
      role?: string;
      firstName?: string | null;
    };
  }

  interface User {
    mfaEnabled?: boolean;
    mfaVerified?: boolean;
    role?: string;
    firstName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    mfaEnabled?: boolean;
    mfaVerified?: boolean;
    role?: string;
    firstName?: string | null;
  }
}
