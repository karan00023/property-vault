import { describe, expect, it } from "vitest";
import { extractionJobPayload } from "./contracts";

describe("extraction job contract", () => {
  it("rejects non-URL and non-UUID payloads", () => {
    expect(extractionJobPayload.safeParse({ extractionJobId: "bad", submittedUrl: "bad" }).success).toBe(false);
  });
});
