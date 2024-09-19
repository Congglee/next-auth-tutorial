import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

// * auth.ts is the file that use prisma adapter which can not be used in the edge environment

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  // Events are asynchronous functions that do not return a response, they are useful for audit logs / reporting or handling any other side-effects.
  events: {
    // Sent when an account in a given provider is linked to a user in our user database. For example, when a user signs up with Twitter or when an existing user links their Google account.
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  // Callbacks are asynchronous functions you can use to control what happens when an auth-related action is performed. Callbacks allow you to implement access controls without a database or to integrate with external databases or APIs.
  callbacks: {
    // Controls whether a user is allowed to sign in or not. Returning true continues the sign-in flow.
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }

      const existingUser = await getUserById(user.id as string);

      // Prevent user from signing in if email is not verified
      if (!existingUser?.emailVerified) {
        // Returning false or throwing an error will stop the sign-in flow and redirect the user to the error page.
        return false;
      }

      // TODO: Add 2FA check here
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) {
          return false;
        }

        // Delete two factor confirmation for next sign in
        await prisma.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    // This callback is called whenever a session is checked. (i.e. when invoking the /api/session endpoint, using useSession or getSession)
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      // The return value will be exposed to the client, so be careful what you return here!
      // If you want to make anything available to the client which you've added to the token through the JWT callback, you have to explicitly return it here as well.
      return session;
    },
    // This callback is called whenever a JSON Web Token is created (i.e. at sign in) or updated (i.e whenever a session is accessed in the client).
    async jwt({ token }) {
      // User is logged out
      if (!token.sub) {
        // userId is store in sub field
        return token;
      }

      const existingUser = await getUserById(token.sub);

      if (!existingUser) {
        return token;
      }

      // Attach user role to the token to pass it to the session callback above
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      // Anything you return here will be saved in the JWT and forwarded to the session callback
      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  // Configure your session like if you want to use JWT or a database, how long until an idle session expires, or to throttle write operations in case you are using a database.
  session: { strategy: "jwt" },
  ...authConfig,
});
