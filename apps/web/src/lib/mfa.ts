import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key() {
  const value = process.env.MFA_ENCRYPTION_KEY;
  if (!value) throw new Error("MFA_ENCRYPTION_KEY is required");
  return createHash("sha256").update(value).digest();
}

export function encryptSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((item) => item.toString("base64url")).join(".");
}

export function decryptSecret(value: string) {
  const [iv, tag, encrypted] = value.split(".").map((item) => Buffer.from(item, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function hashRecoveryCode(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => randomBytes(6).toString("hex").toUpperCase());
}
