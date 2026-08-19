// Health-insurance lead helpers shared by the insurance API route and tests.
// The comparison form captures exactly what a Swiss broker needs to quote a
// mandatory health-insurance premium: age, canton, deductible, managed-care
// model, intended start date and contact details. Each submission becomes a
// sellable lead (the Comparis/bonus.ch model); status tracks the handoff to
// a broker partner.

import type { Bindings } from "../index";
import { newId } from "../lib/id";
import { CANTONS, DEDUCTIBLES, PLAN_MODELS } from "../../lib/insurance";

// Lead lifecycle: a lead starts 'new', moves to 'contacted' when a broker
// partner picks it up, then 'converted' (a policy sold) or 'rejected'.
export const LEAD_STATUSES = ["new", "contacted", "converted", "rejected"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  rejected: "Rejected",
};

export interface InsuranceLeadInput {
  age: number;
  canton: string;
  deductible: number;
  planModel: string;
  startDate: string;
  email: string;
  phone?: string;
}

export interface InsuranceLeadRow extends InsuranceLeadInput {
  id: string;
  plan_model: string;
  status: string;
  created_at: number;
}

export function validateLead(input: InsuranceLeadInput): string | null {
  if (!Number.isInteger(input.age) || input.age < 16 || input.age > 100) {
    return "age must be an integer between 16 and 100";
  }
  if (!CANTONS.includes(input.canton as (typeof CANTONS)[number])) {
    return "canton must be a valid Swiss canton code";
  }
  if (!DEDUCTIBLES.includes(input.deductible as (typeof DEDUCTIBLES)[number])) {
    return `deductible must be one of ${DEDUCTIBLES.join(", ")}`;
  }
  if (!PLAN_MODELS.includes(input.planModel as (typeof PLAN_MODELS)[number])) {
    return `planModel must be one of ${PLAN_MODELS.join(", ")}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate)) {
    return "startDate must be an ISO date (YYYY-MM-DD)";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return "email is not a valid email address";
  }
  if (input.phone !== undefined && typeof input.phone !== "string") {
    return "phone must be a string";
  }
  return null;
}

export async function createLead(
  env: Bindings,
  input: InsuranceLeadInput,
): Promise<InsuranceLeadRow> {
  const id = newId();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO insurance_leads
       (id, age, canton, deductible, plan_model, start_date, email, phone, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
  )
    .bind(
      id,
      input.age,
      input.canton,
      input.deductible,
      input.planModel,
      input.startDate,
      input.email,
      input.phone ?? null,
      now,
    )
    .run();
  return {
    id,
    age: input.age,
    canton: input.canton,
    deductible: input.deductible,
    planModel: input.planModel,
    plan_model: input.planModel,
    startDate: input.startDate,
    email: input.email,
    phone: input.phone,
    status: "new",
    created_at: now,
  };
}

export async function listLeads(
  env: Bindings,
): Promise<InsuranceLeadRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, age, canton, deductible, plan_model, start_date, email, phone, status, created_at
     FROM insurance_leads ORDER BY created_at DESC`
  ).all<InsuranceLeadRow>();
  return results.map((row) => ({ ...row, planModel: row.plan_model }));
}

export async function updateLeadStatus(
  env: Bindings,
  id: string,
  status: string,
): Promise<InsuranceLeadRow | null> {
  if (!LEAD_STATUSES.includes(status as LeadStatus)) {
    throw new Error(`invalid status: ${status}`);
  }
  const res = await env.DB.prepare(
    `UPDATE insurance_leads SET status = ? WHERE id = ? RETURNING
       id, age, canton, deductible, plan_model, start_date, email, phone, status, created_at`
  )
    .bind(status, id)
    .first<InsuranceLeadRow>();
  return res ? { ...res, planModel: res.plan_model } : null;
}

export function leadsToCsv(leads: InsuranceLeadRow[]): string {
  const esc = (value: string | number | null | undefined): string => {
    const s = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = [
    "id", "created_at", "age", "canton", "deductible", "plan_model",
    "start_date", "email", "phone", "status",
  ];
  const rows = leads.map((lead) =>
    [
      lead.id,
      new Date(lead.created_at).toISOString(),
      lead.age,
      lead.canton,
      lead.deductible,
      lead.plan_model,
      lead.startDate,
      lead.email,
      lead.phone ?? "",
      lead.status,
    ].map(esc).join(","),
  );
  return [header.join(","), ...rows].join("\n");
}