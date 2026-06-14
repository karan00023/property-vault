import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "admin" | "reviewer" | "owner";
      mfaVerified: boolean;
    };
  }
  interface User {
    role: "admin" | "reviewer" | "owner";
    mfaVerifiedAt: Date | null;
  }
}
