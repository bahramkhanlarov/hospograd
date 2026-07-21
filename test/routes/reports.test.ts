import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeUser(id: string, opts: { isAdmin?: boolean } = {}) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', ?, 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"), opts.isAdmin ? 1 : 0)
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("POST /reports", () => {
  it("creates a report and lists it for admins", async () => {
    const reporterToken = await makeUser("reporter-1");
    const adminToken = await makeUser("admin-reports-1", { isAdmin: true });

    const createRes = await SELF.fetch("https://example.com/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${reporterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: "some-post-id", reason: "Spam" }),
    });
    expect(createRes.status).toBe(201);

    const listRes = await SELF.fetch("https://example.com/api/admin/reports", {
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(listRes.status).toBe(200);
    const body = (await listRes.json()) as { reports: { reason: string }[] };
    expect(body.reports.some((r) => r.reason === "Spam")).toBe(true);
  });

  it("rejects non-admins from listing reports", async () => {
    const token = await makeUser("reporter-2");
    const res = await SELF.fetch("https://example.com/api/admin/reports", { headers: { Cookie: `session=${token}` } });
    expect(res.status).toBe(403);
  });
});
