import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { auditLog, createDatabase, mfaCredentials, users } from "@propertyvault/db";
import { decryptSecret } from "@/lib/mfa";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { token } = await request.json() as { token?: string };
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });
  const { db, client } = createDatabase();
  const [credential] = await db.select().from(mfaCredentials).where(eq(mfaCredentials.userId, session.user.id));
  if (!credential) return NextResponse.json({ error: "MFA enrollment required" }, { status: 409 });
  const valid = authenticator.verify({ secret: decryptSecret(credential.encryptedSecret), token });
  if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(mfaCredentials).set({ enabledAt: now }).where(eq(mfaCredentials.userId, session.user.id));
    await tx.update(users).set({ mfaVerifiedAt: now }).where(eq(users.id, session.user.id));
    await tx.insert(auditLog).values({ actorId: session.user.id, action: "auth.mfa_verified", entityType: "user", entityId: session.user.id });
  });
  await client.end();
  return NextResponse.json({ verified: true, signInRequired: true });
}
