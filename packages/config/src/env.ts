import { z } from "zod";

export const serverEnv = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  MFA_ENCRYPTION_KEY: z.string().min(32),
  PGBOSS_SCHEMA: z.string().default("pgboss")
});

export type ServerEnv = z.infer<typeof serverEnv>;
