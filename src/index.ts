import { Hono } from "hono";
import { auth } from "./routes/auth";
import { admin } from "./routes/admin";
import { categories } from "./routes/categories";
import { posts } from "./routes/posts";
import { comments } from "./routes/comments";
import { votes } from "./routes/votes";
import { reports } from "./routes/reports";
import { users } from "./routes/users";

export type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  ASSETS: Fetcher;
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
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

app.route("/api", api);

app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
