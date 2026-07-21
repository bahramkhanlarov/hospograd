import { createMiddleware } from "hono/factory";
import type { Bindings } from "../index";

const POST_LIMIT_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

export const rateLimitPosts = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string };
}>(async (c, next) => {
  const since = Date.now() - HOUR_MS;
  const count = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND created_at > ?"
  )
    .bind(c.get("userId"), since)
    .first<{ count: number }>();

  if ((count?.count ?? 0) >= POST_LIMIT_PER_HOUR) {
    return c.json({ error: "Posting rate limit reached. Try again later." }, 429);
  }
  await next();
});

export const rateLimitComments = createMiddleware<{
  Bindings: Bindings;
  Variables: { userId: string };
}>(async (c, next) => {
  const since = Date.now() - HOUR_MS;
  const count = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM comments WHERE author_id = ? AND created_at > ?"
  )
    .bind(c.get("userId"), since)
    .first<{ count: number }>();

  if ((count?.count ?? 0) >= POST_LIMIT_PER_HOUR) {
    return c.json({ error: "Commenting rate limit reached. Try again later." }, 429);
  }
  await next();
});
