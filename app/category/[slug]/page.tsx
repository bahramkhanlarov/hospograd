// Next.js port of the vanilla category page (public/category.html + public/js/category.js).
// Server component reads params.slug, renders the Nav, then delegates the
// data-fetching table, sort toggle, and breadcrumb to a client sub-component
// (which can resolve the category name from /api/categories).

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { CategoryPostList } from "@/components/category/post-list";

// Opt out of static prerendering (same reasoning as app/page.tsx — the app has
// no incremental cache configured, so static prerendering gives a 1-year
// Cache-Control with no invalidation mechanism for edge nodes).
export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <Nav />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-4">
        <Suspense fallback={<CategoryPostListFallback />}>
          <CategoryPostList slug={slug} />
        </Suspense>
      </div>
    </>
  );
}

// Static shell rendered while CategoryPostList's useSearchParams-dependent
// content streams in — keeps the sort toggle and table visible in the initial
// HTML instead of displaying an empty gap.
function CategoryPostListFallback() {
  return (
    <>
      <div className="mb-2 flex gap-2">
        <span className="inline-block rounded-sm border border-border bg-transparent px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold text-foreground">
          New
        </span>
        <span className="inline-block rounded-sm border border-border bg-transparent px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold text-foreground">
          Top
        </span>
      </div>
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
    </>
  );
}