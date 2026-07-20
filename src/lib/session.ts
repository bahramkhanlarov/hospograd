import { base64UrlDecode, base64UrlEncode, constantTimeEqual, toHex } from "./encoding";

export type SessionPayload = { userId: string; exp: number };

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(new Uint8Array(sigBuf));
}

export async function createSessionToken(userId: string, secret: string): Promise<string> {
  const payload: SessionPayload = { userId, exp: Date.now() + THIRTY_DAYS_MS };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  const expectedSignature = await sign(payloadB64, secret);
  if (!constantTimeEqual(expectedSignature, signature)) return null;
  const payload = JSON.parse(base64UrlDecode(payloadB64)) as SessionPayload;
  if (payload.exp < Date.now()) return null;
  return payload;
}
