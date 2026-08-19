// Featured-clinic placement helpers shared by the clinics API routes and
// tests. Pure DB logic (no Stripe), so it is fully testable without network.
// A placement is a single row in featured_clinics; the active feature is the
// paid row whose 90-day window has not yet expired. Multiple rows may exist
// over time, but only the newest active one is shown on /medical.

import type { Bindings } from "../index";
import { newId } from "../lib/id";

export interface FeaturedClinicRow {
  id: string;
  clinic_slug: string;
  stripe_session_id: string | null;
  status: string;
  expires_at: number | null;
  created_at: number;
}

// Price for one quarterly placement, in Swiss francs.
export const FEATURED_CLINIC_PRICE_CHF = 490;

// One quarterly slot = 90 days of featuring on the /medical page.
export const FEATURED_CLINIC_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

export async function createPendingPlacement(
  env: Bindings,
  clinicSlug: string,
): Promise<FeaturedClinicRow> {
  const id = newId();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO featured_clinics (id, clinic_slug, status, created_at)
     VALUES (?, ?, 'pending', ?)`
  )
    .bind(id, clinicSlug, now)
    .run();
  return {
    id,
    clinic_slug: clinicSlug,
    stripe_session_id: null,
    status: "pending",
    expires_at: null,
    created_at: now,
  };
}

export async function getPlacementBySession(
  env: Bindings,
  sessionId: string,
): Promise<FeaturedClinicRow | null> {
  return env.DB.prepare(
    `SELECT id, clinic_slug, stripe_session_id, status, expires_at, created_at
     FROM featured_clinics WHERE stripe_session_id = ?`
  )
    .bind(sessionId)
    .first<FeaturedClinicRow>();
}

// Marks a placement paid with a 90-day window from now. Idempotent: a row
// already paid keeps its original expiry instead of stacking another quarter.
export async function confirmPlacement(
  env: Bindings,
  placement: FeaturedClinicRow,
): Promise<void> {
  if (placement.status === "paid" && placement.expires_at) {
    return;
  }
  await env.DB.prepare(
    `UPDATE featured_clinics
     SET status = 'paid', expires_at = ?
     WHERE id = ? AND status = 'pending'`
  )
    .bind(Date.now() + FEATURED_CLINIC_WINDOW_MS, placement.id)
    .run();
}

// Returns the currently-active placement (paid, window not expired), newest
// first — there should only ever be one active slot at a time.
export async function getActivePlacement(
  env: Bindings,
): Promise<FeaturedClinicRow | null> {
  return env.DB.prepare(
    `SELECT id, clinic_slug, stripe_session_id, status, expires_at, created_at
     FROM featured_clinics
     WHERE status = 'paid' AND expires_at > ?
     ORDER BY expires_at DESC
     LIMIT 1`
  )
    .bind(Date.now())
    .first<FeaturedClinicRow>();
}