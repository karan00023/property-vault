CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
CREATE TYPE "public"."asset_kind" AS ENUM('photo', 'floor_plan', 'logo', 'document');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('active', 'needs_permission', 'removed');--> statement-breakpoint
CREATE TYPE "public"."building_status" AS ENUM('draft', 'staged', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."floor_plan_type" AS ENUM('pdf', 'image', 'embed');--> statement-breakpoint
CREATE TYPE "public"."job_stage" AS ENUM('intake', 'crawl', 'classify', 'extract', 'asset_harvest', 'validate', 'review', 'monitor');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'running', 'blocked', 'ready_for_review', 'failed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."license_basis" AS ENUM('official_public', 'owner_submitted', 'licensed', 'needs_permission');--> statement-breakpoint
CREATE TYPE "public"."link_kind" AS ENUM('official_site', 'leasing_page', 'availability', 'contact');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('open', 'in_progress', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."review_type" AS ENUM('new', 'recrawl_diff', 'correction', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('received', 'queued', 'duplicate', 'blocked', 'completed');--> statement-breakpoint
CREATE TYPE "public"."task_kind" AS ENUM('floor_plans', 'photos', 'unit_mix', 'leasing_link', 'other');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('backlog', 'researching', 'blocked', 'ready_for_review', 'done');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'reviewer', 'owner');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('invited', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'verified', 'dead', 'blocked');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "amenities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"kind" "asset_kind" NOT NULL,
	"storage_key" text NOT NULL,
	"source_url" text NOT NULL,
	"license_basis" "license_basis" NOT NULL,
	"status" "asset_status" DEFAULT 'needs_permission' NOT NULL,
	"perceptual_hash" text,
	"width" integer,
	"height" integer,
	"alt_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authenticators" (
	"credential_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_account_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_user_id_credential_id_pk" PRIMARY KEY("user_id","credential_id"),
	CONSTRAINT "authenticators_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "building_amenities" (
	"building_id" uuid NOT NULL,
	"amenity_id" uuid NOT NULL,
	CONSTRAINT "building_amenities_building_id_amenity_id_pk" PRIMARY KEY("building_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "building_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"kind" "link_kind" NOT NULL,
	"url" text NOT NULL,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"http_status" integer,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"neighborhood_id" uuid,
	"slug" text NOT NULL,
	"status" "building_status" DEFAULT 'draft' NOT NULL,
	"name" text NOT NULL,
	"aka_names" text[] DEFAULT '{}' NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"postal_code" text NOT NULL,
	"geom" "geography(Point,4326)",
	"bbl" text,
	"bin" text,
	"year_built" integer,
	"floors" integer,
	"total_units" integer,
	"developer" text,
	"property_manager" text,
	"leasing_platform" text,
	"pet_policy" text,
	"fee_policy" text,
	"verified_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "buildings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "extraction_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid,
	"submitted_url" text NOT NULL,
	"normalized_url" text NOT NULL,
	"stage" "job_stage" DEFAULT 'intake' NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"cost_micros" integer DEFAULT 0 NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"timings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_provenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"field_path" text NOT NULL,
	"value" jsonb NOT NULL,
	"confidence" numeric(4, 3) NOT NULL,
	"supporting_snippet" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floor_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"asset_id" uuid,
	"label" text NOT NULL,
	"beds" numeric(3, 1),
	"baths" numeric(3, 1),
	"sqft" integer,
	"type" "floor_plan_type" NOT NULL,
	"embed_url" text,
	"license_basis" "license_basis" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"boundary" "geography(MultiPolygon,4326)",
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "markets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mfa_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"encrypted_secret" text NOT NULL,
	"enabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mfa_credentials_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "neighborhoods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"boundary" "geography(MultiPolygon,4326)",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extraction_job_id" uuid,
	"building_id" uuid,
	"assignee_id" uuid,
	"type" "review_type" NOT NULL,
	"status" "review_status" DEFAULT 'open' NOT NULL,
	"payload_diff" jsonb NOT NULL,
	"decisions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"extraction_job_id" uuid,
	"url" text NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"snapshot_key" text,
	"content_hash" text,
	"robots_allowed" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sourcing_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"assignee_id" uuid,
	"kind" "task_kind" NOT NULL,
	"status" "task_status" DEFAULT 'backlog' NOT NULL,
	"urls_checked" text[] DEFAULT '{}' NOT NULL,
	"notes" text,
	"due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitted_url" text NOT NULL,
	"optional_name" text,
	"optional_address" text,
	"contact_email" text,
	"status" "submission_status" DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit_mix" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"bed_count" numeric(3, 1) NOT NULL,
	"bath_count" numeric(3, 1),
	"unit_count" integer,
	"rent_min" integer,
	"rent_max" integer,
	"sqft_min" integer,
	"sqft_max" integer,
	"as_of_date" date NOT NULL,
	"confidence" numeric(4, 3) NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"name" text,
	"image" text,
	"role" "user_role" DEFAULT 'reviewer' NOT NULL,
	"status" "user_status" DEFAULT 'invited' NOT NULL,
	"mfa_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_amenities" ADD CONSTRAINT "building_amenities_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_amenities" ADD CONSTRAINT "building_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_links" ADD CONSTRAINT "building_links_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_jobs" ADD CONSTRAINT "extraction_jobs_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_provenance" ADD CONSTRAINT "field_provenance_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_provenance" ADD CONSTRAINT "field_provenance_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_provenance" ADD CONSTRAINT "field_provenance_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_credentials" ADD CONSTRAINT "mfa_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_codes" ADD CONSTRAINT "recovery_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_extraction_job_id_extraction_jobs_id_fk" FOREIGN KEY ("extraction_job_id") REFERENCES "public"."extraction_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_extraction_job_id_extraction_jobs_id_fk" FOREIGN KEY ("extraction_job_id") REFERENCES "public"."extraction_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_tasks" ADD CONSTRAINT "sourcing_tasks_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_tasks" ADD CONSTRAINT "sourcing_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_mix" ADD CONSTRAINT "unit_mix_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_mix" ADD CONSTRAINT "unit_mix_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_mix" ADD CONSTRAINT "unit_mix_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_building_kind_idx" ON "assets" USING btree ("building_id","kind");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "building_links_kind_url_uk" ON "building_links" USING btree ("building_id","kind","url");--> statement-breakpoint
CREATE INDEX "buildings_market_status_idx" ON "buildings" USING btree ("market_id","status");--> statement-breakpoint
CREATE INDEX "buildings_neighborhood_idx" ON "buildings" USING btree ("neighborhood_id");--> statement-breakpoint
CREATE UNIQUE INDEX "buildings_bbl_uk" ON "buildings" USING btree ("bbl");--> statement-breakpoint
CREATE UNIQUE INDEX "buildings_bin_uk" ON "buildings" USING btree ("bin");--> statement-breakpoint
CREATE INDEX "extraction_jobs_status_idx" ON "extraction_jobs" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "field_provenance_building_path_idx" ON "field_provenance" USING btree ("building_id","field_path");--> statement-breakpoint
CREATE INDEX "field_provenance_source_idx" ON "field_provenance" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "floor_plans_building_idx" ON "floor_plans" USING btree ("building_id");--> statement-breakpoint
CREATE UNIQUE INDEX "neighborhood_market_slug_uk" ON "neighborhoods" USING btree ("market_id","slug");--> statement-breakpoint
CREATE INDEX "recovery_codes_user_idx" ON "recovery_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_items_queue_idx" ON "review_items" USING btree ("status","due_at");--> statement-breakpoint
CREATE INDEX "sources_job_idx" ON "sources" USING btree ("extraction_job_id");--> statement-breakpoint
CREATE INDEX "sourcing_tasks_status_idx" ON "sourcing_tasks" USING btree ("status","due_at");--> statement-breakpoint
CREATE INDEX "unit_mix_building_idx" ON "unit_mix" USING btree ("building_id");
--> statement-breakpoint
CREATE INDEX "markets_boundary_gix" ON "markets" USING gist ("boundary");--> statement-breakpoint
CREATE INDEX "neighborhoods_boundary_gix" ON "neighborhoods" USING gist ("boundary");--> statement-breakpoint
CREATE INDEX "buildings_geom_gix" ON "buildings" USING gist ("geom");--> statement-breakpoint
ALTER TABLE "field_provenance" ADD CONSTRAINT "field_provenance_confidence_check" CHECK ("confidence" >= 0 AND "confidence" <= 1);--> statement-breakpoint
ALTER TABLE "unit_mix" ADD CONSTRAINT "unit_mix_confidence_check" CHECK ("confidence" >= 0 AND "confidence" <= 1);--> statement-breakpoint
ALTER TABLE "unit_mix" ADD CONSTRAINT "unit_mix_rent_band_check" CHECK ("rent_min" IS NULL OR "rent_max" IS NULL OR "rent_min" <= "rent_max");--> statement-breakpoint
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plan_source_check" CHECK (("type" = 'embed' AND "embed_url" IS NOT NULL) OR ("type" <> 'embed' AND "asset_id" IS NOT NULL));--> statement-breakpoint
CREATE OR REPLACE FUNCTION propertyvault_publication_guard()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'published' THEN
    IF NEW.geom IS NULL OR NEW.neighborhood_id IS NULL OR NEW.floors IS NULL OR NEW.published_at IS NULL THEN
      RAISE EXCEPTION 'Published buildings require geometry, neighborhood, floors, and published_at';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM building_links
      WHERE building_id = NEW.id AND kind = 'leasing_page' AND verification_status = 'verified' AND http_status BETWEEN 200 AND 299
    ) THEN
      RAISE EXCEPTION 'Published buildings require a verified successful leasing link';
    END IF;
    IF (
      SELECT count(DISTINCT field_path) FROM field_provenance
      WHERE building_id = NEW.id AND field_path IN ('name','neighborhood','floors','geom','leasing_url')
        AND reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL
    ) < 5 THEN
      RAISE EXCEPTION 'Published buildings require reviewed provenance for publication fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE CONSTRAINT TRIGGER buildings_publication_guard
AFTER INSERT OR UPDATE OF status ON buildings
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION propertyvault_publication_guard();
