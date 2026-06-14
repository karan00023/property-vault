import {
  boolean, customType, date, index, integer, jsonb, numeric, pgEnum, pgTable,
  primaryKey, text, timestamp, uniqueIndex, uuid
} from "drizzle-orm/pg-core";

const pointGeography = customType<{ data: string }>({
  dataType() { return "geography(Point,4326)"; }
});
const polygonGeography = customType<{ data: string }>({
  dataType() { return "geography(MultiPolygon,4326)"; }
});

export const buildingStatus = pgEnum("building_status", ["draft", "staged", "published", "archived"]);
export const linkKind = pgEnum("link_kind", ["official_site", "leasing_page", "availability", "contact"]);
export const verificationStatus = pgEnum("verification_status", ["unverified", "verified", "dead", "blocked"]);
export const assetKind = pgEnum("asset_kind", ["photo", "floor_plan", "logo", "document"]);
export const assetStatus = pgEnum("asset_status", ["active", "needs_permission", "removed"]);
export const licenseBasis = pgEnum("license_basis", ["official_public", "owner_submitted", "licensed", "needs_permission"]);
export const floorPlanType = pgEnum("floor_plan_type", ["pdf", "image", "embed"]);
export const jobStage = pgEnum("job_stage", ["intake", "crawl", "classify", "extract", "asset_harvest", "validate", "review", "monitor"]);
export const jobStatus = pgEnum("job_status", ["queued", "running", "blocked", "ready_for_review", "failed", "completed"]);
export const reviewType = pgEnum("review_type", ["new", "recrawl_diff", "correction", "flagged"]);
export const reviewStatus = pgEnum("review_status", ["open", "in_progress", "approved", "rejected"]);
export const taskKind = pgEnum("task_kind", ["floor_plans", "photos", "unit_mix", "leasing_link", "other"]);
export const taskStatus = pgEnum("task_status", ["backlog", "researching", "blocked", "ready_for_review", "done"]);
export const userRole = pgEnum("user_role", ["admin", "reviewer", "owner"]);
export const userStatus = pgEnum("user_status", ["invited", "active", "suspended"]);
export const submissionStatus = pgEnum("submission_status", ["received", "queued", "duplicate", "blocked", "completed"]);

export const markets = pgTable("markets", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  boundary: polygonGeography("boundary"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const neighborhoods = pgTable("neighborhoods", {
  id: uuid("id").defaultRandom().primaryKey(),
  marketId: uuid("market_id").references(() => markets.id).notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  boundary: polygonGeography("boundary"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("neighborhood_market_slug_uk").on(table.marketId, table.slug)]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  name: text("name"),
  image: text("image"),
  role: userRole("role").default("reviewer").notNull(),
  status: userStatus("status").default("invited").notNull(),
  mfaVerifiedAt: timestamp("mfa_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state")
}, (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull()
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull()
}, (table) => [primaryKey({ columns: [table.identifier, table.token] })]);

export const authenticators = pgTable("authenticators", {
  credentialID: text("credential_id").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credential_device_type").notNull(),
  credentialBackedUp: boolean("credential_backed_up").notNull(),
  transports: text("transports")
}, (table) => [primaryKey({ columns: [table.userId, table.credentialID] })]);

export const buildings = pgTable("buildings", {
  id: uuid("id").defaultRandom().primaryKey(),
  marketId: uuid("market_id").references(() => markets.id).notNull(),
  neighborhoodId: uuid("neighborhood_id").references(() => neighborhoods.id),
  slug: text("slug").notNull().unique(),
  status: buildingStatus("status").default("draft").notNull(),
  name: text("name").notNull(),
  akaNames: text("aka_names").array().default([]).notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  region: text("region").notNull(),
  postalCode: text("postal_code").notNull(),
  geom: pointGeography("geom"),
  bbl: text("bbl"),
  bin: text("bin"),
  yearBuilt: integer("year_built"),
  floors: integer("floors"),
  totalUnits: integer("total_units"),
  developer: text("developer"),
  propertyManager: text("property_manager"),
  leasingPlatform: text("leasing_platform"),
  petPolicy: text("pet_policy"),
  feePolicy: text("fee_policy"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index("buildings_market_status_idx").on(table.marketId, table.status),
  index("buildings_neighborhood_idx").on(table.neighborhoodId),
  uniqueIndex("buildings_bbl_uk").on(table.bbl),
  uniqueIndex("buildings_bin_uk").on(table.bin)
]);

export const buildingLinks = pgTable("building_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }).notNull(),
  kind: linkKind("kind").notNull(),
  url: text("url").notNull(),
  verificationStatus: verificationStatus("verification_status").default("unverified").notNull(),
  httpStatus: integer("http_status"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("building_links_kind_url_uk").on(table.buildingId, table.kind, table.url)]);

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  submittedUrl: text("submitted_url").notNull(),
  optionalName: text("optional_name"),
  optionalAddress: text("optional_address"),
  contactEmail: text("contact_email"),
  status: submissionStatus("status").default("received").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const extractionJobs = pgTable("extraction_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").references(() => submissions.id),
  submittedUrl: text("submitted_url").notNull(),
  normalizedUrl: text("normalized_url").notNull(),
  stage: jobStage("stage").default("intake").notNull(),
  status: jobStatus("status").default("queued").notNull(),
  attemptCount: integer("attempt_count").default(0).notNull(),
  costMicros: integer("cost_micros").default(0).notNull(),
  errors: jsonb("errors").default([]).notNull(),
  timings: jsonb("timings").default({}).notNull(),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("extraction_jobs_status_idx").on(table.status, table.nextAttemptAt)]);

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  extractionJobId: uuid("extraction_job_id").references(() => extractionJobs.id),
  url: text("url").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  snapshotKey: text("snapshot_key"),
  contentHash: text("content_hash"),
  robotsAllowed: boolean("robots_allowed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("sources_job_idx").on(table.extractionJobId)]);

export const fieldProvenance = pgTable("field_provenance", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }).notNull(),
  sourceId: uuid("source_id").references(() => sources.id).notNull(),
  fieldPath: text("field_path").notNull(),
  value: jsonb("value").notNull(),
  confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(),
  supportingSnippet: text("supporting_snippet"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index("field_provenance_building_path_idx").on(table.buildingId, table.fieldPath),
  index("field_provenance_source_idx").on(table.sourceId)
]);

