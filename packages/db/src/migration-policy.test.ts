import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(import.meta.dirname, "../migrations/generated/0000_certain_warlock.sql"), "utf8");

describe("database policy migration", () => {
  it("enables PostGIS and spatial indexes", () => {
    expect(migration).toContain("CREATE EXTENSION IF NOT EXISTS postgis");
    expect(migration).toContain("buildings_geom_gix");
  });
  it("enforces publication provenance and leasing link gates", () => {
    expect(migration).toContain("propertyvault_publication_guard");
    expect(migration).toContain("verified successful leasing link");
    expect(migration).toContain("reviewed provenance");
  });
});
