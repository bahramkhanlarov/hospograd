import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

export const comments = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

comments.post("/:postId/comments", requireVerified, async (c) => {
  const postId = c.req.param("postId");
  const { body, parentCommentId } = await c.req.json<{ body: string; parentCommentId?: string }>();

  if (!body) {
    return c.json({ error: "body is required" }, 400);
  }

  const post = await c.env.DB.prepare("SELECT id FROM posts WHERE id = ?").bind(postId).first();
  if (!post) {
    return c.json({ error: "Post not found" }, 404);
  }

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO comments (id, post_id, parent_comment_id, author_id, body, score, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?)`
  )
    .bind(id, postId, parentCommentId ?? null, c.get("userId"), body, Date.now())
    .run();

  return c.json({ comment: { id } }, 201);
});

comments.get("/:postId/comments", async (c) => {
  const postId = c.req.param("postId");
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.parent_comment_id, c.body, c.score, c.created_at, u.username, u.school, u.status
     FROM comments c JOIN users u ON u.id = c.author_id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`
  )
    .bind(postId)
    .all();
  return c.json({ comments: results });
});
