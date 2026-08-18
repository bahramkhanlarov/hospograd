// Client-side job posting form. Submits to /api/jobs: free jobs publish
// immediately (returning a postId and showing inline success); featured jobs
// return a Stripe Checkout URL that the browser redirects to.

"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
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

type Tier = "free" | "featured";

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Trainee program",
  "Seasonal",
  "Casual / on-call",
] as const;

interface SubmitResult {
  postId?: string;
  url?: string;
  featured?: boolean;
}

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
  const [tier, setTier] = useState<Tier>("free");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null);

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
        const result = await apiPost<SubmitResult>("/api/jobs", {
          company: form.company,
          title: form.title,
          location: form.location,
          employmentType: form.employmentType,
          description: form.description,
          contactEmail: form.contactEmail,
          applyUrl: form.applyUrl || undefined,
          featured: tier === "featured",
        });
        if (result.featured && result.url) {
          window.location.href = result.url;
          return;
        }
        if (result.postId) {
          setPublishedPostId(result.postId);
          setSubmitting(false);
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
    [form, tier],
  );

  if (publishedPostId) {
    return (
      <div className="rounded-md border border-border bg-card p-5 text-center shadow-sm">
        <h1 className="font-display mb-2 text-[1.5rem] font-medium text-foreground">
          Your job is live
        </h1>
        <p className="mb-6 text-[0.9rem] text-muted-foreground">
          Thanks for posting to HospoGrad. You can upgrade to a Featured
          listing anytime — pinned to the top of the Jobs &amp; Internships
          board for 30 days.
        </p>
        <Link
          href={`/posts/${publishedPostId}`}
          className="inline-block rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          View your listing
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <h1 className="font-display mb-1 text-[1.5rem] font-medium text-foreground">
        Post a job to HospoGrad
      </h1>
      <p className="mb-5 text-[0.85rem] leading-relaxed text-muted-foreground">
        Reach verified hospitality students and recent graduates across
        Switzerland. Posting is free — optionally pin your listing to the top
        of the Jobs &amp; Internships board for 30 days.
      </p>

      <fieldset className="mb-5 grid gap-3 sm:grid-cols-2">
        <legend className="mb-1 block text-[0.82rem] font-medium text-muted-foreground">
          Posting tier
        </legend>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-[0.85rem] ${
            tier === "free"
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:bg-card-hover"
          }`}
        >
          <input
            type="radio"
            name="tier"
            value="free"
            checked={tier === "free"}
            onChange={() => setTier("free")}
            className="mt-1"
          />
          <span>
            <span className="font-semibold text-foreground">Free</span>{" "}
            <span className="text-muted-foreground">
              &middot; publish immediately
            </span>
          </span>
        </label>
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-[0.85rem] ${
            tier === "featured"
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:bg-card-hover"
          }`}
        >
          <input
            type="radio"
            name="tier"
            value="featured"
            checked={tier === "featured"}
            onChange={() => setTier("featured")}
            className="mt-1"
          />
          <span>
            <span className="font-semibold text-foreground">
              Featured · CHF {PRICE_CHF}
            </span>{" "}
            <span className="text-muted-foreground">
              &middot; pinned for 30 days
            </span>
          </span>
        </label>
      </fieldset>

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
            ? tier === "featured"
              ? "Redirecting to payment\u2026"
              : "Publishing\u2026"
            : tier === "featured"
              ? `Continue to payment \u00b7 CHF ${PRICE_CHF}`
              : "Publish for free"}
        </button>
      </form>
    </div>
  );
}