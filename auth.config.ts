import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import { LoginSchema } from "@/schemas";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// * auth.config.ts is the file that can be used in the edge environment

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // The Credentials provider allows you to handle signing in with arbitrary credentials, such as a username and password, domain, or two factor authentication or hardware device (e.g. YubiKey U2F / FIDO).
    Credentials({
      // Gives full control over how you handle the credentials received from the user.
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);

          // If the user is not found in the database or the password is incorrect so everything can be ok to move on
          if (!user || !user.password) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return user;
          }
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
