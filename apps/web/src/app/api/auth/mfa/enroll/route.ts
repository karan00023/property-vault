import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { auth } from "@/auth";
import { createDatabase, mfaCredentials } from "@propertyvault/db";
import { encryptSecret } from "@/lib/mfa";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = authenticator.generateSecret();
  const encryptedSecret = encryptSecret(secret);
  const { db, client } = createDatabase();
  await db.insert(mfaCredentials).values({ userId: session.user.id, encryptedSecret })
    .onConflictDoUpdate({ target: mfaCredentials.userId, set: { encryptedSecret, enabledAt: null } });
  await client.end();
  return NextResponse.json({ uri: authenticator.keyuri(session.user.email ?? session.user.id, "PropertyVault", secret) });
}
