import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
