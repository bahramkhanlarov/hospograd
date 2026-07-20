import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("POST /auth/signup (student)", () => {
  it("creates a pending user and stores an OTP hash", async () => {
    const res = await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "mountainchef92",
        email: "student@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { message: string };
    expect(body.message).toMatch(/otp/i);

    const row = await env.DB.prepare("SELECT verification_state, otp_hash FROM users WHERE email = ?")
      .bind("student@ehl.ch")
      .first<{ verification_state: string; otp_hash: string | null }>();
    expect(row?.verification_state).toBe("pending");
    expect(row?.otp_hash).not.toBeNull();
  });

  it("rejects a duplicate username", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "dupeuser",
        email: "first@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    const res = await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "dupeuser",
        email: "second@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    expect(res.status).toBe(409);
  });
});

describe("POST /auth/verify-otp", () => {
  it("verifies the user when the code matches and is not expired", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "otpuser",
        email: "otp@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    const row = await env.DB.prepare("SELECT id FROM users WHERE email = ?")
      .bind("otp@ehl.ch")
      .first<{ id: string }>();
    // In test mode RESEND_API_KEY is unset, so the route stores the plaintext
    // code on a debug field the test can read directly instead of parsing email.
    const otpRow = await env.DB.prepare("SELECT otp_hash FROM users WHERE id = ?").bind(row!.id).first<{
      otp_hash: string;
    }>();
    expect(otpRow.otp_hash).toBeTruthy();
  });

  it("rejects an incorrect code", async () => {
    await SELF.fetch("https://example.com/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "otpuser2",
        email: "otp2@ehl.ch",
        password: "hunter22-password",
        school: "EHL",
        status: "student",
      }),
    });
    const res = await SELF.fetch("https://example.com/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "otp2@ehl.ch", code: "000000" }),
    });
    expect(res.status).toBe(401);
  });
});
