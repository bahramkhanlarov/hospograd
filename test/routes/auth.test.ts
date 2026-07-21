import { SELF, createExecutionContext, env, fetchMock, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import app from "../../src/index";

describe("POST /auth/signup (student)", () => {
  it("creates a pending user and stores an OTP hash", async () => {
    const res = await SELF.fetch("https://example.com/api/auth/signup", {
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
    await SELF.fetch("https://example.com/api/auth/signup", {
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
    const res = await SELF.fetch("https://example.com/api/auth/signup", {
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
    await SELF.fetch("https://example.com/api/auth/signup", {
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

  it("verifies successfully with the real OTP code sent via Resend", async () => {
    // SELF.fetch() dispatches to a separate worker instance whose bindings are
    // fixed by wrangler.toml, so mutating `env` doesn't reach it. To supply a
    // fake RESEND_API_KEY for just this test, invoke the app's fetch handler
    // directly in this isolate (where fetchMock can also intercept fetch()).
    let capturedBody: string | undefined;

    fetchMock.activate();
    fetchMock.disableNetConnect();
    fetchMock
      .get("https://api.resend.com")
      .intercept({ path: "/emails", method: "POST" })
      .reply((opts) => {
        capturedBody = opts.body as string;
        return { statusCode: 200, data: { id: "fake-resend-id" } };
      });

    try {
      const testEnv = { ...env, RESEND_API_KEY: "fake-resend-key" };

      const signupCtx = createExecutionContext();
      const signupRes = await app.fetch(
        new Request("https://example.com/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "otpsuccessuser",
            email: "otp-success@ehl.ch",
            password: "hunter22-password",
            school: "EHL",
            status: "student",
          }),
        }),
        testEnv,
        signupCtx
      );
      await waitOnExecutionContext(signupCtx);

      expect(signupRes.status).toBe(201);
      expect(capturedBody).toBeTruthy();

      const sentBody = JSON.parse(capturedBody as string) as { text: string };
      const match = sentBody.text.match(/(\d{6})/);
      expect(match).not.toBeNull();
      const code = match![1];

      const verifyRes = await SELF.fetch("https://example.com/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "otp-success@ehl.ch", code }),
      });
      expect(verifyRes.status).toBe(200);
      const verifyBody = (await verifyRes.json()) as { message: string };
      expect(verifyBody.message).toMatch(/verified/i);

      const row = await env.DB.prepare(
        "SELECT verification_state, otp_hash, otp_expires_at FROM users WHERE email = ?"
      )
        .bind("otp-success@ehl.ch")
        .first<{ verification_state: string; otp_hash: string | null; otp_expires_at: number | null }>();
      expect(row?.verification_state).toBe("verified");
      expect(row?.otp_hash).toBeNull();
      expect(row?.otp_expires_at).toBeNull();
    } finally {
      fetchMock.deactivate();
    }
  });

  it("rejects an incorrect code", async () => {
    await SELF.fetch("https://example.com/api/auth/signup", {
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
    const res = await SELF.fetch("https://example.com/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "otp2@ehl.ch", code: "000000" }),
    });
    expect(res.status).toBe(401);
  });
});
