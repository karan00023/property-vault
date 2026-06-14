import { NextResponse } from "next/server";
import { listPublishedBuildings } from "@/lib/catalog";

export async function GET() {
  return NextResponse.json({ data: await listPublishedBuildings(), meta: { reviewGate: "approved-only" } });
}
