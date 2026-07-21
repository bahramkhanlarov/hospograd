import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";
import { rateLimitPosts } from "../middleware/rateLimit";

export const posts = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

posts.post("/", requireVerified, rateLimitPosts, async (c) => {
  const { categoryId, title, body, imageKeys } = await c.req.json<{
    categoryId: number;
    title: string;
    body: string;
    imageKeys?: string[];
  }>();

  if (!categoryId || !title || !body) {
    return c.json({ error: "categoryId, title, and body are required" }, 400);
  }

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO posts (id, author_id, category_id, title, body, image_keys, score, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
  )
    .bind(id, c.get("userId"), categoryId, title, body, JSON.stringify(imageKeys ?? []), Date.now())
    .run();

  return c.json({ post: { id } }, 201);
});

posts.get("/:id", async (c) => {
  const id = c.req.param("id");
  const post = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at,
            u.username, u.school, u.status
     FROM posts p JOIN users u ON u.id = p.author_id
     WHERE p.id = ?`
  )
    .bind(id)
    .first();

  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }
  return c.json({ post });
});
