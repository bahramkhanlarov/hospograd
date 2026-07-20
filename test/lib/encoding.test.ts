import { describe, expect, it } from "vitest";
import { constantTimeEqual, fromHex, toHex } from "../../src/lib/encoding";

describe("hex encoding", () => {
  it("round-trips bytes through toHex and fromHex", () => {
    const bytes = new Uint8Array([0, 1, 15, 16, 255, 128]);
    expect(fromHex(toHex(bytes))).toEqual(bytes);
  });

  it("throws on odd-length hex input", () => {
    expect(() => fromHex("abc")).toThrow(/even length/);
  });

  it("throws on non-hex characters", () => {
    expect(() => fromHex("zz")).toThrow(/non-hex character/);
  });
});

describe("constantTimeEqual", () => {
  it("returns true for equal strings", () => {
    expect(constantTimeEqual("same-value", "same-value")).toBe(true);
  });

  it("returns false for unequal strings of the same length", () => {
    expect(constantTimeEqual("abcdef", "abcdeg")).toBe(false);
  });

  it("returns false for unequal-length strings", () => {
    expect(constantTimeEqual("short", "much-longer-string")).toBe(false);
  });

  it("returns true for two empty strings", () => {
    expect(constantTimeEqual("", "")).toBe(true);
  });
});
