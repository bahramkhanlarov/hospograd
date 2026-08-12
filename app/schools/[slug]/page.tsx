import { Suspense } from "react";
import Link from "next/link";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SchoolPosts } from "./school-posts";
import { HOSPITALITY_SCHOOLS } from "@/lib/hospitality-schools";

// Forum listing for a school — posts tagged to it. The photo/campus/programs
// brochure content lives at /hospitality-schools/[slug]; this page just
// links there rather than duplicating the hero.

export const dynamic = "force-dynamic";

export default async function SchoolPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const info = HOSPITALITY_SCHOOLS[slug];
  if (!info) return <NotFound slug={slug} />;

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Education", href: "/education#hospitality-schools" },
          { label: info.short },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <h1 className="font-display mb-1 text-[1.6rem] font-normal tracking-[-0.01em] text-foreground">
          {info.short}
        </h1>
        <p className="mb-1 text-[0.82rem] text-muted-foreground">{info.name}</p>
        <Link
          href={`/hospitality-schools/${slug}`}
          className="mb-6 inline-block text-[0.8rem] font-medium text-link hover:underline"
        >
          View school profile →
        </Link>
        <Suspense fallback={<p className="italic text-muted-foreground">Loading posts…</p>}>
          <SchoolPosts slug={slug} schoolName={info.short} />
        </Suspense>
      </div>
    </>
  );
}

function NotFound({ slug }: { slug: string }) {
  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Schools" }]} />
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-muted-foreground">School &ldquo;{slug}&rdquo; not found.</p>
      </div>
    </>
  );
}