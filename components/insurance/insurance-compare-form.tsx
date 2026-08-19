// Client-side health-insurance comparison form. Collects the qualification
// data a Swiss broker needs to quote a basic policy (age, canton, deductible,
// plan model, start date, contact) and submits it to /api/insurance/leads.
// Mirrors the post-job form pattern: server shell + client sub-component.

"use client";

import { useCallback, useState } from "react";
import { apiPost } from "@/lib/api";
import {
  CANTONS,
  DEDUCTIBLES,
  PLAN_MODELS,
  PLAN_MODEL_LABELS,
} from "@/lib/insurance";

interface SubmitResult {
  leadId: string;
}

export function InsuranceCompareForm() {
  const [age, setAge] = useState<string>("");
  const [canton, setCanton] = useState<string>("");
  const [deductible, setDeductible] = useState<string>("");
  const [planModel, setPlanModel] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      try {
        await apiPost<SubmitResult>("/api/insurance/leads", {
          age: Number(age),
          canton,
          deductible: Number(deductible),
          planModel,
          startDate,
          email,
          phone: phone.trim() || undefined,
        });
        setSubmitted(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [age, canton, deductible, planModel, startDate, email, phone],
  );

  if (submitted) {
    return (
      <div className="rounded-md border border-border bg-card p-5 text-center shadow-sm">
        <h1 className="font-display mb-2 text-[1.5rem] font-medium text-foreground">
          Thanks — you&rsquo;re on the list
        </h1>
        <p className="mb-6 text-[0.9rem] text-muted-foreground">
          We&rsquo;ve got your details. Someone from our insurance partners will
          be in touch with quotes matched to your canton and plan choices.
          You&rsquo;re under no obligation — comparing before you pick your
          first policy can save you hundreds a year.
        </p>
        <p className="text-[0.8rem] text-muted-foreground">
          In the meantime, the FAQ on the previous page covers the basics, and
          the Money &amp; Taxes board is full of students who have already done
          this.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <h1 className="font-display mb-1 text-[1.5rem] font-medium text-foreground">
        Compare health insurance
      </h1>
      <p className="mb-5 text-[0.85rem] leading-relaxed text-muted-foreground">
        Basic health insurance is mandatory for everyone in Switzerland. These
        few answers are exactly what an insurer needs to quote your premium.
        Submitting is free and creates no obligation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="age"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Your age
            </label>
            <input
              type="number"
              id="age"
              min={16}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 22"
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label
              htmlFor="canton"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Canton of residence
            </label>
            <select
              id="canton"
              value={canton}
              onChange={(e) => setCanton(e.target.value)}
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="" disabled>
                Select a canton
              </option>
              {CANTONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="deductible"
            className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
          >
            Deductible (Franchise) per year
          </label>
          <select
            id="deductible"
            value={deductible}
            onChange={(e) => setDeductible(e.target.value)}
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="" disabled>
              Select a deductible
            </option>
            {DEDUCTIBLES.map((d) => (
              <option key={d} value={d}>
                CHF {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="planModel"
            className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
          >
            Plan model
          </label>
          <select
            id="planModel"
            value={planModel}
            onChange={(e) => setPlanModel(e.target.value)}
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="" disabled>
              Select a model
            </option>
            {PLAN_MODELS.map((m) => (
              <option key={m} value={m}>
                {PLAN_MODEL_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
          >
            When do you need cover from?
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
            >
              Phone{" "}
              <span className="text-[0.7rem] text-muted-foreground/70">
                (optional)
              </span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+41 76 000 00 00"
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
          {submitting ? "Submitting\u2026" : "Get my quote options"}
        </button>

        <p className="text-[0.75rem] text-muted-foreground">
          Your details are only used to match you with an insurance partner for
          a quote. No spam, no obligation.
        </p>
      </form>
    </div>
  );
}