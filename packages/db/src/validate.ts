import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

async function validate() {
  const schema = await readFile(resolve(import.meta.dirname, "schema.ts"), "utf8");
  const required = ["buildings", "buildingLinks", "unitMix", "floorPlans", "assets", "sources", "fieldProvenance", "extractionJobs", "reviewItems", "markets", "neighborhoods", "users", "auditLog", "sourcingTasks"];
  const missing = required.filter((table) => !schema.includes(`export const ${table}`));
  if (missing.length) throw new Error(`Missing canonical schema tables: ${missing.join(", ")}`);
  console.info(`Schema validation passed (${required.length} canonical tables)`);
}
validate().catch((error) => { console.error(error); process.exit(1); });
