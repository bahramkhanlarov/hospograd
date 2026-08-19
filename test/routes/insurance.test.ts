import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { createSessionToken } from "../../src/lib/session";
import { hashSecret } from "../../src/lib/crypto";
import {
  createLead,
  leadsToCsv,
  listLeads,
  updateLeadStatus,
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

  it("updateLeadStatus updates the status and returns the row", async () => {
    const lead = await createLead(env, validLead);
    const updated = await updateLeadStatus(env, lead.id, "contacted");
    expect(updated?.status).toBe("contacted");

    const row = await env.DB.prepare("SELECT status FROM insurance_leads WHERE id = ?")
      .bind(lead.id)
      .first<{ status: string }>();
    expect(row?.status).toBe("contacted");
  });

  it("updateLeadStatus throws on invalid status and returns null for missing id", async () => {
    await expect(updateLeadStatus(env, "whatever", "bogus")).rejects.toThrow("invalid status");
    expect(await updateLeadStatus(env, "missing-id", "contacted")).toBeNull();
  });

  it("leadsToCsv emits a header row and escapes values", async () => {
    const lead = await createLead(env, { ...validLead, email: 'quote"test@example.com' });
    const csv = leadsToCsv([lead]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "id,created_at,age,canton,deductible,plan_model,start_date,email,phone,status",
    );
    expect(lines[1]).toContain("quote\"\"test@example.com");
    expect(lines[1]).toContain(",new");
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

  it("updates a lead status via POST", async () => {
    const adminToken = await createSessionToken("lead-admin2", env.SESSION_SECRET);
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
       VALUES ('lead-admin2', 'lead-admin2', 'admin2@ehl.ch', ?, 'EHL', 'student', 'verified', 1, 0)`
    )
      .bind(await hashSecret("x"))
      .run();
    const lead = await createLead(env, validLead);

    const bad = await SELF.fetch(
      `https://example.com/api/admin/insurance/leads/${lead.id}/status`,
      {
        method: "POST",
        headers: { Cookie: `session=${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "bogus" }),
      },
    );
    expect(bad.status).toBe(400);

    const res = await SELF.fetch(
      `https://example.com/api/admin/insurance/leads/${lead.id}/status`,
      {
        method: "POST",
        headers: { Cookie: `session=${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "converted" }),
      },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { lead: { status: string } };
    expect(body.lead.status).toBe("converted");

    const missing = await SELF.fetch(
      "https://example.com/api/admin/insurance/leads/does-not-exist/status",
      {
        method: "POST",
        headers: { Cookie: `session=${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      },
    );
    expect(missing.status).toBe(404);
  });

  it("exports leads as CSV", async () => {
    const adminToken = await createSessionToken("lead-admin3", env.SESSION_SECRET);
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, is_admin, created_at)
       VALUES ('lead-admin3', 'lead-admin3', 'admin3@ehl.ch', ?, 'EHL', 'student', 'verified', 1, 0)`
    )
      .bind(await hashSecret("x"))
      .run();
    await createLead(env, { ...validLead, email: "csv@example.com" });

    const res = await SELF.fetch("https://example.com/api/admin/insurance/leads/export", {
      headers: { Cookie: `session=${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("csv@example.com");
    expect(text.startsWith("id,created_at,age,canton,deductible,plan_model,start_date,email,phone,status")).toBe(true);
  });

  it("status/export endpoints reject non-admins with 403", async () => {
    const token = await createSessionToken("lead-nonadmin2", env.SESSION_SECRET);
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('lead-nonadmin2', 'lead-nonadmin2', 'nonadmin2@ehl.ch', ?, 'EHL', 'student', 'verified', 0)`
    )
      .bind(await hashSecret("x"))
      .run();

    const statusRes = await SELF.fetch(
      "https://example.com/api/admin/insurance/leads/some-id/status",
      {
        method: "POST",
        headers: { Cookie: `session=${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "contacted" }),
      },
    );
    expect(statusRes.status).toBe(403);

    const exportRes = await SELF.fetch(
      "https://example.com/api/admin/insurance/leads/export",
      { headers: { Cookie: `session=${token}` } },
    );
    expect(exportRes.status).toBe(403);
  });
});