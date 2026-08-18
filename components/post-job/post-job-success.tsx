// Client-side payment-success polling. Reads the Stripe Checkout session id,
// polls /api/jobs/status until the session is confirmed paid (the post is
// then published and pinned), and links to the live listing.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

export function PostJobSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [postId, setPostId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const poll = useCallback(async () => {
    if (!sessionId) {
      setFailed(true);
      return;
    }
    try {
      const data = await apiGet<{
        status: string;
        postId: string | null;
      }>(`/api/jobs/status?session_id=${encodeURIComponent(sessionId)}`);
      if (data.status === "paid" && data.postId) {
        setPostId(data.postId);
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
      {postId ? (
        <>
          <h1 className="font-display mb-2 text-[1.5rem] font-medium text-foreground">
            Your job is live
          </h1>
          <p className="mb-6 text-[0.9rem] text-muted-foreground">
            Payment confirmed. Your listing is pinned to the top of the Jobs
            &amp; Internships board.
          </p>
          <Link
            href={`/posts/${postId}`}
            className="rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            View your listing
          </Link>
        </>
      ) : failed ? (
        <>
          <h1 className="font-display mb-2 text-[1.5rem] font-medium text-foreground">
            We&rsquo;re still confirming your payment
          </h1>
          <p className="mb-6 max-w-md text-[0.9rem] text-muted-foreground">
            It usually takes a moment. Refresh this page in a minute — if your
            listing still doesn&rsquo;t appear, email{" "}
            <span className="text-foreground">team@hospograd.app</span> with
            your session reference.
          </p>
          <a
            href={`/post-job/success?session_id=${encodeURIComponent(sessionId ?? "")}`}
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