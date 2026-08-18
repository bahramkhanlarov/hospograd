// Homepage landing. Composes the shared Nav, a photo hero with primary CTAs,
// the school-logo strip as a trust bar, the four section tiles, a compact
// "popular in the community" strip, and the forum category / thread tables.
// The interactive globe that used to sit below the intro is deliberately
// dropped from the homepage: it was decorative and pushed the real content
// below the fold.

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Hero } from "@/components/home/hero";
import { SchoolBanner } from "@/components/home/school-banner";
import { SectionTiles } from "@/components/home/section-tiles";
import { PopularThreads } from "@/components/home/popular-threads";
import { ForumIndex } from "@/components/home/forum-index";
import { ThreadList } from "@/components/home/thread-list";

// Opt out of static prerendering. This app has no incremental cache
// configured yet (see open-next.config.ts) — a statically prerendered page
// gets an `s-maxage=31536000` (1 year) Cache-Control header with no
// invalidation mechanism, so edits can appear to "not deploy" at some
// Cloudflare edge nodes for up to a year. All real data on this page is
// fetched client-side anyway, so static prerendering buys little.
// Revisit once the incremental cache is wired up (sub-project 5).
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <SchoolBanner />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        <SectionTiles />

        <div className="mb-10 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display mb-3 text-[1.6rem] font-medium text-foreground">
            Browse the boards
          </h2>
          <ForumIndex />
        </div>

        <PopularThreads />

        <Suspense fallback={<ThreadListFallback />}>
          <ThreadList />
        </Suspense>
      </div>
    </>
  );
}

// Static shell rendered while ThreadList's useSearchParams-dependent content
// streams in — keeps the sort toggle and table visible in the initial HTML
// instead of an empty gap (Suspense with no fallback renders nothing until
// hydration for components that read the URL search params).
function ThreadListFallback() {
  return (
    <>
      <div className="mb-2 flex gap-2">
        <span className="inline-block rounded-full border border-border bg-transparent px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold text-foreground">
          New
        </span>
        <span className="inline-block rounded-full border border-border bg-transparent px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold text-foreground">
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