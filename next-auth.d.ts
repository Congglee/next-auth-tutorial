import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

// Add type definitions for the user object in the session
export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
};

// Extend the session object to include the user object
declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

// Extend the JWT object to include the role field
declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
