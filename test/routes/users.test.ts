import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

async function makeVerifiedUser(id: string) {
  await env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, 'EHL', 'alumni', 'verified', 0)`
  )
    .bind(id, `profileuser-${id}`, `${id}@ehl.ch`, await hashSecret("x"))
    .run();
  return createSessionToken(id, env.SESSION_SECRET);
}

describe("GET /users/:username", () => {
  it("returns public profile fields plus post and comment history", async () => {
    const token = await makeVerifiedUser("profile-1");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{
      id: number;
    }>();
    const postRes = await SELF.fetch("https://example.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "My post", body: "Body" }),
    });
    const { post } = (await postRes.json()) as { post: { id: string } };
    await SELF.fetch(`https://example.com/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "My comment" }),
    });

    const res = await SELF.fetch("https://example.com/users/profileuser-profile-1");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      user: { username: string; school: string; status: string; verification_state: string };
      posts: { title: string }[];
      comments: { body: string }[];
    };
    expect(body.user.school).toBe("EHL");
    expect(body.user.status).toBe("alumni");
    expect(body.posts.some((p) => p.title === "My post")).toBe(true);
    expect(body.comments.some((c) => c.body === "My comment")).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/@ehl\.ch/); // email must never be exposed
  });

  it("returns 404 for a missing username", async () => {
    const res = await SELF.fetch("https://example.com/users/does-not-exist");
    expect(res.status).toBe(404);
  });
});
