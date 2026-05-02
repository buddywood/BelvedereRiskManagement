import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          console.warn("Credentials authorize rejected invalid payload");
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          console.warn("Credentials authorize failed: user not found", { email });
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          console.warn("Credentials authorize failed: invalid password", { email });
          return null;
        }

        if (user.deletedAt) {
          console.warn("Credentials authorize failed: account deactivated", { email });
          return null;
        }

        console.info("Credentials authorize succeeded", {
          email: user.email,
          userId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
} satisfies NextAuthConfig;
