import { z } from "zod";

export const extractionJobPayload = z.object({
  extractionJobId: z.string().uuid(),
  submittedUrl: z.string().url()
});

export type ExtractionJobPayload = z.infer<typeof extractionJobPayload>;

export const queues = {
  intake: "extraction.intake",
  crawl: "extraction.crawl",
  classify: "extraction.classify",
  extract: "extraction.extract",
  assetHarvest: "extraction.asset-harvest",
  validate: "extraction.validate"
} as const;
