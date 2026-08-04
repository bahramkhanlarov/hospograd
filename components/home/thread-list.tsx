"use client";

// React port of public/js/home.js's renderPostList (lines 49-74), sort-toggle
// wiring (updateSortToggle, lines 76-79; loadFeed, lines 86-92), and
// formatTimestamp (lines 4-7). Sort is read from the `sort` URL search param
// via useSearchParams — the parent (app/page.tsx) wraps this component in a
// <Suspense> boundary, which the App Router requires for any component that
// calls useSearchParams during a static render.

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Post {
  id: number;
  title: string;
  username: string;
  school: string;
  status: string;
  comment_count: number;
  score: number;
  created_at: number | null;
}

function formatTimestamp(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const sortBtnClass =
  "inline-block rounded-sm border border-border bg-transparent px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/10";
const sortBtnActiveClass =
  "border-primary bg-primary text-white hover:bg-primary-hover";

export function ThreadList() {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") === "top" ? "top" : "new";
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPosts(null);
    setError(false);
    apiGet<{ posts: Post[] }>(`/api/posts?sort=${sort}`)
      .then((data) => {
        if (!cancelled) setPosts(data.posts);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sort]);

  return (
    <>
      <div className="mb-2 flex gap-2">
        <Link
          href="?sort=new"
          id="sort-new"
          className={cn(sortBtnClass, sort === "new" && sortBtnActiveClass)}
        >
          New
        </Link>
        <Link
          href="?sort=top"
          id="sort-top"
          className={cn(sortBtnClass, sort === "top" && sortBtnActiveClass)}
        >
          Top
        </Link>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden rounded-md border border-border bg-card text-[0.85rem] shadow-sm">
          <thead>
            <tr>
              <th className="border-b border-border bg-background px-3 py-[0.55rem] text-left text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Thread
              </th>
              <th className="border-b border-border bg-background px-3 py-[0.55rem] text-right text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Replies
              </th>
              <th className="border-b border-border bg-background px-3 py-[0.55rem] text-right text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Votes
              </th>
              <th className="border-b border-border bg-background px-3 py-[0.55rem] text-right text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Started
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center italic text-muted-foreground"
                >
                  Couldn&rsquo;t load posts.
                </td>
              </tr>
            ) : posts === null ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center italic text-muted-foreground"
                >
                  Loading…
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center italic text-muted-foreground"
                >
                  No posts yet. Be the first to post!
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="last:[&>td]:border-b-0 hover:[&>td]:bg-card-hover">
                  <td className="border-b border-border px-3 py-[0.6rem] align-top font-semibold">
                    <a href={`/post.html?id=${encodeURIComponent(p.id)}`} className="text-foreground">
                      {p.title}
                    </a>
                    <div className="mt-[0.1rem] text-[0.78rem] text-muted-foreground">
                      u/{p.username} &middot; {p.school} &middot; {p.status}
                    </div>
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-3 py-[0.6rem] text-right align-top text-muted-foreground [font-variant-numeric:tabular-nums]">
                    {p.comment_count}
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-3 py-[0.6rem] text-right align-top text-muted-foreground [font-variant-numeric:tabular-nums]">
                    {p.score}
                  </td>
                  <td className="whitespace-nowrap border-b border-border px-3 py-[0.6rem] text-right align-top text-muted-foreground [font-variant-numeric:tabular-nums]">
                    {formatTimestamp(p.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
