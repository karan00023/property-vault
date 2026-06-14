import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createDatabase } from "./index";

async function migrate() {
  const direction = process.argv[2];
  const { client } = createDatabase();
  const files = direction === "down" ? ["migrations/rollback/0000_baseline.down.sql"] : ["migrations/generated/0000_certain_warlock.sql"];
  for (const file of files) {
    const sql = await readFile(resolve(import.meta.dirname, "..", file), "utf8");
    for (const statement of sql.split("--> statement-breakpoint").map((part) => part.trim()).filter(Boolean)) {
      await client.unsafe(statement);
    }
  }
  await client.end();
  console.info(`Migration ${direction === "down" ? "rollback" : "apply"} complete`);
}
migrate().catch((error) => { console.error(error); process.exit(1); });
