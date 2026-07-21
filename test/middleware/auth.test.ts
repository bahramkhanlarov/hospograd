import { Hono } from "hono";
import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { Bindings } from "../../src/index";
import { requireAuth, requireVerified } from "../../src/middleware/auth";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

function buildTestApp() {
  const app = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();
  app.get("/protected", requireAuth, (c) => c.json({ userId: c.get("userId") }));
  app.get("/verified-only", requireVerified, (c) => c.json({ userId: c.get("userId"), isAdmin: c.get("isAdmin") }));
  return app;
}

describe("requireAuth", () => {
  it("rejects requests without a session cookie", async () => {
    const app = buildTestApp();
    const res = await app.request("/protected", {}, env);
    expect(res.status).toBe(401);
  });

  it("allows requests with a valid session cookie", async () => {
    const app = buildTestApp();
    const token = await createSessionToken("user-abc", env.SESSION_SECRET);
    const res = await app.request("/protected", { headers: { Cookie: `session=${token}` } }, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "user-abc" });
  });
});

describe("requireVerified", () => {
  it("rejects an unverified user", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('unverified-1', 'unv', 'unv@ehl.ch', ?, 'EHL', 'student', 'pending', 0)`
    )
      .bind(await hashSecret("x"))
      .run();
    const app = buildTestApp();
    const token = await createSessionToken("unverified-1", env.SESSION_SECRET);
    const res = await app.request("/verified-only", { headers: { Cookie: `session=${token}` } }, env);
    expect(res.status).toBe(403);
  });

  it("allows a verified user and reports admin status", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
       VALUES ('verified-1', 'ver', 'ver@ehl.ch', ?, 'EHL', 'student', 'verified', 1, 0)`
    )
      .bind(await hashSecret("x"))
      .run();
    const app = buildTestApp();
    const token = await createSessionToken("verified-1", env.SESSION_SECRET);
    const res = await app.request("/verified-only", { headers: { Cookie: `session=${token}` } }, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "verified-1", isAdmin: true });
  });
});
