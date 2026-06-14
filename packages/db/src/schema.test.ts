import { describe, expect, it } from "vitest";
import * as schema from "./schema";

describe("canonical schema", () => {
  it("contains every required domain table", () => {
    for (const table of ["buildings", "buildingLinks", "unitMix", "floorPlans", "assets", "sources", "fieldProvenance", "extractionJobs", "reviewItems", "markets", "neighborhoods", "users", "auditLog", "sourcingTasks"]) {
      expect(schema).toHaveProperty(table);
    }
  });
});
