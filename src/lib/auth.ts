import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import authConfig from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;

        // Fetch fresh user data from database
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { mfaEnabled: true },
        });

        if (user) {
          session.user.mfaEnabled = user.mfaEnabled;
        }
      }
      return session;
    },
  },
  ...authConfig,
});
