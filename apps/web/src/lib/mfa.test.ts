import { beforeEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret, generateRecoveryCodes, hashRecoveryCode } from "./mfa";

describe("MFA secret protection", () => {
  beforeEach(() => { process.env.MFA_ENCRYPTION_KEY = "test-key-that-is-at-least-thirty-two-characters"; });
  it("round trips without storing plaintext", () => {
    const encrypted = encryptSecret("SENSITIVE");
    expect(encrypted).not.toContain("SENSITIVE");
    expect(decryptSecret(encrypted)).toBe("SENSITIVE");
  });
  it("hashes recovery codes deterministically", () => {
    expect(hashRecoveryCode("code")).toBe(hashRecoveryCode("code"));
  });
  it("generates distinct one-time recovery codes", () => {
    const codes = generateRecoveryCodes(10);
    expect(new Set(codes).size).toBe(10);
  });
});