export const unitMix = pgTable("unit_mix", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }).notNull(),
  sourceId: uuid("source_id").references(() => sources.id).notNull(),
  bedCount: numeric("bed_count", { precision: 3, scale: 1 }).notNull(),
  bathCount: numeric("bath_count", { precision: 3, scale: 1 }),
  unitCount: integer("unit_count"),
  rentMin: integer("rent_min"),
  rentMax: integer("rent_max"),
  sqftMin: integer("sqft_min"),
  sqftMax: integer("sqft_max"),
  asOfDate: date("as_of_date").notNull(),
  confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true })
}, (table) => [index("unit_mix_building_idx").on(table.buildingId)]);

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }).notNull(),
  kind: assetKind("kind").notNull(),
  storageKey: text("storage_key").notNull(),
  sourceUrl: text("source_url").notNull(),
  licenseBasis: licenseBasis("license_basis").notNull(),
  status: assetStatus("status").default("needs_permission").notNull(),
  perceptualHash: text("perceptual_hash"),
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("assets_building_kind_idx").on(table.buildingId, table.kind)]);

export const floorPlans = pgTable("floor_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }).notNull(),
  sourceId: uuid("source_id").references(() => sources.id).notNull(),
  assetId: uuid("asset_id").references(() => assets.id),
  label: text("label").notNull(),
  beds: numeric("beds", { precision: 3, scale: 1 }),
  baths: numeric("baths", { precision: 3, scale: 1 }),
  sqft: integer("sqft"),
  type: floorPlanType("type").notNull(),
  embedUrl: text("embed_url"),
  licenseBasis: licenseBasis("license_basis").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("floor_plans_building_idx").on(table.buildingId)]);

export const amenities = pgTable("amenities", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull()
});

export const buildingAmenities = pgTable("building_amenities", {
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }).notNull(),
  amenityId: uuid("amenity_id").references(() => amenities.id, { onDelete: "cascade" }).notNull()
}, (table) => [primaryKey({ columns: [table.buildingId, table.amenityId] })]);

export const reviewItems = pgTable("review_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  extractionJobId: uuid("extraction_job_id").references(() => extractionJobs.id),
  buildingId: uuid("building_id").references(() => buildings.id),
  assigneeId: uuid("assignee_id").references(() => users.id),
  type: reviewType("type").notNull(),
  status: reviewStatus("status").default("open").notNull(),
  payloadDiff: jsonb("payload_diff").notNull(),
  decisions: jsonb("decisions").default({}).notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("review_items_queue_idx").on(table.status, table.dueAt)]);

export const sourcingTasks = pgTable("sourcing_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id").references(() => buildings.id, { onDelete: "cascade" }).notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id),
  kind: taskKind("kind").notNull(),
  status: taskStatus("status").default("backlog").notNull(),
  urlsChecked: text("urls_checked").array().default([]).notNull(),
  notes: text("notes"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("sourcing_tasks_status_idx").on(table.status, table.dueAt)]);

export const mfaCredentials = pgTable("mfa_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  encryptedSecret: text("encrypted_secret").notNull(),
  enabledAt: timestamp("enabled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const recoveryCodes = pgTable("recovery_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  codeHash: text("code_hash").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("recovery_codes_user_idx").on(table.userId)]);

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("audit_log_entity_idx").on(table.entityType, table.entityId, table.createdAt)]);
