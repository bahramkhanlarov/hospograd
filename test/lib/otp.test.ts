import { describe, expect, it } from "vitest";
import { generateOtpCode } from "../../src/routes/auth";
import { hashSecret, verifySecret } from "../../src/lib/crypto";

describe("OTP code generation", () => {
  it("generates a 6-digit numeric code", () => {
    const code = generateOtpCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("a hashed code verifies correctly against the same code", async () => {
    const code = generateOtpCode();
    const hash = await hashSecret(code);
    expect(await verifySecret(code, hash)).toBe(true);
  });
});
