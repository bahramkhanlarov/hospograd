import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import {
  FEATURED_CLINIC_WINDOW_MS,
  confirmPlacement,
  createPendingPlacement,
  getActivePlacement,
  getPlacementBySession,
  type FeaturedClinicRow,
} from "../../src/lib/clinics";

async function createPendingRow(slug = "clinique-nescens"): Promise<FeaturedClinicRow> {
  const placement = await createPendingPlacement(env, slug);
  await env.DB.prepare(
    "UPDATE featured_clinics SET stripe_session_id = ? WHERE id = ?"
  )
    .bind(`cs_${placement.id}`, placement.id)
    .run();
  return placement;
}

describe("lib/clinics", () => {
  it("createPendingPlacement inserts a pending row", async () => {
    const placement = await createPendingPlacement(env, "clinique-nescens");
    const row = await env.DB.prepare(
      "SELECT * FROM featured_clinics WHERE id = ?"
    )
      .bind(placement.id)
      .first();
    expect(row).not.toBeNull();
    expect(row?.status).toBe("pending");
    expect(row?.clinic_slug).toBe("clinique-nescens");
    expect(row?.stripe_session_id).toBeNull();
  });

  it("confirmPlacement marks a row paid with a 90-day window, idempotently", async () => {
    const placement = await createPendingRow();
    await confirmPlacement(env, placement);

    const paid = (await getPlacementBySession(
      env,
      `cs_${placement.id}`,
    ))!;
    expect(paid?.status).toBe("paid");
    expect(paid?.expires_at).not.toBeNull();
    expect(paid!.expires_at! - Date.now()).toBeGreaterThan(
      FEATURED_CLINIC_WINDOW_MS - 5000,
    );

    // Idempotent: confirming again keeps the same expiry.
    const before = paid!.expires_at!;
    await confirmPlacement(env, paid!);
    const after = await getPlacementBySession(env, `cs_${placement.id}`);
    expect(after?.expires_at).toBe(before);
  });

  it("getActivePlacement returns only a paid, unexpired row", async () => {
    const placement = await createPendingRow();
    // Nothing active before payment.
    expect(await getActivePlacement(env)).toBeNull();

    await confirmPlacement(env, placement);
    const active = await getActivePlacement(env);
    expect(active?.id).toBe(placement.id);
    expect(active?.clinic_slug).toBe("clinique-nescens");

    // Expiring the row makes it inactive.
    await env.DB.prepare(
      "UPDATE featured_clinics SET expires_at = ? WHERE id = ?"
    )
      .bind(Date.now() - 1000, placement.id)
      .run();
    expect(await getActivePlacement(env)).toBeNull();
  });
});

describe("POST /api/clinics/featured/checkout", () => {
  it("returns 503 when Stripe is not configured", async () => {
    const res = await SELF.fetch("https://example.com/api/clinics/featured/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicSlug: "clinique-nescens" }),
    });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("not configured");
  });

  it("rejects unknown clinic slugs", async () => {
    const res = await SELF.fetch("https://example.com/api/clinics/featured/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clinicSlug: "not-a-clinic" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/clinics/featured/status", () => {
  it("requires session_id", async () => {
    const res = await SELF.fetch("https://example.com/api/clinics/featured/status");
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown session", async () => {
    const res = await SELF.fetch(
      "https://example.com/api/clinics/featured/status?session_id=cs_unknown"
    );
    expect(res.status).toBe(404);
  });

  it("returns the confirmed placement for an already-paid session without Stripe", async () => {
    const placement = await createPendingRow();
    await confirmPlacement(env, placement);

    const res = await SELF.fetch(
      `https://example.com/api/clinics/featured/status?session_id=cs_${placement.id}`
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; clinicSlug: string };
    expect(body.status).toBe("paid");
    expect(body.clinicSlug).toBe("clinique-nescens");
  });
});

describe("GET /api/clinics/featured", () => {
  it("returns null when the slot is empty", async () => {
    const res = await SELF.fetch("https://example.com/api/clinics/featured");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { featured: unknown };
    expect(body.featured).toBeNull();
  });

  it("returns the active featured clinic merged with its directory entry", async () => {
    const placement = await createPendingRow("clinique-nescens");
    await confirmPlacement(env, placement);

    const res = await SELF.fetch("https://example.com/api/clinics/featured");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      featured: { slug: string; clinic: { name: string; img: string } };
    };
    expect(body.featured?.slug).toBe("clinique-nescens");
    expect(body.featured?.clinic?.name).toBe("Clinique Nescens");
    expect(body.featured?.clinic?.img).toContain("clinique-nescens");
  });
});