import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SchoolPosts } from "./school-posts";
import { HOSPITALITY_SCHOOLS } from "@/lib/hospitality-schools";

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
      {/* Hero */}
      <div className="relative flex h-[280px] items-end overflow-hidden">
        <img
          src={info.img}
          alt={`${info.name} campus`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.85)] via-[oklch(20%_0.02_155/0.3)] to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-7">
          <h1 className="font-display max-w-xl text-[1.9rem] font-medium leading-[1.1] text-white text-balance">
            {info.short}
          </h1>
          <p className="mt-1.5 text-[0.85rem] text-white/85">{info.location}</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
          {info.desc}
        </p>
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