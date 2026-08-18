import { Hono } from "hono";
import type { Bindings } from "../index";
import { createCheckoutSession, getCheckoutSession } from "../lib/stripe";
import {
  JOB_LISTING_PRICE_CHF,
  createPendingListing,
  getListingBySession,
  publishPaidJob,
} from "../lib/jobs";

// Pay-per-posting job board. Two public endpoints (no auth — employers are
// not forum users):
//   POST /api/jobs/checkout  — validate the job, insert a pending listing,
//                              create a Stripe Checkout Session, return {url}.
//   GET  /api/jobs/status?session_id=… — poll a session; when paid, publish
//                              the post (idempotent) and return {postId}.
// The success page polls status; the checkout URL is where the employer pays.

export const jobs = new Hono<{ Bindings: Bindings }>();

jobs.post("/checkout", async (c) => {
  let input: {
    company?: unknown;
    title?: unknown;
    location?: unknown;
    employmentType?: unknown;
    description?: unknown;
    contactEmail?: unknown;
    applyUrl?: unknown;
  };
  try {
    input = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const company = typeof input.company === "string" ? input.company.trim() : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const location = typeof input.location === "string" ? input.location.trim() : "";
  const employmentType =
    typeof input.employmentType === "string" ? input.employmentType.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  const contactEmail =
    typeof input.contactEmail === "string" ? input.contactEmail.trim() : "";
  const applyUrl =
    typeof input.applyUrl === "string" && input.applyUrl.trim()
      ? input.applyUrl.trim()
      : undefined;

  if (!company || !title || !location || !employmentType || !description || !contactEmail) {
    return c.json(
      { error: "company, title, location, employmentType, description and contactEmail are required" },
      400,
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return c.json({ error: "contactEmail is not a valid email address" }, 400);
  }

  const secretKey = c.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return c.json(
      { error: "Payments are not configured yet. Please try again later." },
      503,
    );
  }

  const listing = await createPendingListing(c.env, {
    company,
    title,
    location,
    employmentType,
    description,
    contactEmail,
    applyUrl,
  });

  const origin = new URL(c.req.url).origin;
  const checkout = await createCheckoutSession(secretKey, {
    amountChf: JOB_LISTING_PRICE_CHF,
    company,
    jobTitle: title,
    successUrl: `${origin}/post-job/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/post-job?cancelled=1`,
    metadata: {
      listingId: listing.id,
    },
  });

  await c.env.DB.prepare(
    "UPDATE job_listings SET stripe_session_id = ? WHERE id = ?"
  )
    .bind(checkout.id, listing.id)
    .run();

  return c.json({ url: checkout.url, listingId: listing.id }, 201);
});

jobs.get("/status", async (c) => {
  const sessionId = c.req.query("session_id");
  if (!sessionId) {
    return c.json({ error: "session_id query parameter is required" }, 400);
  }

  const listing = await getListingBySession(c.env, sessionId);
  if (!listing) {
    return c.json({ error: "Listing not found for this session" }, 404);
  }

  // Already paid — return the existing post id without hitting Stripe.
  if (listing.status === "paid" && listing.post_id) {
    return c.json({ status: "paid", postId: listing.post_id });
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
    return c.json({ status: "pending", postId: null });
  }

  const postId = await publishPaidJob(c.env, listing);
  return c.json({ status: "paid", postId });
});