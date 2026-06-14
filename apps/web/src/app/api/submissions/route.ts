import { NextResponse } from "next/server";
import { z } from "zod";
import { auditLog, createDatabase, submissions } from "@propertyvault/db";

const submissionSchema = z.object({
  buildingName: z.string().min(2).max(160),
  leasingUrl: z.string().url(),
  email: z.string().email(),
  notes: z.string().max(2000).optional()
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = submissionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { db, client } = createDatabase();
  await db.transaction(async (tx) => {
    const [submission] = await tx.insert(submissions).values({ submittedUrl: parsed.data.leasingUrl, optionalName: parsed.data.buildingName, contactEmail: parsed.data.email }).returning();
    await tx.insert(auditLog).values({ action: "submission.received", entityType: "submission", entityId: submission.id, after: { submittedUrl: submission.submittedUrl } });
  });
  await client.end();
  return NextResponse.redirect(new URL("/submit?received=true", request.url), 303);
}
