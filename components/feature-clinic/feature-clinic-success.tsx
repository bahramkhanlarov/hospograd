// Client-side payment-success polling for a featured clinic. Reads the Stripe
// Checkout session id, polls /api/clinics/featured/status until confirmed,
// then links back to the /medical page.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

export function FeatureClinicSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [paid, setPaid] = useState(false);
  const [failed, setFailed] = useState(false);

  const poll = useCallback(async () => {
    if (!sessionId) {
      setFailed(true);
      return;
    }
    try {
      const data = await apiGet<{
        status: string;
        clinicSlug: string | null;
      }>(`/api/clinics/featured/status?session_id=${encodeURIComponent(sessionId)}`);
      if (data.status === "paid") {
        setPaid(true);
      }
    } catch {
      /* keep polling until MAX_POLLS */
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let polls = 0;
    const timer = setInterval(() => {
      polls += 1;
      if (polls >= MAX_POLLS) {
        clearInterval(timer);
        setFailed(true);
        return;
      }
      void poll();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [poll, sessionId]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-10 text-center">
      {paid ? (
        <>
          <h1 className="font-display mb-2 text-[1.5rem] font-medium text-foreground">
            Your clinic is featured
          </h1>
          <p className="mb-6 text-[0.9rem] text-muted-foreground">
            Payment confirmed. Your clinic is now pinned to the top of the
            Medical &amp; Clinics page for 90 days.
          </p>
          <Link
            href="/medical"
            className="rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            View the Medical page
          </Link>
        </>
      ) : failed ? (
        <>
          <h1 className="font-display mb-2 text-[1.5rem] font-medium text-foreground">
            We&rsquo;re still confirming your payment
          </h1>
          <p className="mb-6 max-w-md text-[0.9rem] text-muted-foreground">
            It usually takes a moment. Refresh this page in a minute — if your
            placement still doesn&rsquo;t appear, email{" "}
            <span className="text-foreground">team@hospograd.app</span> with
            your session reference.
          </p>
          <a
            href={`/feature-clinic/success?session_id=${encodeURIComponent(sessionId ?? "")}`}
            className="rounded-sm border border-border px-4 py-2 text-[0.85rem] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Refresh
          </a>
        </>
      ) : (
        <>
          <h1 className="font-display mb-2 text-[1.5rem] font-medium text-foreground">
            Confirming your payment\u2026
          </h1>
          <p className="text-[0.9rem] text-muted-foreground">
            This can take a few seconds.
          </p>
        </>
      )}
    </div>
  );
}