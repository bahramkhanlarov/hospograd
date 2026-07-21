import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeVerifiedUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
  )
    .bind(id, `user-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("post rate limiting", () => {
  it("blocks the 6th post within an hour when the limit is 5", async () => {
    const token = await makeVerifiedUser("rate-limited-user");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{
      id: number;
    }>();

    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await SELF.fetch("https://example.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
        body: JSON.stringify({ categoryId: category!.id, title: `Post ${i}`, body: "body" }),
      });
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses[5]).toBe(429);
  });
});
