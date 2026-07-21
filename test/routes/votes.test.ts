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

async function makePost(token: string) {
  const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{ id: number }>();
  const res = await SELF.fetch("https://example.com/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
    body: JSON.stringify({ categoryId: category!.id, title: "T", body: "B" }),
  });
  const { post } = (await res.json()) as { post: { id: string } };
  return post.id;
}

describe("POST /votes", () => {
  it("upvotes a post and updates its score", async () => {
    const authorToken = await makeVerifiedUser("vote-author");
    const postId = await makePost(authorToken);
    const voterToken = await makeVerifiedUser("voter-1");

    const res = await SELF.fetch("https://example.com/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${voterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: postId, value: 1 }),
    });
    expect(res.status).toBe(200);

    const post = await env.DB.prepare("SELECT score FROM posts WHERE id = ?").bind(postId).first<{ score: number }>();
    expect(post?.score).toBe(1);
  });

  it("changes an existing vote instead of adding a second one", async () => {
    const authorToken = await makeVerifiedUser("vote-author-2");
    const postId = await makePost(authorToken);
    const voterToken = await makeVerifiedUser("voter-2");

    await SELF.fetch("https://example.com/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${voterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: postId, value: 1 }),
    });
    await SELF.fetch("https://example.com/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${voterToken}` },
      body: JSON.stringify({ targetType: "post", targetId: postId, value: -1 }),
    });

    const post = await env.DB.prepare("SELECT score FROM posts WHERE id = ?").bind(postId).first<{ score: number }>();
    expect(post?.score).toBe(-1);

    const voteCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM votes WHERE target_type = 'post' AND target_id = ?"
    )
      .bind(postId)
      .first<{ count: number }>();
    expect(voteCount?.count).toBe(1);
  });

  it("rejects an invalid value", async () => {
    const token = await makeVerifiedUser("voter-3");
    const res = await SELF.fetch("https://example.com/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ targetType: "post", targetId: "whatever", value: 5 }),
    });
    expect(res.status).toBe(400);
  });
});
