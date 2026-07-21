import { Hono } from "hono";
import type { Bindings } from "../index";

export const users = new Hono<{ Bindings: Bindings }>();

users.get("/:username", async (c) => {
  const username = c.req.param("username");
  const user = await c.env.DB.prepare(
    "SELECT username, school, status, verification_state, created_at FROM users WHERE username = ?"
  )
    .bind(username)
    .first<{ username: string; school: string; status: string; verification_state: string; created_at: number }>();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  const { results: posts } = await c.env.DB.prepare(
    `SELECT p.id, p.title, p.score, p.created_at, p.category_id
     FROM posts p JOIN users u ON u.id = p.author_id
     WHERE u.username = ? ORDER BY p.created_at DESC`
  )
    .bind(username)
    .all();

  const { results: comments } = await c.env.DB.prepare(
    `SELECT c.id, c.post_id, c.body, c.score, c.created_at
     FROM comments c JOIN users u ON u.id = c.author_id
     WHERE u.username = ? ORDER BY c.created_at DESC`
  )
    .bind(username)
    .all();

  return c.json({ user, posts, comments });
});
