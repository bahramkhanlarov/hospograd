import { constantTimeEqual, fromHex, toHex } from "./encoding";

const PBKDF2_ITERATIONS = 100_000;

async function deriveBits(secret: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    // Cast is type-only: under TS's dom lib, WebCrypto's BufferSource requires
    // Uint8Array<ArrayBuffer> specifically, while this function's public
    // signature intentionally keeps the broader Uint8Array (ArrayBufferLike)
    // for caller convenience. No behavior change at runtime.
    { name: "PBKDF2", salt: salt as Uint8Array<ArrayBuffer>, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

export async function hashSecret(secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveBits(secret, salt);
  return `${toHex(salt)}:${toHex(derived)}`;
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const derived = await deriveBits(secret, fromHex(saltHex));
  return constantTimeEqual(toHex(derived), hashHex);
}
