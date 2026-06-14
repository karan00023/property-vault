import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { auditLog, createDatabase, recoveryCodes } from "@propertyvault/db";
import { generateRecoveryCodes, hashRecoveryCode } from "@/lib/mfa";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.mfaVerified) return NextResponse.json({ error: "Verified MFA required" }, { status: 401 });
  const codes = generateRecoveryCodes();
  const { db, client } = createDatabase();
  await db.transaction(async (tx) => {
    await tx.delete(recoveryCodes).where(eq(recoveryCodes.userId, session.user.id));
    await tx.insert(recoveryCodes).values(codes.map((code) => ({ userId: session.user.id, codeHash: hashRecoveryCode(code) })));
    await tx.insert(auditLog).values({ actorId: session.user.id, action: "auth.recovery_codes_rotated", entityType: "user", entityId: session.user.id });
  });
  await client.end();
  return NextResponse.json({ codes, warning: "These codes are shown once. Store them securely." });
}
