import { createDatabase } from "@propertyvault/db";

const { client } = createDatabase();
client`select 1 as healthy`
  .then(() => { console.info(JSON.stringify({ database: "healthy", worker: "ready" })); })
  .finally(() => client.end());
