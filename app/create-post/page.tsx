"use client";

// React port of public/create-post.html + public/js/create-post.js.
// On mount: GET /api/auth/me (redirect to /login if unauthenticated),
// then GET /api/categories for the dropdown. On submit: POST /api/posts
// with {categoryId, title, body}, redirect to /posts/:id on success.
// Errors are displayed inline below the form fields.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { apiGet, apiPost } from "@/lib/api";

interface Category {
  id: number;
  name: string;
}

interface FormState {
  categoryId: string;
  title: string;
  body: string;
}

export default function CreatePost() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>({
    categoryId: "",
    title: "",
    body: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Mount: check auth, fetch categories ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Auth gate
      try {
        await apiGet("/api/auth/me");
      } catch {
        if (!cancelled) {
          router.replace("/login");
          return;
        }
      }

      // 2. Load categories
      try {
        const data = await apiGet<{ categories: Category[] }>(
          "/api/categories",
        );
        if (!cancelled) {
          setCategories(data.categories);
          // Pre-select the first category
          if (data.categories.length > 0) {
            setForm((prev) => ({
              ...prev,
              categoryId: String(data.categories[0].id),
            }));
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load categories.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ── Submit handler ───────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);

      try {
        const result = await apiPost<{ post: { id: number } }>(
          "/api/posts",
          {
            categoryId: parseInt(form.categoryId, 10),
            title: form.title,
            body: form.body,
          },
        );
        router.push(`/posts/${result.post.id}`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setSubmitting(false);
      }
    },
    [form, router],
  );

  // ── Generic change handler (uses field `id` as state key) ────────────
  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // ── Render ───────────────────────────────────────────────────────────
  // Show nothing while auth is being checked (prevents flash of form
  // before the redirect fires).
  if (loading) return null;

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "New post" },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-4">
        <div className="rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Create a post
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Category ────────────────────────────────────────────── */}
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
              >
                Category
              </label>
              <select
                id="category"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Title ───────────────────────────────────────────────── */}
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
              >
                Title
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

            {/* ── Body ────────────────────────────────────────────────── */}
            <div>
              <label
                htmlFor="body"
                className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
              >
                Body
              </label>
              <textarea
                id="body"
                value={form.body}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-sm border border-border bg-card px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
            </div>

            {/* ── Inline error ────────────────────────────────────────── */}
            {error && (
              <p className="text-[0.82rem] text-red-500">{error}</p>
            )}

            {/* ── Submit ──────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Posting\u2026" : "Post"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}