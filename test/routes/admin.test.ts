import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeUser(id: string, opts: { isAdmin?: boolean; state?: string } = {}) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', ?, ?, 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"), opts.state ?? "verified", opts.isAdmin ? 1 : 0)
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("admin verification queue", () => {
  it("rejects non-admins", async () => {
    const token = await makeUser("admin-test-1");
    const res = await SELF.fetch("https://example.com/admin/verifications", {
      headers: { Cookie: `session=${token}` },
    });
    expect(res.status).toBe(403);
  });

  it("lists pending users for admins", async () => {
    const adminToken = await makeUser("admin-test-2", { isAdmin: true });
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('pending-1', 'pendinguser', 'pending@glion.ch', ?, 'Glion', 'alumni', 'pending', 0)`
    )
      .bind(await hashSecret("x"))
      .run();

    const res = await SELF.fetch("https://example.com/admin/verifications", {
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { users: { id: string }[] };
    expect(body.users.some((u) => u.id === "pending-1")).toBe(true);
  });

  it("approves a pending user", async () => {
    const adminToken = await makeUser("admin-test-3", { isAdmin: true });
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('pending-2', 'pendinguser2', 'pending2@glion.ch', ?, 'Glion', 'alumni', 'pending', 0)`
    )
      .bind(await hashSecret("x"))
      .run();

    const res = await SELF.fetch("https://example.com/admin/verifications/pending-2/approve", {
      method: "POST",
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(res.status).toBe(200);

    const row = await env.DB.prepare("SELECT verification_state FROM users WHERE id = ?")
      .bind("pending-2")
      .first<{ verification_state: string }>();
    expect(row?.verification_state).toBe("verified");
  });
});
