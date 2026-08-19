// Health-insurance comparison leads. The public submit endpoint captures a
// qualified lead (age, canton, deductible, plan model, start date, contact)
// and stores it for sale to a broker partner. A notification is sent to the
// team so leads are actionable immediately. Admin-only listing is exposed for
// reviewing and forwarding leads to a partner.
//   POST /api/insurance/leads          — public; store a new lead
//   GET  /api/insurance/leads          — admin only; list all leads

import { Hono } from "hono";
import type { Bindings } from "../index";
import { requireVerified } from "../middleware/auth";
import {
  createLead,
  listLeads,
  validateLead,
  type InsuranceLeadInput,
} from "../lib/insurance";

export const insurance = new Hono<{
  Bindings: Bindings;
  Variables: { userId: string; isAdmin: boolean };
}>();

const LEAD_NOTIFY_MAX_ATTEMPTS = 3;
const LEAD_NOTIFY_RETRY_DELAY_MS = 200;

async function notifyTeamOfLead(
  env: Bindings,
  lead: { id: string; age: number; canton: string; deductible: number; planModel: string; email: string; phone?: string },
): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  let lastStatus: number | undefined;
  let lastBody: string | undefined;
  let lastNetworkError: unknown;

  for (let attempt = 1; attempt <= LEAD_NOTIFY_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "HospoGrad <noreply@hospograd.app>",
          to: "team@hospograd.app",
          subject: `New health-insurance lead: ${lead.age}yo, ${lead.canton}`,
          text: [
            `New insurance lead (${lead.id}).`,
            "",
            `Age: ${lead.age}`,
            `Canton: ${lead.canton}`,
            `Deductible: ${lead.deductible}`,
            `Plan model: ${lead.planModel}`,
            `Email: ${lead.email}`,
            `Phone: ${lead.phone ?? "not provided"}`,
          ].join("\n"),
        }),
      });

      if (response.ok) return;

      lastStatus = response.status;
      lastBody = await response.text();
      console.warn("Lead notify attempt failed", {
        attempt,
        maxAttempts: LEAD_NOTIFY_MAX_ATTEMPTS,
        status: lastStatus,
        body: lastBody,
      });
    } catch (err) {
      lastNetworkError = err;
      console.warn("Lead notify attempt threw", {
        attempt,
        maxAttempts: LEAD_NOTIFY_MAX_ATTEMPTS,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    if (attempt < LEAD_NOTIFY_MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, LEAD_NOTIFY_RETRY_DELAY_MS));
    }
  }

  if (lastNetworkError !== undefined && lastStatus === undefined) {
    throw new Error(
      `Failed to notify on new lead after ${LEAD_NOTIFY_MAX_ATTEMPTS} attempts: ${
        lastNetworkError instanceof Error ? lastNetworkError.message : String(lastNetworkError)
      }`
    );
  }

  throw new Error(
    `Failed to notify on new lead after ${LEAD_NOTIFY_MAX_ATTEMPTS} attempts: status=${lastStatus} body=${lastBody}`
  );
}

insurance.post("/leads", async (c) => {
  let input: InsuranceLeadInput;
  try {
    const body = (await c.req.json()) as Record<string, unknown>;
    input = {
      age: typeof body.age === "number" ? body.age : NaN,
      canton: typeof body.canton === "string" ? body.canton.trim() : "",
      deductible: typeof body.deductible === "number" ? body.deductible : NaN,
      planModel: typeof body.planModel === "string" ? body.planModel.trim() : "",
      startDate: typeof body.startDate === "string" ? body.startDate.trim() : "",
      email: typeof body.email === "string" ? body.email.trim() : "",
      phone: typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : undefined,
    };
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const validationError = validateLead(input);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const lead = await createLead(c.env, input);

  try {
    await notifyTeamOfLead(c.env, lead);
  } catch (err) {
    // The lead is stored regardless; a failed notification must not lose it.
    console.warn("Stored lead but notification failed", {
      leadId: lead.id,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return c.json({ leadId: lead.id }, 201);
});

insurance.get("/leads", requireVerified, async (c) => {
  if (!c.get("isAdmin")) {
    return c.json({ error: "Admin only" }, 403);
  }
  const leads = await listLeads(c.env);
  return c.json({ leads });
});