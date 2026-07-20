import { Hono } from "hono";
import type { Bindings } from "../index";
import { hashSecret, verifySecret } from "../lib/crypto";
import { newId } from "../lib/id";

export const auth = new Hono<{ Bindings: Bindings }>();

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtpCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1_000_000).padStart(6, "0");
}

async function sendOtpEmail(env: { RESEND_API_KEY: string }, email: string, code: string): Promise<void> {
  if (!env.RESEND_API_KEY) return; // no-op in test/dev without a real key
  await fetch("https://api.resend.com/emails", {
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
    await sendOtpEmail(c.env, email, code);
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
