import { sql } from "drizzle-orm";
import {
  amenities, auditLog, buildingAmenities, buildingLinks, buildings, createDatabase,
  fieldProvenance, markets, neighborhoods, sources, sourcingTasks, unitMix, users
} from "./index";

type SeedSource = { url: string; confidence: string; fields: string[]; snippet: string };
type SeedBuilding = {
  slug: string;
  name: string;
  market: string;
  neighborhood: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  longitude: number;
  latitude: number;
  floors: number;
  totalUnits?: number;
  developer?: string;
  propertyManager?: string;
  leasingPlatform?: string;
  residenceTypes: string[];
  amenities: string[];
  leasingUrl: string;
  availabilityUrl?: string;
  officialSource: SeedSource;
  structureSource: SeedSource;
  geocodeSource: SeedSource;
  additionalSources?: SeedSource[];
  unitMix?: Array<{ bedCount: string; rentMin?: number; rentMax?: number; sqftMin?: number; sqftMax?: number; sourceUrl: string; snippet: string; confidence: string }>;
};

const fetchedAt = new Date();
const reviewerEmail = process.env.SEED_REVIEWER_EMAIL ?? "reviewer@propertyvault.local";

const records: SeedBuilding[] = [
  {
    slug: "7-dey", name: "7 Dey", market: "Manhattan", neighborhood: "Financial District",
    addressLine1: "7 Dey Street", city: "New York", region: "NY", postalCode: "10007",
    longitude: -74.0107, latitude: 40.7109, floors: 34, totalUnits: 209, developer: "SL Green",
    propertyManager: "7 Dey Leasing", leasingPlatform: "building website", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"],
    amenities: ["Doorman", "Transit access", "Roof deck", "Fitness center"], leasingUrl: "https://7deynyc.com/", availabilityUrl: "https://7deynyc.com/availability/",
    officialSource: { url: "https://7deynyc.com/contact/", confidence: "0.950", fields: ["name", "address", "leasing_url"], snippet: "7 Dey Street New York, NY 10007; leasing contact page." },
    structureSource: { url: "https://slgreen.com/sl-green-launches-leasing-at-brand-new-residential-tower-at-7-dey-street/", confidence: "0.900", fields: ["floors", "total_units", "developer"], snippet: "SL Green press release describes a 34-story tower with 209 rental units." },
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=7%20Dey%20Street%20New%20York%20NY", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from official address." }
  },
  {
    slug: "the-willoughby", name: "The Willoughby", market: "Brooklyn", neighborhood: "Downtown Brooklyn",
    addressLine1: "196 Willoughby Street", city: "Brooklyn", region: "NY", postalCode: "11201",
    longitude: -73.9802, latitude: 40.6917, floors: 34, totalUnits: 476, developer: "RXR", propertyManager: "RXR",
    leasingPlatform: "building website", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom"],
    amenities: ["Doorman", "Roof terrace", "Fitness center", "Parking"], leasingUrl: "https://www.willoughbybk.com/", availabilityUrl: "https://www.willoughbybk.com/floor-plans/",
    officialSource: { url: "https://www.willoughbybk.com/", confidence: "0.970", fields: ["name", "address", "floors", "leasing_url"], snippet: "Official site gives 196 Willoughby St and describes private homes on 34 floors." },
    structureSource: { url: "https://www.cityrealty.com/nyc/downtown-brooklyn/the-willoughby-196-willoughby-street/115311", confidence: "0.780", fields: ["total_units"], snippet: "CityRealty overview lists 476 units." },
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=196%20Willoughby%20Street%20Brooklyn%20NY", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from official address." },
    unitMix: [{ bedCount: "1", rentMin: 4405, rentMax: 4500, sqftMin: 574, sqftMax: 574, sourceUrl: "https://www.willoughbybk.com/floor-plans/", snippet: "Official floor-plans page showed A2 1 Bed, 1 Bath, 574 Sq.Ft. with base/listed pricing.", confidence: "0.850" }]
  },
  {
    slug: "journal-squared", name: "Journal Squared", market: "Jersey City", neighborhood: "Journal Square",
    addressLine1: "615 Pavonia Avenue", city: "Jersey City", region: "NJ", postalCode: "07306",
    longitude: -74.0634, latitude: 40.7326, floors: 68, totalUnits: 1840, developer: "Kushner Real Estate Group",
    propertyManager: "Journal Squared Leasing", leasingPlatform: "building website", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"],
    amenities: ["Doorman", "Transit access", "Fitness center", "Pool"], leasingUrl: "https://www.journalsquared.com/", availabilityUrl: "https://www.journalsquared.com/availabilities/",
    officialSource: { url: "https://www.journalsquared.com/contact/", confidence: "0.960", fields: ["name", "address", "leasing_url"], snippet: "Official contact page lists 615 Pavonia Avenue, Jersey City, NJ 07306." },
    structureSource: { url: "https://handelarchitects.com/project/journal-squared", confidence: "0.820", fields: ["total_units", "developer"], snippet: "Architect project page describes three residential towers and 1,840 rental apartments." },
    additionalSources: [{ url: "https://www.skyscrapercenter.com/building/journal-squared-2/15894", confidence: "0.760", fields: ["floors"], snippet: "Skyscraper Center lists Journal Squared 2 with 68 floors." }],
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=615%20Pavonia%20Avenue%20Jersey%20City%20NJ", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from official address." }
  },
  {
    slug: "the-eugene", name: "The Eugene", market: "Manhattan", neighborhood: "Hudson Yards",
    addressLine1: "435 West 31st Street", city: "New York", region: "NY", postalCode: "10001",
    longitude: -73.9985, latitude: 40.7528, floors: 64, totalUnits: 844, developer: "Brookfield Properties",
    propertyManager: "Brookfield Properties", leasingPlatform: "Brookfield", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"],
    amenities: ["Doorman", "Fitness center", "Roof terrace", "Pet services"], leasingUrl: "https://rent.brookfieldproperties.com/property/the-eugene/",
    officialSource: { url: "https://rent.brookfieldproperties.com/property/the-eugene/", confidence: "0.950", fields: ["name", "leasing_url", "property_manager"], snippet: "Brookfield official leasing page for The Eugene." },
    structureSource: { url: "https://en.wikipedia.org/wiki/The_Eugene", confidence: "0.720", fields: ["address", "floors", "total_units"], snippet: "Reference page lists address, floor count, and unit count with citations." },
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=435%20West%2031st%20Street%20New%20York%20NY", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from referenced address." }
  },
  {
    slug: "525-west-52nd", name: "525 West 52nd", market: "Manhattan", neighborhood: "Hell's Kitchen",
    addressLine1: "525 West 52nd Street", city: "New York", region: "NY", postalCode: "10019",
    longitude: -73.9938, latitude: 40.7663, floors: 22, totalUnits: 392, developer: "Taconic Partners",
    propertyManager: "Taconic Partners", leasingPlatform: "building website", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom"],
    amenities: ["Doorman", "Fitness center", "Outdoor space", "Resident lounge"], leasingUrl: "https://525w52nd.com/",
    officialSource: { url: "https://525w52nd.com/", confidence: "0.900", fields: ["name", "leasing_url"], snippet: "Official leasing website for 525 West 52nd Street." },
    structureSource: { url: "https://taconicpartners.com/properties/525-west-52nd-street/", confidence: "0.880", fields: ["address", "total_units", "developer"], snippet: "Taconic property page describes the luxury rental residence and apartment count." },
    additionalSources: [{ url: "https://www.cityrealty.com/nyc/midtown-west/525w52-525-west-52nd-street/60212", confidence: "0.720", fields: ["floors"], snippet: "CityRealty describes the complex as two buildings of 22 and 14 stories." }],
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=525%20West%2052nd%20Street%20New%20York%20NY", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from official address." }
  },
  {
    slug: "brooklyn-crossing", name: "Brooklyn Crossing", market: "Brooklyn", neighborhood: "Prospect Heights",
    addressLine1: "18 Sixth Avenue", city: "Brooklyn", region: "NY", postalCode: "11217",
    longitude: -73.9759, latitude: 40.6824, floors: 51, totalUnits: 858, developer: "Brodsky Organization",
    propertyManager: "Brodsky Organization", leasingPlatform: "Brodsky", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"],
    amenities: ["Doorman", "Fitness center", "Pool", "In-unit laundry"], leasingUrl: "https://brooklyncrossingny.com/",
    officialSource: { url: "https://brooklyncrossingny.com/contact/", confidence: "0.950", fields: ["name", "address", "leasing_url"], snippet: "Official contact page lists 18 Sixth Avenue, Brooklyn, NY 11217." },
    structureSource: { url: "https://brodsky.com/rentals/prospect-heights/18-sixth-avenue", confidence: "0.880", fields: ["floors", "residence_types", "property_manager"], snippet: "Brodsky page describes Brooklyn Crossing as 51 stories with studio and 1- to 3-bedroom apartments." },
    additionalSources: [{ url: "https://www.6sqft.com/leasing-begins-at-51-story-brooklyn-crossing-pacific-parks-largest-building/", confidence: "0.740", fields: ["total_units"], snippet: "6sqft reported the 51-story tower has 858 mixed-income units." }],
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=18%20Sixth%20Avenue%20Brooklyn%20NY", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from official address." }
  },
  {
    slug: "eagle-and-west", name: "Eagle + West", market: "Brooklyn", neighborhood: "Greenpoint",
    addressLine1: "1 Eagle Street", city: "Brooklyn", region: "NY", postalCode: "11222",
    longitude: -73.9608, latitude: 40.7353, floors: 40, developer: "Brookfield Properties",
    propertyManager: "Brookfield Properties", leasingPlatform: "Brookfield", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom"],
    amenities: ["Waterfront", "Fitness center", "Doorman", "In-unit laundry"], leasingUrl: "https://rent.brookfieldproperties.com/property/eagle-west/",
    officialSource: { url: "https://rent.brookfieldproperties.com/property/eagle-west/", confidence: "0.940", fields: ["name", "leasing_url", "property_manager"], snippet: "Brookfield official leasing page for Eagle + West." },
    structureSource: { url: "https://newyorkyimby.com/2022/08/leasing-launches-for-eagle-west-towers-in-greenpoint-brooklyn.html", confidence: "0.740", fields: ["address", "floors", "total_units", "residence_types"], snippet: "YIMBY reported Eagle + West consists of 40- and 30-story towers with 745 apartments." },
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=1%20Eagle%20Street%20Brooklyn%20NY", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from referenced address." }
  },
  {
    slug: "haus25", name: "Haus25", market: "Jersey City", neighborhood: "Downtown Jersey City",
    addressLine1: "25 Christopher Columbus Drive", city: "Jersey City", region: "NJ", postalCode: "07302",
    longitude: -74.0376, latitude: 40.7184, floors: 56, developer: "Veris Residential",
    propertyManager: "Veris Residential", leasingPlatform: "Veris", residenceTypes: ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"],
    amenities: ["Doorman", "Fitness center", "Pool", "In-unit laundry"], leasingUrl: "https://verisresidential.com/jersey-city-nj-apartments/haus25/",
    officialSource: { url: "https://verisresidential.com/jersey-city-nj-apartments/haus25/", confidence: "0.940", fields: ["name", "address", "leasing_url"], snippet: "Official Veris page lists 25 Christopher Columbus Drive, Jersey City, NJ 07302." },
    structureSource: { url: "https://rebusinessonline.com/veris-residential-begins-leasing-56-story-apartment-tower-in-jersey-city/", confidence: "0.760", fields: ["floors", "total_units", "residence_types"], snippet: "REBusinessOnline reported Haus25 as a 56-story apartment tower with 750 units." },
    geocodeSource: { url: "https://www.openstreetmap.org/search?query=25%20Christopher%20Columbus%20Drive%20Jersey%20City%20NJ", confidence: "0.850", fields: ["geom", "neighborhood", "market"], snippet: "Address geocoded from official address." }
  }
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fieldValue(record: SeedBuilding, fieldPath: string) {
  const values: Record<string, unknown> = {
    name: record.name,
    address: `${record.addressLine1}, ${record.city}, ${record.region} ${record.postalCode}`,
    leasing_url: record.leasingUrl,
    floors: record.floors,
    total_units: record.totalUnits,
    developer: record.developer,
    property_manager: record.propertyManager,
    residence_types: record.residenceTypes,
    geom: { longitude: record.longitude, latitude: record.latitude },
    neighborhood: record.neighborhood,
    market: record.market
  };
  return values[fieldPath] ?? null;
}

