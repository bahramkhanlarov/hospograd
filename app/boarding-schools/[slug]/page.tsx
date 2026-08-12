import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { BOARDING_SCHOOLS } from "@/lib/boarding-schools";

// Boarding school detail pages — same structure as /camps/[slug]: hero
// photo, quick facts, overview, curriculum, fees, and a forum link instead
// of an agency lead-gen block.

export const dynamic = "force-dynamic";

export default async function BoardingSchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = BOARDING_SCHOOLS[slug];
  if (!school) return <NotFound />;

  const otherSchools = Object.entries(BOARDING_SCHOOLS).filter(([s]) => s !== slug);

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Education", href: "/education#boarding-schools" },
          { label: school.name },
        ]}
      />
      <div className="flex-1">
        {/* Hero */}
        <div className="relative flex h-[320px] items-end overflow-hidden">
          <img
            src={school.img}
            alt={`${school.name} campus`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.85)] via-[oklch(20%_0.02_155/0.3)] to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-8">
            <h1 className="font-display max-w-xl text-[2rem] font-medium leading-[1.1] text-white text-balance">
              {school.name}
            </h1>
            <p className="mt-1.5 text-[0.9rem] text-white/85">{school.location}</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-5 py-10">
          <p className="mb-8 max-w-2xl text-[0.95rem] leading-relaxed text-foreground">
            {school.intro}
          </p>

          {/* Quick facts */}
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {school.founded ? <Fact label="Founded" value={school.founded} /> : null}
            {school.ages ? <Fact label="Ages" value={school.ages} /> : null}
            <Fact label="Fees" value={school.fees} />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <h2 className="font-display mb-2 text-[1.15rem] font-medium text-foreground">
                Highlights
              </h2>
              <ul className="space-y-1.5 text-[0.85rem] leading-relaxed text-muted-foreground">
                {school.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-primary">·</span>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-display mb-2 text-[1.15rem] font-medium text-foreground">
                Curriculum
              </h2>
              <div className="flex flex-wrap gap-2">
                {school.curriculum.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-[0.75rem] font-medium text-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Community CTA, not a lead-gen form */}
          <section className="mt-10 rounded-md border border-border bg-secondary p-5">
            <h2 className="font-display mb-1.5 text-[1.05rem] font-medium text-foreground">
              A student here, or thinking about applying?
            </h2>
            <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
              Ask the community, or read what other students have said about
              Swiss boarding schools.
            </p>
            <Link
              href="/category/school-life"
              className="inline-block rounded-full border border-primary px-4 py-1.5 text-[0.78rem] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Discuss on the forum
            </Link>
          </section>

          {/* Other schools */}
          <section className="mt-14">
            <h2 className="font-display mb-4 text-[1.15rem] font-medium text-foreground">
              Other Swiss boarding schools
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {otherSchools.map(([otherSlug, otherSchool]) => (
                <Link
                  key={otherSlug}
                  href={`/boarding-schools/${otherSlug}`}
                  className="group block overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={otherSchool.img}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-[0.82rem] font-semibold leading-snug text-foreground group-hover:text-primary">
                      {otherSchool.name}
                    </h3>
                    <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                      {otherSchool.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-[0.85rem] font-medium text-foreground">{value}</p>
    </div>
  );
}

function NotFound() {
  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Boarding Schools" }]} />
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-muted-foreground">School not found.</p>
      </div>
    </>
  );
}
