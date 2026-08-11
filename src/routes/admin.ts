import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";

export const admin = new Hono<{ Bindings: Bindings; Variables: { userId: string; isAdmin: boolean } }>();

admin.use("*", requireVerified);
admin.use("*", async (c, next) => {
  if (!c.get("isAdmin")) {
    return c.json({ error: "Admin only" }, 403);
  }
  await next();
});

admin.get("/verifications", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, username, school, status, verification_doc_key
     FROM users WHERE verification_state = 'pending' ORDER BY created_at ASC`
  ).all();
  return c.json({ users: results });
});

admin.post("/verifications/:userId/approve", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("UPDATE users SET verification_state = 'verified' WHERE id = ?")
    .bind(userId)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ message: "Approved" });
});

admin.post("/verifications/:userId/reject", async (c) => {
  const userId = c.req.param("userId");
  const result = await c.env.DB.prepare("UPDATE users SET verification_state = 'rejected' WHERE id = ?")
    .bind(userId)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ message: "Rejected" });
});

admin.get("/reports", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, reporter_id, target_type, target_id, reason, created_at FROM reports WHERE status = 'open' ORDER BY created_at ASC"
  ).all();
  return c.json({ reports: results });
});

admin.post("/reports/:id/resolve", async (c) => {
  const id = c.req.param("id");
  const result = await c.env.DB.prepare("UPDATE reports SET status = 'resolved' WHERE id = ? AND status = 'open'")
    .bind(id)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Report not found or already resolved" }, 404);
  }
  return c.json({ message: "Report resolved" });
});

admin.delete("/posts/:id", async (c) => {
  const id = c.req.param("id");
  // Delete comments first, then votes, then the post
  await c.env.DB.prepare("DELETE FROM comments WHERE post_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM votes WHERE target_type = 'post' AND target_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM reports WHERE target_type = 'post' AND target_id = ?").bind(id).run();
  const result = await c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Post not found" }, 404);
  }
  return c.json({ message: "Post deleted" });
});

admin.delete("/comments/:id", async (c) => {
  const id = c.req.param("id");
  // Delete child comments, votes, and reports for this comment
  await c.env.DB.prepare("DELETE FROM comments WHERE parent_comment_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM votes WHERE target_type = 'comment' AND target_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM reports WHERE target_type = 'comment' AND target_id = ?").bind(id).run();
  const result = await c.env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Comment not found" }, 404);
  }
  return c.json({ message: "Comment deleted" });
});
