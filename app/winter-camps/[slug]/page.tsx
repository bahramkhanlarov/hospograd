import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { WINTER_CAMPS } from "@/lib/winter-camps";

// Winter camp detail pages — same structure as /camps/[slug] (summer camps):
// hero photo, location/programme/activities breakdown, dates, fees, and a
// forum link instead of an agency lead-gen block.

export const dynamic = "force-dynamic";

export default async function WinterCampPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const camp = WINTER_CAMPS[slug];
  if (!camp) return <NotFound />;

  const otherCamps = Object.entries(WINTER_CAMPS).filter(([s]) => s !== slug);

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Education", href: "/education#winter-camps" },
          { label: camp.name },
        ]}
      />
      <div className="flex-1">
        {/* Hero */}
        <div className="relative flex h-[320px] items-end overflow-hidden">
          <img
            src={camp.heroImg}
            alt={`Campers at ${camp.name}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.85)] via-[oklch(20%_0.02_155/0.3)] to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-8">
            <h1 className="font-display max-w-xl text-[2rem] font-medium leading-[1.1] text-white text-balance">
              {camp.name}
            </h1>
            <p className="mt-1.5 text-[0.9rem] text-white/85">{camp.location}</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-5 py-10">
          <p className="mb-8 max-w-2xl text-[0.95rem] leading-relaxed text-foreground">
            {camp.intro}
          </p>

          {/* Quick facts */}
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Fact label="Ages" value={camp.ages} />
            <Fact label="Duration" value={camp.duration} />
            {camp.dates ? <Fact label="Dates" value={camp.dates} /> : null}
            {camp.founded ? <Fact label="Since" value={camp.founded} /> : null}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <section>
              <h2 className="font-display mb-2 text-[1.15rem] font-medium text-foreground">
                Location
              </h2>
              <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
                {camp.locationDesc}
              </p>
            </section>
            <section>
              <h2 className="font-display mb-2 text-[1.15rem] font-medium text-foreground">
                Winter programme
              </h2>
              <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
                {camp.programmeDesc}
              </p>
            </section>
          </div>

          {/* Activities */}
          <section className="mt-10">
            <h2 className="font-display mb-4 text-[1.15rem] font-medium text-foreground">
              Activities
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {camp.activities.map((group) => (
                <div
                  key={group.category}
                  className="rounded-md border border-border bg-card p-4"
                >
                  <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-primary">
                    {group.category}
                  </p>
                  <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
                    {group.items.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Fees */}
          <section className="mt-10 rounded-md border border-border bg-card p-5">
            <p className="mb-1 text-[0.72rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Fees
            </p>
            <p className="text-[0.88rem] text-foreground">{camp.fees}</p>
          </section>

          {/* Community CTA, not a lead-gen form */}
          <section className="mt-10 rounded-md border border-border bg-secondary p-5">
            <h2 className="font-display mb-1.5 text-[1.05rem] font-medium text-foreground">
              Been to this camp, or thinking about it?
            </h2>
            <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
              Ask the community, or read what other students have said about
              Swiss winter camps.
            </p>
            <Link
              href="/category/general"
              className="inline-block rounded-full border border-primary px-4 py-1.5 text-[0.78rem] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Discuss on the forum
            </Link>
          </section>

          {/* Other camps */}
          <section className="mt-14">
            <h2 className="font-display mb-4 text-[1.15rem] font-medium text-foreground">
              Other Swiss winter camps
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {otherCamps.map(([otherSlug, otherCamp]) => (
                <Link
                  key={otherSlug}
                  href={`/winter-camps/${otherSlug}`}
                  className="group block overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={otherCamp.cardImg}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-[0.82rem] font-semibold leading-snug text-foreground group-hover:text-primary">
                      {otherCamp.name}
                    </h3>
                    <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                      {otherCamp.location}
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
      <Breadcrumb items={[{ label: "Winter Camps" }]} />
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-muted-foreground">Camp not found.</p>
      </div>
    </>
  );
}
