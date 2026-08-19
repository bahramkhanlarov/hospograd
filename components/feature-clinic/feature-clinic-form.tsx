// Client-side featured-clinic purchase form. The clinic is already listed in
// the directory; this upsells a quarterly featured placement on /medical.
// Submits to /api/clinics/featured/checkout and redirects to Stripe Checkout.

"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { CLINICS } from "@/lib/clinics";

const PRICE_CHF = 490;
const WINDOW_DAYS = 90;

interface SubmitResult {
  url: string;
  placementId: string;
}

export function FeatureClinicForm() {
  const [clinicSlug, setClinicSlug] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clinic = useMemo(
    () => (clinicSlug && CLINICS[clinicSlug] ? CLINICS[clinicSlug] : null),
    [clinicSlug],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!clinic) return;
      setError(null);
      setSubmitting(true);

      try {
        const result = await apiPost<SubmitResult>(
          "/api/clinics/featured/checkout",
          { clinicSlug: clinicSlug },
        );
        if (result.url) {
          window.location.href = result.url;
          return;
        }
        throw new Error("Unexpected response from server.");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setSubmitting(false);
      }
    },
    [clinic, clinicSlug],
  );

  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <h1 className="font-display mb-1 text-[1.5rem] font-medium text-foreground">
        Feature your clinic
      </h1>
      <p className="mb-5 text-[0.85rem] leading-relaxed text-muted-foreground">
        Your clinic is already in the HospoGrad directory. A Featured placement
        pins it to the top of the Medical &amp; Clinics page for{" "}
        {WINDOW_DAYS} days, so international patients see it first.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="clinicSlug"
            className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
          >
            Clinic
          </label>
          <select
            id="clinicSlug"
            value={clinicSlug}
            onChange={(e) => setClinicSlug(e.target.value)}
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="" disabled>
              Select your clinic
            </option>
            {Object.entries(CLINICS).map(([slug, info]) => (
              <option key={slug} value={slug}>
                {info.name} — {info.location}
              </option>
            ))}
          </select>
        </div>

        {clinic && (
          <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
            <img
              src={clinic.img}
              alt={clinic.name}
              className="h-16 w-24 rounded-sm object-cover"
            />
            <div>
              <p className="text-[0.9rem] font-semibold text-foreground">
                {clinic.name}
              </p>
              <p className="text-[0.78rem] text-muted-foreground">
                {clinic.focus} · {clinic.location}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-md border border-border bg-background p-3 text-[0.82rem] text-muted-foreground">
          <span className="font-semibold text-foreground">
            CHF {PRICE_CHF}
          </span>{" "}
          one-time · featured for {WINDOW_DAYS} days
        </div>

        {error && <p className="text-[0.82rem] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !clinic}
          className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting
            ? "Redirecting to payment\u2026"
            : `Continue to payment \u00b7 CHF ${PRICE_CHF}`}
        </button>

        <p className="text-[0.75rem] text-muted-foreground">
          Questions? Email{" "}
          <Link
            href="mailto:team@hospograd.app"
            className="text-foreground underline"
          >
            team@hospograd.app
          </Link>
        </p>
      </form>
    </div>
  );
}