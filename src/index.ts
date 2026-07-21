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
  SESSION_SECRET: string;
  RESEND_API_KEY: string;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/auth", auth);
app.route("/admin", admin);
app.route("/categories", categories);
app.route("/posts", posts);
app.route("/posts", comments);
app.route("/votes", votes);
app.route("/reports", reports);
app.route("/users", users);

export default app;
