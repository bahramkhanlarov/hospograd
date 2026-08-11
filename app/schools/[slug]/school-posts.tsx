"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";

interface PostRow {
  id: string;
  title: string;
  score: number;
  created_at: number;
  username: string;
  school: string;
  status: string;
  comment_count: number;
  category_id: number;
}

const SUB_TABS = [
  { key: "", label: "All" },
  { key: "accommodation", label: "Housing" },
  { key: "jobs-internships", label: "Jobs" },
  { key: "school-life", label: "School Life" },
  { key: "general", label: "General" },
];

export function SchoolPosts({ slug, schoolName }: { slug: string; schoolName: string }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "";
  const sort = searchParams.get("sort") === "top" ? "top" : "new";
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ school: schoolName, sort });
    if (tab) params.set("categorySlug", tab);
    apiGet<{ posts: PostRow[] }>(`/api/posts?${params.toString()}`)
      .then((data) => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [schoolName, tab, sort]);

  function formatTimestamp(ms: number) {
    if (!ms) return "—";
    return new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <>
      {/* Sub-tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {SUB_TABS.map((t) => {
          const isActive = t.key === tab;
          const href = t.key
            ? `/schools/${slug}?tab=${t.key}&sort=${sort}`
            : `/schools/${slug}?sort=${sort}`;
          return (
            <Link
              key={t.key}
              href={href}
              className={`inline-block rounded-sm border px-3 py-1 text-[0.8rem] font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Sort toggle */}
      <div className="mb-3 flex gap-2">
        <Link
          href={`/schools/${slug}${tab ? `?tab=${tab}&sort=new` : "?sort=new"}`}
          className={`inline-block rounded-sm border px-3 py-1 text-[0.78rem] font-semibold ${
            sort === "new"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50"
          }`}
        >
          New
        </Link>
        <Link
          href={`/schools/${slug}${tab ? `?tab=${tab}&sort=top` : "?sort=top"}`}
          className={`inline-block rounded-sm border px-3 py-1 text-[0.78rem] font-semibold ${
            sort === "top"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50"
          }`}
        >
          Top
        </Link>
      </div>

      {/* Posts table */}
      {loading ? (
        <p className="italic text-muted-foreground">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="italic text-muted-foreground">
          No posts from {schoolName} yet.
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-md border border-border bg-card text-[0.85rem] shadow-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-[0.72rem] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Post</th>
                <th className="px-4 py-2.5 text-right">Score</th>
                <th className="px-4 py-2.5 text-right">Comments</th>
                <th className="px-4 py-2.5 text-right">Posted</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-card-hover"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/posts/${p.id}`}
                      className="font-medium text-link hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-0.5 text-[0.75rem] text-muted-foreground">
                      by{" "}
                      <Link
                        href={`/profile/${encodeURIComponent(p.username)}`}
                        className="text-muted-foreground hover:text-link"
                      >
                        {p.username}
                      </Link>{" "}
                      &middot; {p.status}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {p.score}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {p.comment_count}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatTimestamp(p.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}