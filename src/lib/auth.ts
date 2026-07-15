import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

// Throttle login attempts per IP+email pair so brute-forcing a single
// account (or spraying passwords across many) both get slowed down,
// without locking out everyone sharing an office/NAT IP.
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function getRequestIp(req: { headers?: Record<string, unknown> } | undefined): string {
  const headers = req?.headers ?? {};
  const forwardedFor = headers["x-forwarded-for"];
  const forwardedForValue = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  if (typeof forwardedForValue === "string" && forwardedForValue.length > 0) {
    return forwardedForValue.split(",")[0].trim();
  }

  const realIp = headers["x-real-ip"];
  const realIpValue = Array.isArray(realIp) ? realIp[0] : realIp;
  if (typeof realIpValue === "string" && realIpValue.length > 0) {
    return realIpValue.trim();
  }

  return "unknown";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = getRequestIp(req);
        const { success } = rateLimit(
          `login:${ip}:${credentials.email.toLowerCase()}`,
          LOGIN_LIMIT,
          LOGIN_WINDOW_MS
        );
        if (!success) {
          throw new Error("Too many login attempts. Please try again in a few minutes.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
