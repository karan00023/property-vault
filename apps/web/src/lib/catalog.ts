import { and, eq, isNotNull, sql } from "drizzle-orm";
import {
  amenities, buildingAmenities, buildingLinks, buildings, createDatabase,
  fieldProvenance, markets, neighborhoods, sources, sourcingTasks, unitMix
} from "@propertyvault/db";

export type ProvenanceDisplay = { sourceUrl: string; sourceLabel: string; fetchedAt: string; confidence: string };
export type UnitMixDisplay = { label: string; rentBand: string; sqftBand: string; sourceUrl: string; asOfDate: string; confidence: string };
export type SourcingState = { floorPlanTasks: number; photoTasks: number };

export type BuildingSummary = {
  slug: string;
  name: string;
  address: string;
  neighborhood: string;
  market: string;
  leasingUrl: string;
  availabilityUrl?: string;
  coordinates: [number, number];
  residenceTypes: string[];
  attributes: string[];
  provenance: ProvenanceDisplay;
  coordinateProvenance: ProvenanceDisplay;
  sourceRecords: ProvenanceDisplay[];
  unitMix: UnitMixDisplay[];
  sourcing: SourcingState;
  review: "approved";
  eyebrow: string;
  description: string;
  floors: number | null;
  totalUnits: number | null;
  developer: string | null;
  propertyManager: string | null;
  verifiedAt: string | null;
};

export type Building = BuildingSummary;

function bedLabel(value: string) {
  if (value === "0" || value === "0.0") return "Studio";
  return `${Number(value)} Bedroom`;
}

function moneyBand(min: number | null, max: number | null) {
  if (!min && !max) return "Sourced, no rent band published";
  if (min && max && min !== max) return `$${min.toLocaleString()}-$${max.toLocaleString()}`;
  return `$${(min ?? max)!.toLocaleString()}`;
}

function sqftBand(min: number | null, max: number | null) {
  if (!min && !max) return "Square footage not sourced";
  if (min && max && min !== max) return `${min.toLocaleString()}-${max.toLocaleString()} sq ft`;
  return `${(min ?? max)!.toLocaleString()} sq ft`;
}

async function sourceDisplay(db: ReturnType<typeof createDatabase>["db"], sourceId: string, confidence: string, label: string) {
  const [record] = await db.select().from(sources).where(eq(sources.id, sourceId));
  if (!record) throw new Error(`Missing source record ${sourceId}`);
  return { sourceUrl: record.url, sourceLabel: label, fetchedAt: record.fetchedAt.toISOString(), confidence };
}

