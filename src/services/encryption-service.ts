import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encryption service using AES-256-GCM.
 * Uses ENCRYPTION_KEY (base64, 32 bytes). Never log tokens.
 */
export class EncryptionService {
  private readonly key: Buffer;

  constructor(encryptionKeyBase64?: string) {
    const raw = encryptionKeyBase64 ?? process.env.ENCRYPTION_KEY;
    if (!raw) {
      throw new Error("ENCRYPTION_KEY is required (base64, 32 bytes)");
    }
    this.key = Buffer.from(raw, "base64");
    if (this.key.length !== KEY_LENGTH) {
      throw new Error(`ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes`);
    }
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
  }

  decrypt(cipherText: string): string {
    const buf = Buffer.from(cipherText, "base64");
    if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new Error("Invalid cipher text");
    }
    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final("utf8");
  }
}
