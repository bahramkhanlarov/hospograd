import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SchoolPosts } from "./school-posts";

export const dynamic = "force-dynamic";

const SCHOOL_INFO: Record<string, { name: string; short: string }> = {
  glion: { name: "Glion Institute of Higher Education", short: "Glion" },
  "les-roches": { name: "Les Roches", short: "Les Roches" },
  ehl: { name: "EHL Hospitality Business School", short: "EHL" },
  shms: { name: "Swiss Hotel Management School", short: "SHMS" },
  "cesar-ritz": { name: "César Ritz Colleges Switzerland", short: "César Ritz" },
  him: { name: "HIM Business School Montreux", short: "HIM" },
  "cornell-sha": { name: "Cornell Nolan School of Hotel Administration", short: "Cornell SHA" },
};

export default async function SchoolPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const info = SCHOOL_INFO[slug];
  if (!info) return <NotFound slug={slug} />;

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: info.short },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <h1 className="font-display mb-1 text-[1.6rem] font-normal tracking-[-0.01em] text-foreground">
          {info.short}
        </h1>
        <p className="mb-6 text-[0.82rem] text-muted-foreground">{info.name}</p>
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