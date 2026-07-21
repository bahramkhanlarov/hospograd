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
  const res = await SELF.fetch("https://example.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
    body: JSON.stringify({ categoryId: category!.id, title: "T", body: "B" }),
  });
  const { post } = (await res.json()) as { post: { id: string } };
  return post.id;
}

describe("comments", () => {
  it("creates a top-level comment and a nested reply, both listed for the post", async () => {
    const token = await makeVerifiedUser("commenter-1");
    const postId = await makePost(token);

    const topRes = await SELF.fetch(`https://example.com/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "Top level comment" }),
    });
    expect(topRes.status).toBe(201);
    const { comment: topComment } = (await topRes.json()) as { comment: { id: string } };

    const replyRes = await SELF.fetch(`https://example.com/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "A reply", parentCommentId: topComment.id }),
    });
    expect(replyRes.status).toBe(201);

    const listRes = await SELF.fetch(`https://example.com/posts/${postId}/comments`);
    const { comments } = (await listRes.json()) as {
      comments: { id: string; parent_comment_id: string | null; body: string }[];
    };
    expect(comments).toHaveLength(2);
    expect(comments.find((c) => c.body === "A reply")?.parent_comment_id).toBe(topComment.id);
  });

  it("rejects unauthenticated comment creation", async () => {
    const token = await makeVerifiedUser("commenter-2");
    const postId = await makePost(token);
    const res = await SELF.fetch(`https://example.com/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "no auth" }),
    });
    expect(res.status).toBe(401);
  });
});
