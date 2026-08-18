import { Hono } from "hono";
import type { Bindings } from "../index";

export const categories = new Hono<{ Bindings: Bindings }>();

categories.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.slug, c.name, c.description,
            COUNT(p.id) AS post_count,
            MAX(p.created_at) AS last_post_at
     FROM categories c
     LEFT JOIN posts p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.id`
  ).all();
  return c.json({ categories: results });
});

categories.get("/:slug/posts", async (c) => {
  const slug = c.req.param("slug");
  const sort = c.req.query("sort") === "top" ? "p.score DESC" : "p.created_at DESC";
  const limit = Math.min(parseInt(c.req.query("limit") ?? "20"), 100);
  const cursor = c.req.query("cursor");

  const category = await c.env.DB.prepare("SELECT id FROM categories WHERE slug = ?")
    .bind(slug)
    .first<{ id: number }>();
  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  let query, params;
  const featuredOrder =
    "CASE WHEN p.featured = 1 AND p.featured_until > strftime('%s','now') * 1000 THEN 0 ELSE 1 END,";
  if (cursor) {
    query = `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at,
                    p.featured, p.featured_until,
                    u.username, u.school, u.status,
                    COUNT(cm.id) AS comment_count
             FROM posts p
             JOIN users u ON u.id = p.author_id
             LEFT JOIN comments cm ON cm.post_id = p.id
             WHERE p.category_id = ? AND p.created_at < ?
             GROUP BY p.id
             ORDER BY ${featuredOrder} ${sort}
             LIMIT ?`;
    params = [category.id, parseInt(cursor), limit + 1];
  } else {
    query = `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at,
                    p.featured, p.featured_until,
                    u.username, u.school, u.status,
                    COUNT(cm.id) AS comment_count
             FROM posts p
             JOIN users u ON u.id = p.author_id
             LEFT JOIN comments cm ON cm.post_id = p.id
             WHERE p.category_id = ?
             GROUP BY p.id
             ORDER BY ${featuredOrder} ${sort}
             LIMIT ?`;
    params = [category.id, limit + 1];
  }

  const { results } = await c.env.DB.prepare(query).bind(...params).all<{ id: string; title: string; body: string; image_keys: string; score: number; created_at: number; featured: number; featured_until: number | null; username: string; school: string; status: string; comment_count: number }>();
  const hasMore = results.length > limit;
  if (hasMore) results.pop();
  const nextCursor = hasMore && results.length > 0 ? results[results.length - 1].created_at.toString() : null;

  return c.json({ posts: results, nextCursor });
});
