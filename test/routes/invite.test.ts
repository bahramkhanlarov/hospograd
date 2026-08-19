import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
  )
    .bind(id, `invite-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("GET /api/invite", () => {
  it("returns the username and invitee count for the logged-in user", async () => {
    const token = await makeUser("inviter-a");
    const res = await SELF.fetch("https://example.com/api/invite", {
      headers: { Cookie: `session=${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { username: string; invitees: number };
    expect(body.username).toBe("invite-inviter-a");
    expect(body.invitees).toBe(0);
  });

  it("counts users who signed up through the inviter", async () => {
    const token = await makeUser("inviter-b");
    const inviter = await env.DB.prepare("SELECT id FROM users WHERE username = ?")
      .bind("invite-inviter-b")
      .first<{ id: string }>();

    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, invited_by, created_at)
       VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', ?, 0)`
    )
      .bind("referred-1", "referred1", "referred1@ehl.ch", await hashSecret("x"), inviter!.id)
      .run();
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, invited_by, created_at)
       VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', ?, 0)`
    )
      .bind("referred-2", "referred2", "referred2@ehl.ch", await hashSecret("x"), inviter!.id)
      .run();

    const res = await SELF.fetch("https://example.com/api/invite", {
      headers: { Cookie: `session=${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { username: string; invitees: number };
    expect(body.invitees).toBe(2);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await SELF.fetch("https://example.com/api/invite");
    expect(res.status).toBe(401);
  });
});
