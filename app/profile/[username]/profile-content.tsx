"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────

interface ProfileUser {
  username: string;
  school: string;
  status: string;
  verification_state: string;
  created_at: number;
}

interface ProfilePost {
  id: string;
  title: string;
  score: number;
  created_at: number;
  category_id: number;
}

interface ProfileData {
  user: ProfileUser;
  posts: ProfilePost[];
  postsCursor: string | null;
  comments: unknown[];
}

// ── Helpers ────────────────────────────────────────────────────────

function formatMemberSince(epochSecs: number): string {
  const d = new Date(epochSecs * 1000);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function VerificationBadge({ state }: { state: string }) {
  const label = state === "verified" ? "Verified" : state === "pending" ? "Pending" : null;
  if (!label) return null;

  const colors =
    state === "verified"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ring-1 ring-inset ${colors}`}
    >
      {state === "verified" && (
        <svg
          className="-ml-0.5 mr-1 size-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {label}
    </span>
  );
}

function PostLink({ post }: { post: ProfilePost }) {
  return (
    <a
      href={`/posts/${encodeURIComponent(post.id)}`}
      className="block rounded-md border border-border bg-card px-4 py-3 text-[0.85rem] text-foreground transition-colors hover:border-link hover:text-link"
    >
      {post.title}
    </a>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function ProfileContent({ username }: { username: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiGet<ProfileData>(`/api/users/${encodeURIComponent(username)}`)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (error) {
    return (
      <p className="py-8 text-center text-[0.9rem] italic text-muted-foreground">
        {error}
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="py-8 text-center text-[0.9rem] italic text-muted-foreground">
        Loading…
      </p>
    );
  }

  const { user, posts } = profile;

  return (
    <div className="space-y-6">
      {/* ── Profile header ── */}
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="font-display text-[1.3rem] font-semibold text-foreground">
            u/{user.username}
          </h2>
          <VerificationBadge state={user.verification_state} />
        </div>

        <div className="mt-2 space-y-0.5 text-[0.85rem] text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">School:</span>{" "}
            {user.school}
          </p>
          <p>
            <span className="font-medium text-foreground">Status:</span>{" "}
            {user.status}
          </p>
          <p>
            <span className="font-medium text-foreground">Member since:</span>{" "}
            {formatMemberSince(user.created_at)}
          </p>
        </div>
      </div>

      {/* ── Posts ── */}
      <div>
        <h3 className="mb-3 text-[1rem] font-semibold text-foreground">
          Posts
        </h3>
        {posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post) => (
              <PostLink key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-[0.85rem] italic text-muted-foreground">
            No posts yet.
          </p>
        )}
      </div>
    </div>
  );
}