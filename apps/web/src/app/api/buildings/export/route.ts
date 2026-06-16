import { NextResponse } from "next/server";
import { safeListPublishedBuildings } from "@/lib/catalog";

function cell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const { buildings } = await safeListPublishedBuildings();
  const rows = [
    ["name", "address", "market", "neighborhood", "floors", "total_units", "leasing_url", "verified_source"],
    ...buildings.map((building) => [
      building.name, building.address, building.market, building.neighborhood, building.floors,
      building.totalUnits, building.leasingUrl, building.provenance.sourceUrl
    ])
  ];
  return new NextResponse(rows.map((row) => row.map(cell).join(",")).join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=propertyvault-buildings.csv" }
  });
}
