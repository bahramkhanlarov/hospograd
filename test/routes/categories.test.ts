import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";

describe("GET /categories", () => {
  it("returns the 13 seeded categories", async () => {
    const res = await SELF.fetch("https://example.com/api/categories");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { categories: { slug: string }[] };
    expect(body.categories).toHaveLength(13);
  });

  it("returns post_count 0 and last_post_at null for a category with no posts", async () => {
    const res = await SELF.fetch("https://example.com/api/categories");
    const body = (await res.json()) as {
      categories: { slug: string; post_count: number; last_post_at: number | null }[];
    };
    const empty = body.categories.find((c) => c.slug === "general");
    expect(empty?.post_count).toBe(0);
    expect(empty?.last_post_at).toBeNull();
  });

  it("returns an accurate post_count and last_post_at after posts are created", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
    )
      .bind("cat-count-user", "cat-count-user", "cat-count-user@ehl.ch", await hashSecret("x"))
      .run();
    const token = await createSessionToken("cat-count-user", env.SESSION_SECRET);
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'accommodation'").first<{
      id: number;
    }>();

    const post1Res = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "T1", body: "B1" }),
    });
    expect(post1Res.status).toBe(201);
    const post2Res = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "T2", body: "B2" }),
    });
    expect(post2Res.status).toBe(201);

    const res = await SELF.fetch("https://example.com/api/categories");
    const body = (await res.json()) as {
      categories: { slug: string; post_count: number; last_post_at: number | null }[];
    };
    const accommodation = body.categories.find((c) => c.slug === "accommodation");
    expect(accommodation?.post_count).toBeGreaterThanOrEqual(2);
    expect(accommodation?.last_post_at).not.toBeNull();
  });
});

describe("GET /categories/:slug/posts", () => {
  it("includes comment_count per post", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES (?, ?, ?, ?, 'EHL', 'student', 'verified', 0)`
    )
      .bind("slug-count-user", "slug-count-user", "slug-count-user@ehl.ch", await hashSecret("x"))
      .run();
    const token = await createSessionToken("slug-count-user", env.SESSION_SECRET);
    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = 'jobs-internships'").first<{ id: number }>();

    const postRes = await SELF.fetch("https://example.com/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ categoryId: category!.id, title: "Job post", body: "b" }),
    });
    const { post } = (await postRes.json()) as { post: { id: string } };
    await SELF.fetch(`https://example.com/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session=${token}` },
      body: JSON.stringify({ body: "one comment" }),
    });

    const res = await SELF.fetch("https://example.com/api/categories/jobs-internships/posts");
    const body = (await res.json()) as { posts: { title: string; comment_count: number }[] };
    const found = body.posts.find((p) => p.title === "Job post");
    expect(found?.comment_count).toBe(1);
  });
});
