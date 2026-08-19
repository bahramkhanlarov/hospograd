import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";
import {
  createLead,
  listLeads,
  validateLead,
  type InsuranceLeadInput,
} from "../../src/lib/insurance";

const validLead: InsuranceLeadInput = {
  age: 22,
  canton: "VD",
  deductible: 2500,
  planModel: "standard",
  startDate: "2026-09-01",
  email: "student@example.com",
  phone: "+41 76 000 00 00",
};

describe("lib/insurance", () => {
  it("validateLead accepts a valid lead and rejects invalid fields", () => {
    expect(validateLead(validLead)).toBeNull();

    expect(validateLead({ ...validLead, age: 15 })).toContain("age");
    expect(validateLead({ ...validLead, age: 200 })).toContain("age");
    expect(validateLead({ ...validLead, canton: "XX" })).toContain("canton");
    expect(validateLead({ ...validLead, deductible: 999 })).toContain("deductible");
    expect(validateLead({ ...validLead, planModel: "nope" })).toContain("planModel");
    expect(validateLead({ ...validLead, startDate: "01-09-2026" })).toContain("startDate");
    expect(validateLead({ ...validLead, email: "not-an-email" })).toContain("email");
  });

  it("createLead inserts a new lead with status 'new'", async () => {
    const lead = await createLead(env, validLead);
    const row = await env.DB.prepare("SELECT * FROM insurance_leads WHERE id = ?")
      .bind(lead.id)
      .first();
    expect(row).not.toBeNull();
    expect(row?.status).toBe("new");
    expect(row?.age).toBe(22);
    expect(row?.canton).toBe("VD");
    expect(row?.plan_model).toBe("standard");
  });

  it("listLeads returns leads newest first", async () => {
    await createLead(env, { ...validLead, email: "older@example.com" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const newer = await createLead(env, { ...validLead, email: "newer@example.com" });

    const leads = await listLeads(env);
    expect(leads[0].id).toBe(newer.id);
    expect(leads.some((l) => l.email === "older@example.com")).toBe(true);
  });
});

describe("POST /api/insurance/leads", () => {
  it("stores a lead and returns 201", async () => {
    const res = await SELF.fetch("https://example.com/api/insurance/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validLead),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { leadId: string };
    expect(body.leadId).toBeTruthy();
  });

  it("rejects invalid leads with 400", async () => {
    const res = await SELF.fetch("https://example.com/api/insurance/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validLead, canton: "XX" }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("canton");
  });

  it("accepts a lead without a phone number", async () => {
    const { phone: _phone, ...withoutPhone } = validLead;
    const res = await SELF.fetch("https://example.com/api/insurance/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withoutPhone),
    });
    expect(res.status).toBe(201);
  });
});

describe("GET /api/insurance/leads (admin)", () => {
  it("requires authentication", async () => {
    const res = await SELF.fetch("https://example.com/api/insurance/leads");
    expect(res.status).toBe(401);
  });

  it("rejects non-admins with 403", async () => {
    const token = await createSessionToken("lead-nonadmin", env.SESSION_SECRET);
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('lead-nonadmin', 'lead-nonadmin', 'nonadmin@ehl.ch', ?, 'EHL', 'student', 'verified', 0)`
    )
      .bind(await hashSecret("x"))
      .run();

    const res = await SELF.fetch("https://example.com/api/insurance/leads", {
      headers: { Cookie: `session=${token}` },
    });
    expect(res.status).toBe(403);
  });

  it("lists leads for admins", async () => {
    const adminToken = await createSessionToken("lead-admin", env.SESSION_SECRET);
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
       VALUES ('lead-admin', 'lead-admin', 'admin@ehl.ch', ?, 'EHL', 'student', 'verified', 1, 0)`
    )
      .bind(await hashSecret("x"))
      .run();
    await createLead(env, { ...validLead, email: "admin-sees@example.com" });

    const res = await SELF.fetch("https://example.com/api/insurance/leads", {
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { leads: { email: string }[] };
    expect(body.leads.some((l) => l.email === "admin-sees@example.com")).toBe(true);
  });
});