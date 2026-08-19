// Featured-clinic placement on the /medical page. Clinics are not forum
// users — they already appear in the static CLINICS directory — so the
// endpoints are public:
//   POST /api/clinics/featured/checkout  — validate the clinic slug, create a
//                     pending placement + Stripe Checkout Session, return
//                     {url}.
//   GET  /api/clinics/featured/status?session_id=… — poll a session; when
//                     paid, activate the placement for a 90-day window
//                     (idempotent) and return {status}.
//   GET  /api/clinics/featured — return the currently-active featured clinic
//                     merged with its directory entry, or {featured: null}.
// The success page polls status; the /medical page renders the featured card
// from the GET endpoint.

import { Hono } from "hono";
import type { Bindings } from "../index";
import { createCheckoutSession, getCheckoutSession } from "../lib/stripe";
import { CLINICS, type ClinicInfo } from "../../lib/clinics";
import {
  FEATURED_CLINIC_PRICE_CHF,
  confirmPlacement,
  createPendingPlacement,
  getActivePlacement,
  getPlacementBySession,
} from "../lib/clinics";

export const clinics = new Hono<{ Bindings: Bindings }>();

export interface FeaturedClinicResponse {
  slug: string;
  clinic: ClinicInfo;
  expiresAt: number;
}

clinics.post("/featured/checkout", async (c) => {
  let input: { clinicSlug?: unknown };
  try {
    input = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const clinicSlug =
    typeof input.clinicSlug === "string" ? input.clinicSlug.trim() : "";
  if (!clinicSlug || !CLINICS[clinicSlug]) {
    return c.json({ error: "clinicSlug must reference a clinic in the directory" }, 400);
  }

  const secretKey = c.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return c.json(
      { error: "Payments are not configured yet. Please try again later." },
      503,
    );
  }

  const placement = await createPendingPlacement(c.env, clinicSlug);

  const origin = new URL(c.req.url).origin;
  const checkout = await createCheckoutSession(secretKey, {
    amountChf: FEATURED_CLINIC_PRICE_CHF,
    productName: `Featured placement — ${CLINICS[clinicSlug].name}`,
    successUrl: `${origin}/feature-clinic/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/feature-clinic?cancelled=1`,
    metadata: {
      placementId: placement.id,
    },
  });

  await c.env.DB.prepare(
    "UPDATE featured_clinics SET stripe_session_id = ? WHERE id = ?"
  )
    .bind(checkout.id, placement.id)
    .run();

  return c.json({ url: checkout.url, placementId: placement.id }, 201);
});

clinics.get("/featured/status", async (c) => {
  const sessionId = c.req.query("session_id");
  if (!sessionId) {
    return c.json({ error: "session_id query parameter is required" }, 400);
  }

  const placement = await getPlacementBySession(c.env, sessionId);
  if (!placement) {
    return c.json({ error: "Placement not found for this session" }, 404);
  }

  // Already paid — return the active clinic slug without hitting Stripe.
  if (placement.status === "paid") {
    return c.json({ status: "paid", clinicSlug: placement.clinic_slug });
  }

  const secretKey = c.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return c.json(
      { error: "Payments are not configured yet. Please try again later." },
      503,
    );
  }

  const session = await getCheckoutSession(secretKey, sessionId);
  if (session.paymentStatus !== "paid") {
    return c.json({ status: "pending", clinicSlug: null });
  }

  await confirmPlacement(c.env, placement);
  return c.json({ status: "paid", clinicSlug: placement.clinic_slug });
});

clinics.get("/featured", async (c) => {
  const active = await getActivePlacement(c.env);
  if (!active) {
    return c.json({ featured: null });
  }
  const clinic = CLINICS[active.clinic_slug];
  if (!clinic) {
    return c.json({ featured: null });
  }
  const body: FeaturedClinicResponse = {
    slug: active.clinic_slug,
    clinic,
    expiresAt: active.expires_at as number,
  };
  return c.json({ featured: body });
});