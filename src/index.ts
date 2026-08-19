import { Hono } from "hono";
import { auth } from "./routes/auth";
import { admin } from "./routes/admin";
import { categories } from "./routes/categories";
import { posts } from "./routes/posts";
import { comments } from "./routes/comments";
import { votes } from "./routes/votes";
import { reports } from "./routes/reports";
import { users } from "./routes/users";
import { uploads } from "./routes/uploads";
import { suggestions } from "./routes/suggestions";
import { jobs } from "./routes/jobs";
import { invite } from "./routes/invite";
import { generateSuggestionForPost } from "./lib/ai";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  ASSETS: Fetcher;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
  OPENROUTER_API_KEY: string;
  STRIPE_SECRET_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

const api = new Hono<{ Bindings: Bindings }>();
api.get("/health", (c) => c.json({ ok: true }));
api.route("/auth", auth);
api.route("/admin", admin);
api.route("/categories", categories);
api.route("/posts", posts);
api.route("/posts", comments);
api.route("/votes", votes);
api.route("/reports", reports);
api.route("/users", users);
api.route("/uploads", uploads);
api.route("/suggestions", suggestions);
api.route("/jobs", jobs);
api.route("/invite", invite);

app.route("/api", api);

app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

// Cron trigger: every 4 hours, generate suggestions for unanswered posts
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    // Find posts with no comments and no pending suggestions
    const { results } = await env.DB.prepare(
      `SELECT p.id FROM posts p
       WHERE p.id NOT IN (SELECT post_id FROM comments)
       AND p.id NOT IN (SELECT post_id FROM suggested_answers WHERE status = 'pending')
       ORDER BY p.created_at ASC
       LIMIT 5`
    ).all<{ id: string }>();

    for (const row of results) {
      ctx.waitUntil(generateSuggestionForPost(env, row.id));
    }
  },
};