export async function listPublishedBuildings(): Promise<BuildingSummary[]> {
  const { db, client } = createDatabase();
  try {
    const rows = await db.select({
      id: buildings.id, slug: buildings.slug, name: buildings.name, addressLine1: buildings.addressLine1, city: buildings.city,
      region: buildings.region, postalCode: buildings.postalCode, market: markets.name, neighborhood: neighborhoods.name,
      leasingUrl: buildingLinks.url, floors: buildings.floors, totalUnits: buildings.totalUnits, developer: buildings.developer,
      propertyManager: buildings.propertyManager, verifiedAt: buildings.verifiedAt,
      longitude: sql<number>`ST_X(${buildings.geom}::geometry)`,
      latitude: sql<number>`ST_Y(${buildings.geom}::geometry)`
    }).from(buildings)
      .innerJoin(markets, eq(buildings.marketId, markets.id))
      .innerJoin(neighborhoods, eq(buildings.neighborhoodId, neighborhoods.id))
      .innerJoin(buildingLinks, and(eq(buildingLinks.buildingId, buildings.id), eq(buildingLinks.kind, "leasing_page"), eq(buildingLinks.verificationStatus, "verified")))
      .where(and(eq(buildings.status, "published"), isNotNull(buildings.publishedAt), isNotNull(buildings.geom)));

    return Promise.all(rows.map(async (row) => {
      const provenance = await db.select().from(fieldProvenance).where(and(eq(fieldProvenance.buildingId, row.id), isNotNull(fieldProvenance.reviewedAt)));
      const leasingSource = provenance.find((item) => item.fieldPath === "leasing_url");
      const geomSource = provenance.find((item) => item.fieldPath === "geom");
      if (!leasingSource || !geomSource) throw new Error(`Published building ${row.slug} lacks reviewed provenance`);
      const amenityRows = await db.select({ label: amenities.label }).from(buildingAmenities)
        .innerJoin(amenities, eq(buildingAmenities.amenityId, amenities.id)).where(eq(buildingAmenities.buildingId, row.id));
      const unitRows = await db.select().from(unitMix).where(eq(unitMix.buildingId, row.id));
      const taskRows = await db.select().from(sourcingTasks).where(eq(sourcingTasks.buildingId, row.id));
      const sourceRecords = await Promise.all(provenance.slice(0, 6).map((item) => sourceDisplay(db, item.sourceId, String(item.confidence), item.fieldPath)));
      const availability = await db.select().from(buildingLinks).where(and(eq(buildingLinks.buildingId, row.id), eq(buildingLinks.kind, "availability"))).limit(1);

      const unitMixDisplay = await Promise.all(unitRows.map(async (item) => {
        const [source] = await db.select().from(sources).where(eq(sources.id, item.sourceId));
        return {
          label: bedLabel(item.bedCount),
          rentBand: moneyBand(item.rentMin, item.rentMax),
          sqftBand: sqftBand(item.sqftMin, item.sqftMax),
          sourceUrl: source?.url ?? "",
          asOfDate: item.asOfDate,
          confidence: String(item.confidence)
        };
      }));

      const residenceTypes = Array.from(new Set([
        ...unitMixDisplay.map((item) => item.label),
        ...provenance.filter((item) => item.fieldPath === "residence_types").map(() => "Studio-3 Bedroom")
      ])).filter(Boolean);

      return {
        slug: row.slug, name: row.name, address: `${row.addressLine1}, ${row.city}, ${row.region} ${row.postalCode}`,
        neighborhood: row.neighborhood, market: row.market, leasingUrl: row.leasingUrl, availabilityUrl: availability[0]?.url,
        coordinates: [Number(row.longitude), Number(row.latitude)] as [number, number],
        residenceTypes, attributes: amenityRows.map((item) => item.label), review: "approved" as const,
        eyebrow: `${row.market} rental building with verified direct leasing`,
        description: `${row.name} is a reviewed PropertyVault building record. We publish only sourced facts and route incomplete assets to sourcing tasks.`,
        floors: row.floors, totalUnits: row.totalUnits, developer: row.developer, propertyManager: row.propertyManager,
        verifiedAt: row.verifiedAt?.toISOString() ?? null, unitMix: unitMixDisplay,
        sourcing: {
          floorPlanTasks: taskRows.filter((task) => task.kind === "floor_plans" && task.status !== "done").length,
          photoTasks: taskRows.filter((task) => task.kind === "photos" && task.status !== "done").length
        },
        provenance: await sourceDisplay(db, leasingSource.sourceId, String(leasingSource.confidence), "Leasing link source"),
        coordinateProvenance: await sourceDisplay(db, geomSource.sourceId, String(geomSource.confidence), "Geocode source"),
        sourceRecords
      };
    }));
  } finally {
    await client.end();
  }
}

export async function getPublishedBuilding(slug: string) {
  return (await listPublishedBuildings()).find((building) => building.slug === slug);
}

export async function safeListPublishedBuildings() {
  try {
    return { buildings: await listPublishedBuildings(), databaseReady: true as const };
  } catch {
    if (process.env.NODE_ENV !== "production") console.warn("PropertyVault database unavailable; rendering setup state.");
    return { buildings: [], databaseReady: false as const };
  }
}
