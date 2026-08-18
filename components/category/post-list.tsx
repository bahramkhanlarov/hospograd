"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Breadcrumb } from "@/components/layout/breadcrumb";

interface PostRow {
  id: string;
  title: string;
  score: number;
  created_at: number;
  username: string;
  school: string;
  status: string;
  comment_count: number;
  featured?: number;
  featured_until?: number | null;
}

interface Category {
  slug: string;
  name: string;
}

export function CategoryPostList({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") === "top" ? "top" : "new";
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // Fetch the category name for the breadcrumb
  useEffect(() => {
    let cancelled = false;
    apiGet<{ categories: Category[] }>("/api/categories")
      .then((data) => {
        if (!cancelled) {
          const cat = data.categories.find((c) => c.slug === slug);
          if (cat) setCategoryName(cat.name);
        }
      })
      .catch(() => {
        /* fall back to slug in breadcrumb */
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Fetch posts for this category
  useEffect(() => {
    setLoading(true);
    apiGet<{ posts: PostRow[] }>(
      `/api/categories/${encodeURIComponent(slug)}/posts?sort=${sort}`,
    )
      .then((data) => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [slug, sort]);

  function formatTimestamp(ms: number) {
    if (!ms) return "—";
    return new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function isFeatured(p: PostRow) {
    return (
      p.featured === 1 &&
      (p.featured_until ?? 0) > Date.now()
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/index.html" },
          { label: categoryName ?? slug },
        ]}
      />
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <a
          href={`/category/${encodeURIComponent(slug)}?sort=new`}
          className={`inline-block rounded-sm border px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold ${
            sort === "new"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-transparent text-foreground hover:bg-card-hover"
          }`}
        >
          New
        </a>
        <a
          href={`/category/${encodeURIComponent(slug)}?sort=top`}
          className={`inline-block rounded-sm border px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold ${
            sort === "top"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-transparent text-foreground hover:bg-card-hover"
          }`}
        >
          Top
        </a>
        {slug === "jobs-internships" ? (
          <a
            href="/post-job"
            className="ml-auto inline-block rounded-sm border border-primary bg-primary px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            + Post a job
          </a>
        ) : null}
      </div>

      {loading ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-md border border-border bg-card text-[0.85rem] shadow-sm">
            <tbody>
              <tr>
                <td className="px-4 py-8 text-center italic text-muted-foreground">
                  Loading…
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : posts.length === 0 ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-md border border-border bg-card text-[0.85rem] shadow-sm">
            <tbody>
              <tr>
                <td className="px-4 py-8 text-center italic text-muted-foreground">
                  No posts yet in this category.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-md border border-border bg-card text-[0.85rem] shadow-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-[0.75rem] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">Post</th>
                <th className="px-4 py-2 text-right">Score</th>
                <th className="px-4 py-2 text-right">Comments</th>
                <th className="px-4 py-2 text-right">Posted</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-card-hover"
                >
                  <td className="px-4 py-3">
                    <a
                      href={`/posts/${p.id}`}
                      className="font-medium text-link hover:underline"
                    >
                      {p.title}
                    </a>
                    {isFeatured(p) ? (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-primary">
                        Featured
                      </span>
                    ) : null}
                    <div className="mt-0.5 text-[0.75rem] text-muted-foreground">
                      by{" "}
                      <a
                        href={`/profile/${encodeURIComponent(p.username)}`}
                        className="text-muted-foreground hover:text-link"
                      >
                        {p.username}
                      </a>{" "}
                      &middot; {p.school} &middot; {p.status}
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