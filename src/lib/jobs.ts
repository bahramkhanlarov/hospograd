// Job-listings helpers shared by the jobs API routes and tests. The publish
// step is pure DB logic (no Stripe), so it is fully testable without network.
// Two tiers: free posts publish immediately (not pinned); featured posts go
// through Stripe Checkout and are pinned to the top of the category for a
// fixed window once payment is confirmed.

import type { Bindings } from "../index";
import { newId } from "../lib/id";

export interface JobListingRow {
  id: string;
  company: string;
  title: string;
  location: string;
  employment_type: string;
  description: string;
  contact_email: string;
  apply_url: string | null;
  stripe_session_id: string | null;
  status: string;
  post_id: string | null;
  created_at: number;
}

export interface JobInput {
  company: string;
  title: string;
  location: string;
  employmentType: string;
  description: string;
  contactEmail: string;
  applyUrl?: string;
}

// Price for pinning a listing as featured, in Swiss francs.
export const JOB_LISTING_PRICE_CHF = 99;

// How long a featured listing stays pinned to the top of the category.
export const FEATURED_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// Spam guard for the public, no-auth free-posting endpoint: cap how many
// free posts the team account publishes per hour.
export const FREE_POST_LIMIT_PER_HOUR = 10;
const HOUR_MS = 60 * 60 * 1000;

export function buildJobPostBody(job: JobInput): string {
  const lines = [
    `${job.company} is hiring.`,
    "",
    `**Role:** ${job.title}`,
    `**Location:** ${job.location}`,
    `**Type:** ${job.employmentType}`,
    "",
    job.description,
    "",
    `**How to apply:** ${job.contactEmail}`,
  ];
  if (job.applyUrl) {
    lines.push(`or via ${job.applyUrl}`);
  }
  return lines.join("\n");
}

export async function createPendingListing(
  env: Bindings,
  input: JobInput,
): Promise<JobListingRow> {
  const id = newId();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO job_listings
       (id, company, title, location, employment_type, description,
        contact_email, apply_url, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
  )
    .bind(
      id,
      input.company,
      input.title,
      input.location,
      input.employmentType,
      input.description,
      input.contactEmail,
      input.applyUrl ?? null,
      now,
    )
    .run();
  return {
    id,
    company: input.company,
    title: input.title,
    location: input.location,
    employment_type: input.employmentType,
    description: input.description,
    contact_email: input.contactEmail,
    apply_url: input.applyUrl ?? null,
    stripe_session_id: null,
    status: "pending",
    post_id: null,
    created_at: now,
  };
}

export async function getListingBySession(
  env: Bindings,
  sessionId: string,
): Promise<JobListingRow | null> {
  return env.DB.prepare(
    `SELECT id, company, title, location, employment_type, description,
            contact_email, apply_url, stripe_session_id, status, post_id, created_at
     FROM job_listings WHERE stripe_session_id = ?`
  )
    .bind(sessionId)
    .first<JobListingRow>();
}

export function listingToJobInput(listing: JobListingRow): JobInput {
  return {
    company: listing.company,
    title: listing.title,
    location: listing.location,
    employmentType: listing.employment_type,
    description: listing.description,
    contactEmail: listing.contact_email,
    applyUrl: listing.apply_url ?? undefined,
  };
}

// Creates the visible post for a job. Featured posts go in the
// jobs-internships category pinned as featured for FEATURED_WINDOW_MS;
// free posts are pinned for zero time (featured stays 0). Both are authored
// by the reserved team account. Idempotent: if the listing already has a
// post_id, returns it without inserting again.
export async function publishJob(
  env: Bindings,
  job: JobInput,
  opts: { listing?: JobListingRow; featured: boolean },
): Promise<string> {
  const { listing, featured } = opts;

  if (listing?.post_id) {
    return listing.post_id;
  }

  const category = await env.DB.prepare(
    "SELECT id FROM categories WHERE slug = 'jobs-internships'"
  ).first<{ id: number }>();
  if (!category) {
    throw new Error("jobs-internships category missing");
  }

  const now = Date.now();
  const postId = newId();
  await env.DB.prepare(
    `INSERT INTO posts
       (id, author_id, category_id, title, body, image_keys, score, created_at, featured, featured_until)
     VALUES (?, 'hospograd-team', ?, ?, ?, '[]', 0, ?, ?, ?)`
  )
    .bind(
      postId,
      category.id,
      job.title,
      buildJobPostBody(job),
      now,
      featured ? 1 : 0,
      featured ? now + FEATURED_WINDOW_MS : null,
    )
    .run();

  if (listing) {
    await env.DB.prepare(
      `UPDATE job_listings SET status = 'paid', post_id = ? WHERE id = ? AND post_id IS NULL`
    )
      .bind(postId, listing.id)
      .run();
  }

  return postId;
}

// Counts posts the team account published to the jobs-internships category
// within the last hour — used to rate-limit the public, no-auth free-posting
// endpoint (all free posts carry the team account as author).
export async function countRecentFreePosts(env: Bindings): Promise<number> {
  const since = Date.now() - HOUR_MS;
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM posts p JOIN categories c ON c.id = p.category_id
     WHERE c.slug = 'jobs-internships' AND p.author_id = 'hospograd-team' AND p.created_at > ?`
  )
    .bind(since)
    .first<{ count: number }>();
  return row?.count ?? 0;
}