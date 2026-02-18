import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      mfaEnabled?: boolean;
      mfaVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    mfaEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
