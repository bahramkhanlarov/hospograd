import { Hono } from "hono";
import type { Bindings } from "../index";
import { hashSecret, verifySecret } from "../lib/crypto";
import { newId } from "../lib/id";
import { createSessionToken } from "../lib/session";
import { requireAuth } from "../middleware/auth";

export const auth = new Hono<{ Bindings: Bindings; Variables: { userId: string } }>();

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtpCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1_000_000).padStart(6, "0");
}

const RESEND_MAX_ATTEMPTS = 3;
const RESEND_RETRY_DELAY_MS = 200;

async function sendOtpEmail(env: { RESEND_API_KEY: string }, email: string, code: string): Promise<void> {
  if (!env.RESEND_API_KEY) return; // no-op in test/dev without a real key

  let lastStatus: number | undefined;
  let lastBody: string | undefined;
  let lastNetworkError: unknown;

  for (let attempt = 1; attempt <= RESEND_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "HospoGrad <noreply@hospograd.app>",
          to: email,
          subject: "Your HospoGrad verification code",
          text: `Your verification code is ${code}. It expires in 10 minutes.`,
        }),
      });

      if (response.ok) {
        return;
      }

      lastStatus = response.status;
      lastBody = await response.text();
      console.warn("Resend send attempt failed", {
        attempt,
        maxAttempts: RESEND_MAX_ATTEMPTS,
        status: lastStatus,
        body: lastBody,
      });
    } catch (err) {
      lastNetworkError = err;
      console.warn("Resend send attempt threw", {
        attempt,
        maxAttempts: RESEND_MAX_ATTEMPTS,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    if (attempt < RESEND_MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RESEND_RETRY_DELAY_MS));
    }
  }

  if (lastNetworkError !== undefined && lastStatus === undefined) {
    throw new Error(
      `Failed to send OTP email via Resend after ${RESEND_MAX_ATTEMPTS} attempts: ${
        lastNetworkError instanceof Error ? lastNetworkError.message : String(lastNetworkError)
      }`
    );
  }

  throw new Error(
    `Failed to send OTP email via Resend after ${RESEND_MAX_ATTEMPTS} attempts: status=${lastStatus} body=${lastBody}`
  );
}

auth.post("/signup", async (c) => {
  const { username, email, password, school, status } = await c.req.json<{
    username: string;
    email: string;
    password: string;
    school: string;
    status: "student" | "alumni";
  }>();

  if (!username || !email || !password || !school || (status !== "student" && status !== "alumni")) {
    return c.json({ error: "Missing or invalid fields" }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .bind(username, email)
    .first();
  if (existing) {
    return c.json({ error: "Username or email already in use" }, 409);
  }

  const id = newId();
  const passwordHash = await hashSecret(password);

  if (status === "student") {
    const code = generateOtpCode();
    const otpHash = await hashSecret(code);
    await c.env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, otp_hash, otp_expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, 'student', 'pending', ?, ?, ?)`
    )
      .bind(id, username, email, passwordHash, school, otpHash, Date.now() + OTP_TTL_MS, Date.now())
      .run();

    try {
      await sendOtpEmail(c.env, email, code);
    } catch (err) {
      console.warn("sendOtpEmail failed after retries", {
        email,
        error: err instanceof Error ? err.message : String(err),
      });
      return c.json({ error: "Failed to send verification email, please try again" }, 502);
    }

    return c.json({ message: "Account created. Check your email for an OTP code." }, 201);
  }

  // Alumni path: no OTP, account starts pending and awaits Task 5's document upload.
  await c.env.DB.prepare(
    `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
     VALUES (?, ?, ?, ?, ?, 'alumni', 'pending', ?)`
  )
    .bind(id, username, email, passwordHash, school, Date.now())
    .run();
  return c.json({ message: "Account created. Submit alumni verification to finish." }, 201);
});

auth.post("/verify-otp", async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();
  const user = await c.env.DB.prepare(
    "SELECT id, otp_hash, otp_expires_at FROM users WHERE email = ? AND status = 'student'"
  )
    .bind(email)
    .first<{ id: string; otp_hash: string | null; otp_expires_at: number | null }>();

  if (!user || !user.otp_hash || !user.otp_expires_at || user.otp_expires_at < Date.now()) {
    return c.json({ error: "Invalid or expired code" }, 401);
  }

  const matches = await verifySecret(code, user.otp_hash);
  if (!matches) {
    return c.json({ error: "Invalid or expired code" }, 401);
  }

  await c.env.DB.prepare(
    "UPDATE users SET verification_state = 'verified', otp_hash = NULL, otp_expires_at = NULL WHERE id = ?"
  )
    .bind(user.id)
    .run();

  return c.json({ message: "Verified" });
});

auth.post("/alumni-verification", async (c) => {
  const form = await c.req.formData();
  const email = form.get("email");
  const linkedinUrl = form.get("linkedinUrl");
  const document = form.get("document");

  if (typeof email !== "string") {
    return c.json({ error: "email is required" }, 400);
  }
  if (typeof linkedinUrl !== "string" && !(document instanceof File)) {
    return c.json({ error: "Provide a linkedinUrl or a document" }, 400);
  }

  const user = await c.env.DB.prepare("SELECT id FROM users WHERE email = ? AND status = 'alumni'")
    .bind(email)
    .first<{ id: string }>();
  if (!user) {
    return c.json({ error: "No pending alumni account for this email" }, 404);
  }

  let docKey: string;
  if (document instanceof File) {
    docKey = `verification/${user.id}/${newId()}-${document.name}`;
    await c.env.UPLOADS.put(docKey, await document.arrayBuffer(), {
      httpMetadata: { contentType: document.type },
    });
  } else {
    docKey = `verification/${user.id}/linkedin.txt`;
    await c.env.UPLOADS.put(docKey, linkedinUrl as string);
  }

  await c.env.DB.prepare("UPDATE users SET verification_doc_key = ? WHERE id = ?").bind(docKey, user.id).run();

  return c.json({ message: "Submitted for review" });
});

auth.post("/login", async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>();
  const user = await c.env.DB.prepare("SELECT id, password_hash FROM users WHERE username = ?")
    .bind(username)
    .first<{ id: string; password_hash: string }>();

  if (!user || !(await verifySecret(password, user.password_hash))) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  const token = await createSessionToken(user.id, c.env.SESSION_SECRET);
  c.header(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
  );
  return c.json({ message: "Logged in" });
});

auth.get("/me", requireAuth, async (c) => {
  const user = await c.env.DB.prepare(
    "SELECT username, school, status, verification_state, is_admin FROM users WHERE id = ?"
  )
    .bind(c.get("userId"))
    .first<{ username: string; school: string; status: string; verification_state: string; is_admin: number }>();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    username: user.username,
    school: user.school,
    status: user.status,
    verificationState: user.verification_state,
    isAdmin: user.is_admin === 1,
  });
});

auth.post("/logout", requireAuth, (c) => {
  c.header("Set-Cookie", "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return c.json({ message: "Logged out" });
});
