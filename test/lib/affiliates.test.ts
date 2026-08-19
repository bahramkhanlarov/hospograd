import { describe, expect, it } from "vitest";
import {
  AFFILIATE_CATEGORY_LABELS,
  AFFILIATE_PROGRAMS,
  affiliateUrl,
  type AffiliateCategory,
} from "../../lib/affiliates";

describe("affiliate registry", () => {
  it("has unique slugs", () => {
    const slugs = AFFILIATE_PROGRAMS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has valid categories with labels", () => {
    for (const program of AFFILIATE_PROGRAMS) {
      expect(program.category in AFFILIATE_CATEGORY_LABELS).toBe(true);
      expect(program.url.length).toBeGreaterThan(0);
      expect(program.name.length).toBeGreaterThan(0);
      expect(program.description.length).toBeGreaterThan(0);
    }
  });

  it("includes the new bank, education, career and travel programs", () => {
    const slugs = AFFILIATE_PROGRAMS.map((p) => p.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "yuh",
        "neon",
        "ubs-key4",
        "babbel",
        "orell-fussli",
        "swisscare",
        "linkedin-premium",
        "rezi",
      ]),
    );
  });

  it("affiliateUrl returns a plain URL when no tracking code is set", () => {
    const yuh = AFFILIATE_PROGRAMS.find((p) => p.slug === "yuh");
    expect(yuh).toBeDefined();
    expect(affiliateUrl(yuh!)).toBe("https://www.yuh.com");
  });

  it("affiliateUrl appends the tracking parameter when a code is set", () => {
    const program = {
      slug: "test",
      name: "Test",
      category: "banking" as AffiliateCategory,
      description: "x",
      url: "https://example.com",
      trackingParam: "ref",
      trackingValue: "abc",
    };
    expect(affiliateUrl(program)).toBe("https://example.com?ref=abc");
  });
});