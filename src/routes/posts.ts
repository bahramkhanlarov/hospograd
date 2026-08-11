import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";
import { rateLimitPosts } from "../middleware/rateLimit";
import { generateSuggestionForPost } from "../lib/ai";

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

  // Generate AI suggestion in the background (non-blocking)
  c.executionCtx.waitUntil(generateSuggestionForPost(c.env, id));

  return c.json({ post: { id } }, 201);
});

posts.get("/", async (c) => {
  const sort = c.req.query("sort") === "top" ? "p.score DESC" : "p.created_at DESC";
  const limit = Math.min(parseInt(c.req.query("limit") ?? "20"), 100);
  const cursor = c.req.query("cursor");
  const school = c.req.query("school");
  const categorySlug = c.req.query("categorySlug");

  const conditions: string[] = [];
  const params: any[] = [];

  if (school) {
    conditions.push("u.school = ?");
    params.push(school);
  }

  if (categorySlug) {
    conditions.push("c.slug = ?");
    params.push(categorySlug);
  }

  if (cursor) {
    conditions.push("p.created_at < ?");
    params.push(parseInt(cursor));
  }
  params.push(limit + 1);

  const categoryJoin = categorySlug
    ? "JOIN categories c ON c.id = p.category_id\n             "
    : "";

  const baseQuery = `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at, p.category_id,
                            u.username, u.school, u.status,
                            COALESCE(COUNT(cm.id), 0) AS comment_count
                     FROM posts p
                     JOIN users u ON u.id = p.author_id
                     ${categoryJoin}LEFT JOIN comments cm ON cm.post_id = p.id${
                       conditions.length > 0
                         ? `\n             WHERE ${conditions.join(" AND ")}`
                         : ""
                     }
                     GROUP BY p.id
                     ORDER BY ${sort}
                     LIMIT ?`;

  const { results } = await c.env.DB.prepare(baseQuery).bind(...params).all<{ id: string; title: string; body: string; image_keys: string; score: number; created_at: number; category_id: number; username: string; school: string; status: string; comment_count: number }>();
  const hasMore = results.length > limit;
  if (hasMore) results.pop();
  const nextCursor = hasMore && results.length > 0 ? results[results.length - 1].created_at.toString() : null;

  return c.json({ posts: results, nextCursor });
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
