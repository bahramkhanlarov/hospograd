import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import { newId } from "../lib/id";

// Approved AI suggestions post as this reserved system account, never as the
// approving admin's own identity -- see migrations/0003_system_user.sql.
const SYSTEM_USER_ID = "hospograd-team";

export const suggestions = new Hono<{
  Bindings: Bindings;
  Variables: { userId: string; isAdmin: boolean };
}>();

suggestions.use("*", requireVerified);
suggestions.use("*", async (c, next) => {
  if (!c.get("isAdmin")) {
    return c.json({ error: "Admin only" }, 403);
  }
  await next();
});

// List pending suggestions with post info
suggestions.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT sa.id, sa.post_id, sa.body, sa.status, sa.created_at,
            p.title AS post_title, u.username AS post_author
     FROM suggested_answers sa
     JOIN posts p ON p.id = sa.post_id
     JOIN users u ON u.id = p.author_id
     WHERE sa.status = 'pending'
     ORDER BY sa.created_at ASC`
  ).all();
  return c.json({ suggestions: results });
});

// Approve a suggestion — posts it as a comment from the reserved
// hospograd-team system account, never from the approving admin's own
// identity. The admin can edit the AI-drafted text before it's published;
// an unedited body still requires an explicit approve action.
suggestions.post("/:id/approve", async (c) => {
  const id = c.req.param("id");
  const { body: editedBody } = await c.req.json<{ body?: string }>().catch(() => ({ body: undefined }));

  const sug = await c.env.DB.prepare(
    "SELECT sa.*, p.author_id FROM suggested_answers sa JOIN posts p ON p.id = sa.post_id WHERE sa.id = ?"
  )
    .bind(id)
    .first<{
      id: string;
      post_id: string;
      body: string;
      status: string;
      author_id: string;
    }>();

  if (!sug || sug.status !== "pending") {
    return c.json({ error: "Suggestion not found or not pending" }, 404);
  }

  const finalBody = (editedBody ?? sug.body).trim();
  if (!finalBody) {
    return c.json({ error: "Comment body cannot be empty" }, 400);
  }

  const commentId = newId();
  await c.env.DB.prepare(
    "INSERT INTO comments (id, post_id, parent_comment_id, author_id, body, score, created_at) VALUES (?, ?, NULL, ?, ?, 0, ?)"
  )
    .bind(commentId, sug.post_id, SYSTEM_USER_ID, finalBody, Date.now())
    .run();

  // Mark suggestion as approved
  await c.env.DB.prepare("UPDATE suggested_answers SET status = 'approved' WHERE id = ?")
    .bind(id)
    .run();

  return c.json({ message: "Posted as comment", commentId });
});

// Reject a suggestion
suggestions.post("/:id/reject", async (c) => {
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(
    "UPDATE suggested_answers SET status = 'rejected' WHERE id = ? AND status = 'pending'"
  )
    .bind(id)
    .run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Suggestion not found or not pending" }, 404);
  }
  return c.json({ message: "Rejected" });
});