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

describe("GET /api/auth/me", () => {
  it("returns the current user's public info when authenticated", async () => {
    const token = await makeUser("whoami-1");
    const res = await SELF.fetch("https://example.com/api/auth/me", { headers: { Cookie: `session=${token}` } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { username: string; school: string; isAdmin: boolean };
    expect(body.username).toBe("user-whoami-1");
    expect(body.school).toBe("EHL");
    expect(body.isAdmin).toBe(false);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await SELF.fetch("https://example.com/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const token = await makeUser("logout-1");
    const res = await SELF.fetch("https://example.com/api/auth/logout", {
      method: "POST",
      headers: { Cookie: `session=${token}` },
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/session=;/);
    expect(setCookie).toMatch(/Max-Age=0/);
  });
});
