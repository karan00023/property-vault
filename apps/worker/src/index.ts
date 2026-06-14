import PgBoss from "pg-boss";
import { extractionJobPayload, queues } from "./contracts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const boss = new PgBoss({ connectionString, schema: process.env.PGBOSS_SCHEMA ?? "pgboss" });

async function start() {
  await boss.start();
  await boss.work(queues.intake, async ([job]) => {
    const payload = extractionJobPayload.parse(job.data);
    await boss.send(queues.crawl, payload, { singletonKey: payload.extractionJobId });
  });
  console.info(JSON.stringify({ service: "propertyvault-worker", status: "ready" }));
}

async function shutdown() {
  await boss.stop({ graceful: true });
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
start().catch((error) => { console.error(error); process.exit(1); });
