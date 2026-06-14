import { and, eq, isNotNull } from "drizzle-orm";
import { buildingLinks, buildings, createDatabase, fieldProvenance, markets, neighborhoods, sources } from "@propertyvault/db";

export type BuildingSummary = {
  slug: string;
  name: string;
  address: string;
  neighborhood: string;
  market: string;
  leasingUrl: string;
  coordinates: [number, number];
  residenceTypes: string[];
  attributes: string[];
  provenance: { sourceUrl: string; sourceLabel: string; fetchedAt: string; confidence: string };
  coordinateProvenance: { sourceUrl: string; sourceLabel: string; fetchedAt: string; confidence: string };
  review: "approved";
  eyebrow: string;
  description: string;
};

export type Building = BuildingSummary;

export async function listPublishedBuildings(): Promise<BuildingSummary[]> {
  const { db, client } = createDatabase();
  try {
    const rows = await db.select({
      id: buildings.id, slug: buildings.slug, name: buildings.name, addressLine1: buildings.addressLine1,
      city: buildings.city, region: buildings.region, postalCode: buildings.postalCode, geom: buildings.geom,
      market: markets.name, neighborhood: neighborhoods.name, leasingUrl: buildingLinks.url,
      verifiedAt: buildings.verifiedAt
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
      const [leasingSourceRecord] = await db.select().from(sources).where(eq(sources.id, leasingSource.sourceId));
      const [geomSourceRecord] = await db.select().from(sources).where(eq(sources.id, geomSource.sourceId));
      if (!leasingSourceRecord || !geomSourceRecord) throw new Error(`Published building ${row.slug} lacks source records`);
      const point = row.geom!.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      if (!point) throw new Error(`Published building ${row.slug} has invalid geometry`);
      return {
        slug: row.slug, name: row.name,
        address: `${row.addressLine1}, ${row.city}, ${row.region} ${row.postalCode}`,
        neighborhood: row.neighborhood, market: row.market, leasingUrl: row.leasingUrl,
        coordinates: [Number(point[1]), Number(point[2])] as [number, number],
        residenceTypes: [], attributes: [], review: "approved" as const,
        eyebrow: "Building-direct leasing, independently verified",
        description: "PropertyVault publishes only reviewed facts with field-level provenance.",
        provenance: { sourceUrl: leasingSourceRecord.url, sourceLabel: "Reviewed source", fetchedAt: leasingSourceRecord.fetchedAt.toISOString(), confidence: String(leasingSource.confidence) },
        coordinateProvenance: { sourceUrl: geomSourceRecord.url, sourceLabel: "Reviewed geocode source", fetchedAt: geomSourceRecord.fetchedAt.toISOString(), confidence: String(geomSource.confidence) }
      };
    }));
  } finally {
    await client.end();
  }
}

export async function getPublishedBuilding(slug: string) {
  return (await listPublishedBuildings()).find((building) => building.slug === slug);
}
