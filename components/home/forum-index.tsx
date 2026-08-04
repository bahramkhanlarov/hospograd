"use client";

// React port of public/js/home.js's renderForumIndex (lines 23-47), including
// the CATEGORY_ICONS map (lines 9-17), categoryIcon() fallback (lines 19-21),
// and formatTimestamp() (lines 4-7). JSX escapes text content by default, so
// no escapeHtml() port is needed here.

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Category {
  slug: string;
  name: string;
  description: string | null;
  post_count: number;
  last_post_at: number | null;
}

// Ported verbatim from public/js/home.js lines 9-17.
const CATEGORY_ICONS: Record<string, string> = {
  accommodation: "🏠",
  "health-insurance": "🩺",
  "visa-legal": "📋",
  "jobs-internships": "💼",
  "money-taxes": "💰",
  "school-life": "🎓",
  general: "💬",
};

function categoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || "📌";
}

function formatTimestamp(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ForumIndex() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ categories: Category[] }>("/api/categories")
      .then((data) => {
        if (!cancelled) setCategories(data.categories);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mb-5 w-full overflow-x-auto">
      <table className="w-full border-collapse overflow-hidden rounded-md border border-border bg-card text-[0.85rem] shadow-sm">
        <thead>
          <tr>
            <th className="border-b border-border bg-background px-3 py-[0.55rem] text-left text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Category
            </th>
            <th className="border-b border-border bg-background px-3 py-[0.55rem] text-right text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Threads
            </th>
            <th className="border-b border-border bg-background px-3 py-[0.55rem] text-right text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Latest thread
            </th>
          </tr>
        </thead>
        <tbody>
          {error ? (
            <tr>
              <td
                colSpan={3}
                className="px-4 py-8 text-center italic text-muted-foreground"
              >
                Couldn&rsquo;t load categories.
              </td>
            </tr>
          ) : categories === null ? (
            <tr>
              <td
                colSpan={3}
                className="px-4 py-8 text-center italic text-muted-foreground"
              >
                Loading…
              </td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-4 py-8 text-center italic text-muted-foreground"
              >
                No categories yet.
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr key={c.slug} className="last:[&>td]:border-b-0 hover:[&>td]:bg-card-hover">
                <td className="border-b border-border px-3 py-[0.6rem] align-top font-semibold">
                  <a
                    href={`/category.html?slug=${encodeURIComponent(c.slug)}`}
                    className="text-foreground"
                  >
                    <span aria-hidden="true">{categoryIcon(c.slug)}</span> {c.name}
                  </a>
                  <div className="mt-[0.1rem] text-[0.8rem] text-muted-foreground">
                    {c.description || ""}
                  </div>
                </td>
                <td className="whitespace-nowrap border-b border-border px-3 py-[0.6rem] text-right align-top [font-variant-numeric:tabular-nums]">
                  {c.post_count}
                </td>
                <td className="whitespace-nowrap border-b border-border px-3 py-[0.6rem] text-right align-top [font-variant-numeric:tabular-nums]">
                  {formatTimestamp(c.last_post_at)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
