// Client-side job posting form. Submits to /api/jobs/checkout to create a
// Stripe Checkout Session, then redirects the browser to Stripe.

"use client";

import { useCallback, useState } from "react";
import { apiPost } from "@/lib/api";

const PRICE_CHF = 99;

interface FormState {
  company: string;
  title: string;
  location: string;
  employmentType: string;
  description: string;
  contactEmail: string;
  applyUrl: string;
}

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Trainee program",
  "Seasonal",
  "Casual / on-call",
] as const;

export function PostJobForm() {
  const [form, setForm] = useState<FormState>({
    company: "",
    title: "",
    location: "",
    employmentType: "",
    description: "",
    contactEmail: "",
    applyUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      try {
        const result = await apiPost<{ url: string; listingId: string }>(
          "/api/jobs/checkout",
          {
            company: form.company,
            title: form.title,
            location: form.location,
            employmentType: form.employmentType,
            description: form.description,
            contactEmail: form.contactEmail,
            applyUrl: form.applyUrl || undefined,
          },
        );
        window.location.href = result.url;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setSubmitting(false);
      }
    },
    [form],
  );

  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <h1 className="font-display mb-1 text-[1.5rem] font-medium text-foreground">
        Post a job to HospoGrad
      </h1>
      <p className="mb-5 text-[0.85rem] leading-relaxed text-muted-foreground">
        Reach verified hospitality students and recent graduates across
        Switzerland. Your listing is pinned to the top of the Jobs &amp;
        Internships board for 30 days.
      </p>

      <div className="mb-5 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-[0.85rem]">
        <span className="font-semibold text-foreground">
          CHF {PRICE_CHF} one-time
        </span>{" "}
        <span className="text-muted-foreground">
          &middot; pay securely with Stripe &middot; 30 days featured
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="company"
            className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            value={form.company}
            onChange={handleChange}
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Job title
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Montreux, Geneva, remote"
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="employmentType"
            className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
          >
            Employment type
          </label>
          <select
            id="employmentType"
            value={form.employmentType}
            onChange={handleChange}
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="" disabled>
              Select a type
            </option>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="Role responsibilities, requirements, start date, salary range\u2026"
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contactEmail"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Contact email
            </label>
            <input
              type="email"
              id="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="jobs@company.ch"
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label
              htmlFor="applyUrl"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Application link{" "}
              <span className="text-[0.7rem] text-muted-foreground/70">
                (optional)
              </span>
            </label>
            <input
              type="url"
              id="applyUrl"
              value={form.applyUrl}
              onChange={handleChange}
              placeholder="https://company.ch/careers"
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {error && <p className="text-[0.82rem] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting
            ? "Redirecting to payment\u2026"
            : `Continue to payment \u00b7 CHF ${PRICE_CHF}`}
        </button>
      </form>
    </div>
  );
}