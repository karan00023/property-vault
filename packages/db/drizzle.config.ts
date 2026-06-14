import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/db/src/schema.ts",
  out: "./packages/db/migrations/generated",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://propertyvault:propertyvault@localhost:5432/propertyvault" }
});
