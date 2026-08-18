import { Hono } from "hono";
import type { Bindings } from "../index";
import { createCheckoutSession, getCheckoutSession } from "../lib/stripe";
import {
  FREE_POST_LIMIT_PER_HOUR,
  JOB_LISTING_PRICE_CHF,
  countRecentFreePosts,
  createPendingListing,
  getListingBySession,
  listingToJobInput,
  publishJob,
} from "../lib/jobs";

// Pay-per-posting job board with a free tier. Employers are not forum users,
// so both endpoints are public:
//   POST /api/jobs  — validate the job. If featured, create a pending listing
//                     + Stripe Checkout Session and return {url}. If free,
//                     publish the post immediately (rate-limited) and return
//                     {postId}.
//   GET  /api/jobs/status?session_id=… — poll a session; when paid, publish
//                     the post as featured (idempotent) and return {postId}.
// The success page polls status for featured jobs; free jobs link straight to
// the post.

export const jobs = new Hono<{ Bindings: Bindings }>();

jobs.post("/", async (c) => {
  let input: {
    company?: unknown;
    title?: unknown;
    location?: unknown;
    employmentType?: unknown;
    description?: unknown;
    contactEmail?: unknown;
    applyUrl?: unknown;
    featured?: unknown;
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
  const featured = input.featured === true;

  if (!company || !title || !location || !employmentType || !description || !contactEmail) {
    return c.json(
      { error: "company, title, location, employmentType, description and contactEmail are required" },
      400,
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return c.json({ error: "contactEmail is not a valid email address" }, 400);
  }

  const job = {
    company,
    title,
    location,
    employmentType,
    description,
    contactEmail,
    applyUrl,
  };

  // Free tier: publish immediately.
  if (!featured) {
    const recent = await countRecentFreePosts(c.env);
    if (recent >= FREE_POST_LIMIT_PER_HOUR) {
      return c.json(
        { error: "Too many free posts this hour. Try again later or feature your listing." },
        429,
      );
    }
    const postId = await publishJob(c.env, job, { featured: false });
    return c.json({ postId, featured: false }, 201);
  }

  // Featured tier: collect payment first, publish on confirmation.
  const secretKey = c.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return c.json(
      { error: "Payments are not configured yet. Please try again later." },
      503,
    );
  }

  const listing = await createPendingListing(c.env, job);

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

  return c.json({ url: checkout.url, listingId: listing.id, featured: true }, 201);
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

  const postId = await publishJob(c.env, listingToJobInput(listing), {
    listing,
    featured: true,
  });
  return c.json({ status: "paid", postId });
});