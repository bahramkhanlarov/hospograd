// Job-listings helpers shared by the jobs API routes and tests. The publish
// step is pure DB logic (no Stripe), so it is fully testable without network.

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

// Price for a job-board listing, in Swiss francs.
export const JOB_LISTING_PRICE_CHF = 99;

// How long a paid listing stays pinned to the top of the category.
export const FEATURED_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function buildJobPostBody(listing: JobListingRow): string {
  const lines = [
    `${listing.company} is hiring.`,
    "",
    `**Role:** ${listing.title}`,
    `**Location:** ${listing.location}`,
    `**Type:** ${listing.employment_type}`,
    "",
    listing.description,
    "",
    `**How to apply:** ${listing.contact_email}`,
  ];
  if (listing.apply_url) {
    lines.push(`or via ${listing.apply_url}`);
  }
  return lines.join("\n");
}

export async function createPendingListing(
  env: Bindings,
  input: {
    company: string;
    title: string;
    location: string;
    employmentType: string;
    description: string;
    contactEmail: string;
    applyUrl?: string;
  },
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

// Creates the visible post for a paid listing. Idempotent: if the listing
// already has a post_id, returns it without inserting again. Posts go into
// the jobs-internships category, authored by the reserved team account, and
// are pinned as featured for FEATURED_WINDOW_MS.
export async function publishPaidJob(
  env: Bindings,
  listing: JobListingRow,
): Promise<string> {
  if (listing.post_id) {
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
     VALUES (?, 'hospograd-team', ?, ?, ?, '[]', 0, ?, 1, ?)`
  )
    .bind(
      postId,
      category.id,
      listing.title,
      buildJobPostBody(listing),
      now,
      now + FEATURED_WINDOW_MS,
    )
    .run();

  await env.DB.prepare(
    `UPDATE job_listings SET status = 'paid', post_id = ? WHERE id = ? AND post_id IS NULL`
  )
    .bind(postId, listing.id)
    .run();

  return postId;
}