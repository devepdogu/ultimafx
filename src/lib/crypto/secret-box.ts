// No `server-only` guard: this is a plain node:crypto wrapper with no Next.js-specific
// bundling concern, and it's also imported from prisma/seed.ts, a standalone script that
// `server-only` would hard-fail under (it throws unconditionally outside Next's bundler).
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * Reversible AES-256-GCM encryption for secrets the app must be able to read back later (not
 * a password hash, which must never be reversible) — e.g. an admin viewing a user's current
 * password on request. Keyed by PROVIDER_SECRET_ENCRYPTION_KEY, a 32-byte key already reserved
 * for exactly this kind of "stored, not hashed" secret.
 *
 * Output is `base64(iv):base64(authTag):base64(ciphertext)` — self-contained, no separate
 * nonce/tag bookkeeping needed at the call site.
 */
function getKey(): Buffer {
  const raw = process.env.PROVIDER_SECRET_ENCRYPTION_KEY;
  if (!raw) throw new Error("PROVIDER_SECRET_ENCRYPTION_KEY must be set to encrypt/decrypt stored secrets.");
  // Accept either a base64-encoded 32-byte key (the documented format, e.g. `openssl rand -base64 32`)
  // or, failing that, hash whatever string was given down to exactly 32 bytes.
  const b64 = Buffer.from(raw, "base64");
  if (b64.length === 32) return b64;
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  const [ivB64, tagB64, dataB64] = stored.split(":");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Malformed encrypted secret.");
  const key = getKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}
