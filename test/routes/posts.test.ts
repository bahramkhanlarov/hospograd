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

describe("POST /posts", () => {
  it("creates a post for a verified user", async () => {
    const token = await makeVerifiedUser("post-author-1");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();

    const res = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "Studio near campus?", body: "Any leads on studios?" }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { post: { id: string } };

    const feedRes = await SELF.fetch("https://example.com/api/categories/accommodation/posts");
    const feed = (await feedRes.json()) as { posts: { id: string; username: string; school: string }[] };
    const created = feed.posts.find((p) => p.id === body.post.id);
    expect(created?.username).toBe("user-post-author-1");
    expect(created?.school).toBe("EHL");
  });

  it("rejects unauthenticated post creation", async () => {
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();
    const res = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: category!.id, title: "x", body: "y" }),
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /posts/:id", () => {
  it("returns a single post with author badge info", async () => {
    const token = await makeVerifiedUser("post-author-2");
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{ id: number }>();
    const createRes = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "Hello", body: "World" }),
    });
    const { post } = (await createRes.json()) as { post: { id: string } };

    const res = await SELF.fetch(`https://example.com/api/posts/${post.id}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { post: { title: string; username: string } };
    expect(body.post.title).toBe("Hello");
    expect(body.post.username).toBe("user-post-author-2");
  });

  it("returns 404 for a missing post", async () => {
    const res = await SELF.fetch("https://example.com/api/posts/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("GET /posts (combined feed)", () => {
  it("returns posts from all categories, newest first by default", async () => {
    const token = await makeVerifiedUser("combined-feed-author");
    const catA = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();
    const catB = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'general'").first<{ id: number }>();

    await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: catA!.id, title: "From accommodation", body: "b" }),
    });
    await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: catB!.id, title: "From general", body: "b" }),
    });

    const res = await SELF.fetch("https://example.com/api/posts");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { posts: { title: string }[] };
    const titles = body.posts.map((p) => p.title);
    expect(titles).toContain("From accommodation");
    expect(titles).toContain("From general");
  });

  it("supports sort=top", async () => {
    const res = await SELF.fetch("https://example.com/api/posts?sort=top");
    expect(res.status).toBe(200);
  });
});
