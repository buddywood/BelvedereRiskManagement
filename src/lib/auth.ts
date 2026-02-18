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
    async signIn({ user }) {
      // Create a database session on sign-in for MFA tracking
      if (user.id) {
        // Use Web Crypto API for Edge Runtime compatibility
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const sessionToken = Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Check if user has MFA enabled
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { mfaEnabled: true },
        });

        // Create session with mfaVerified=false if MFA is enabled, true otherwise
        await prisma.session.create({
          data: {
            sessionToken,
            userId: user.id,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            mfaVerified: !dbUser?.mfaEnabled, // Auto-verify if MFA not enabled
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;

        // Fetch fresh user data and session MFA verification status
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { mfaEnabled: true },
        });

        if (user) {
          session.user.mfaEnabled = user.mfaEnabled;

          // Check if this session has verified MFA (for users with MFA enabled)
          if (user.mfaEnabled) {
            // Find the most recent active session
            const userSessions = await prisma.session.findMany({
              where: {
                userId: token.id as string,
                expires: { gt: new Date() },
              },
              orderBy: { expires: "desc" },
              take: 1,
            });

            session.user.mfaVerified = userSessions.length > 0 ? userSessions[0].mfaVerified : false;
          } else {
            // If MFA is not enabled, mark as verified
            session.user.mfaVerified = true;
          }
        }
      }
      return session;
    },
  },
  ...authConfig,
});
