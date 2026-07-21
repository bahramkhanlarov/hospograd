import { Hono } from "hono";
import type { Bindings } from "../index";

export const categories = new Hono<{ Bindings: Bindings }>();

categories.get("/", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT id, slug, name, description FROM categories ORDER BY id").all();
  return c.json({ categories: results });
});

categories.get("/:slug/posts", async (c) => {
  const slug = c.req.param("slug");
  const sort = c.req.query("sort") === "top" ? "p.score DESC" : "p.created_at DESC";

  const category = await c.env.DB.prepare("SELECT id FROM categories WHERE slug = ?")
    .bind(slug)
    .first<{ id: number }>();
  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.body, p.image_keys, p.score, p.created_at,
            u.username, u.school, u.status
     FROM posts p JOIN users u ON u.id = p.author_id
     WHERE p.category_id = ?
     ORDER BY ${sort}`
  )
    .bind(category.id)
    .all();

  return c.json({ posts: results });
});