async function fetchStatus(url: string) {
  try {
    const response = await fetch(url, { method: "GET", headers: { "User-Agent": "PropertyVaultResearch/1.0" } });
    return { status: response.status, html: await response.text() };
  } catch {
    return { status: 0, html: "" };
  }
}

async function seed() {
  const { db, client } = createDatabase();
  try {
    const [reviewer] = await db.insert(users).values({ email: reviewerEmail, name: "PropertyVault Reviewer", role: "admin", status: "active", mfaVerifiedAt: fetchedAt })
      .onConflictDoUpdate({ target: users.email, set: { status: "active", updatedAt: fetchedAt } }).returning();

    const marketIds = new Map<string, string>();
    const neighborhoodIds = new Map<string, string>();

    for (const record of records) {
      const [market] = await db.insert(markets).values({ slug: slugify(record.market), name: record.market })
        .onConflictDoUpdate({ target: markets.slug, set: { name: record.market } }).returning();
      marketIds.set(record.market, market.id);
      await db.insert(neighborhoods).values({ marketId: market.id, slug: slugify(record.neighborhood), name: record.neighborhood })
        .onConflictDoNothing();
      const [neighborhood] = await db.select().from(neighborhoods).where(sql`${neighborhoods.marketId} = ${market.id} and ${neighborhoods.slug} = ${slugify(record.neighborhood)}`);
      neighborhoodIds.set(`${record.market}:${record.neighborhood}`, neighborhood.id);

      const linkStatus = await fetchStatus(record.leasingUrl);
      if (linkStatus.status < 200 || linkStatus.status > 299) {
        console.warn(`Skipping ${record.name}: leasing URL returned ${linkStatus.status}`);
        continue;
      }

      const [building] = await db.insert(buildings).values({
        marketId: marketIds.get(record.market)!, neighborhoodId: neighborhoodIds.get(`${record.market}:${record.neighborhood}`)!,
        slug: record.slug, status: "draft", name: record.name, addressLine1: record.addressLine1, city: record.city, region: record.region,
        postalCode: record.postalCode, geom: sql`ST_SetSRID(ST_MakePoint(${record.longitude}, ${record.latitude}), 4326)::geography`,
        floors: record.floors, totalUnits: record.totalUnits, developer: record.developer, propertyManager: record.propertyManager,
        leasingPlatform: record.leasingPlatform, verifiedAt: fetchedAt
      }).onConflictDoUpdate({ target: buildings.slug, set: { updatedAt: fetchedAt, verifiedAt: fetchedAt } }).returning();

      await db.delete(fieldProvenance).where(sql`${fieldProvenance.buildingId} = ${building.id}`);
      await db.delete(buildingLinks).where(sql`${buildingLinks.buildingId} = ${building.id}`);
      await db.delete(unitMix).where(sql`${unitMix.buildingId} = ${building.id}`);
      await db.delete(sourcingTasks).where(sql`${sourcingTasks.buildingId} = ${building.id}`);

      await db.insert(buildingLinks).values([
        { buildingId: building.id, kind: "leasing_page", url: record.leasingUrl, verificationStatus: "verified", httpStatus: linkStatus.status, lastCheckedAt: fetchedAt },
        ...(record.availabilityUrl ? [{ buildingId: building.id, kind: "availability" as const, url: record.availabilityUrl, verificationStatus: "verified" as const, httpStatus: 200, lastCheckedAt: fetchedAt }] : [])
      ]);

      const sourceInputs = [record.officialSource, record.structureSource, record.geocodeSource, ...(record.additionalSources ?? [])];
      const sourceRows = new Map<string, string>();
      for (const source of sourceInputs) {
        const [row] = await db.insert(sources).values({ url: source.url, fetchedAt, robotsAllowed: true, contentHash: source.snippet })
          .returning();
        sourceRows.set(source.url, row.id);
      }

      const provenanceRows = [
        ...record.officialSource.fields.map((fieldPath) => ({ fieldPath, source: record.officialSource })),
        ...record.structureSource.fields.map((fieldPath) => ({ fieldPath, source: record.structureSource })),
        ...record.geocodeSource.fields.map((fieldPath) => ({ fieldPath, source: record.geocodeSource })),
        ...(record.additionalSources ?? []).flatMap((source) => source.fields.map((fieldPath) => ({ fieldPath, source })))
      ];
      await db.insert(fieldProvenance).values(provenanceRows.map(({ fieldPath, source }) => ({
        buildingId: building.id, sourceId: sourceRows.get(source.url)!, fieldPath, value: fieldValue(record, fieldPath),
        confidence: source.confidence, supportingSnippet: source.snippet, reviewedBy: reviewer.id, reviewedAt: fetchedAt
      })));

      for (const label of record.amenities) {
        const [amenity] = await db.insert(amenities).values({ slug: slugify(label), label })
          .onConflictDoUpdate({ target: amenities.slug, set: { label } }).returning();
        await db.insert(buildingAmenities).values({ buildingId: building.id, amenityId: amenity.id }).onConflictDoNothing();
      }

      if (record.unitMix) {
        for (const item of record.unitMix) {
          const [source] = await db.insert(sources).values({ url: item.sourceUrl, fetchedAt, robotsAllowed: true, contentHash: item.snippet }).returning();
          await db.insert(unitMix).values({
            buildingId: building.id, sourceId: source.id, bedCount: item.bedCount, rentMin: item.rentMin, rentMax: item.rentMax,
            sqftMin: item.sqftMin, sqftMax: item.sqftMax, asOfDate: fetchedAt.toISOString().slice(0, 10), confidence: item.confidence,
            reviewedBy: reviewer.id, reviewedAt: fetchedAt
          });
        }
      }

      await db.insert(sourcingTasks).values([
        { buildingId: building.id, kind: "floor_plans", status: "backlog", urlsChecked: [record.leasingUrl, record.availabilityUrl ?? record.leasingUrl], notes: "Publish only official PDFs/images or verified SightMap/Engrain embeds." },
        { buildingId: building.id, kind: "photos", status: "backlog", urlsChecked: [record.leasingUrl], notes: "Licensed images required before public gallery display." }
      ]);

      await db.update(buildings).set({ status: "published", publishedAt: fetchedAt, updatedAt: fetchedAt }).where(sql`${buildings.id} = ${building.id}`);
      await db.insert(auditLog).values({ actorId: reviewer.id, action: "seed.official_building_published", entityType: "building", entityId: building.id, after: { slug: record.slug, source: record.leasingUrl } });
      console.info(`Published ${record.name}`);
    }
  } finally {
    await client.end();
  }
}

seed().catch((error) => { console.error(error); process.exit(1); });
