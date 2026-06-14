import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Nodemailer from "next-auth/providers/nodemailer";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createDatabase } from "@propertyvault/db";
import { accounts, authenticators, sessions, users, verificationTokens } from "@propertyvault/db/schema";

const { db } = createDatabase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens, authenticatorsTable: authenticators }),
  session: { strategy: "database" },
  providers: [
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    }),
    GitHub
  ],
  callbacks: {
    session: async ({ session, user }) => {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.mfaVerified = Boolean(user.mfaVerifiedAt);
      return session;
    },
    authorized: async ({ auth: session }) => Boolean(session)
  }
});
