import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserByById } from "@/data/user";

// * auth.ts is the file that use prisma adapter which can not be used in the edge environment

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ user }) {
      const existingUser = await getUserByById(user.id as string);

      if (!existingUser || !existingUser.emailVerified) {
        return false;
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token }) {
      // User is logged out
      if (!token.sub) {
        // userId is store in sub field
        return token;
      }

      const existingUser = await getUserByById(token.sub);

      if (!existingUser) {
        return token;
      }

      // Attach user role to the token to pass it to the session callback above
      token.role = existingUser.role;
      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
