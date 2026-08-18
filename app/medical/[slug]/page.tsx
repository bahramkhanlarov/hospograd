import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { SPECIALTIES } from "@/lib/specialties";
import { CLINICS } from "@/lib/clinics";

// Medical specialty detail pages — mirror /clinics/[slug]: breadcrumb,
// description, a "where to get treated" grid of clinics that cover this
// specialty, and a forum CTA. No photography per specialty, so the hero
// uses the site's pine design colour.

export const dynamic = "force-dynamic";

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const specialty = SPECIALTIES[slug];
  if (!specialty) return <NotFound />;

  const clinics = specialty.clinics
    .map((s) => ({ slug: s, clinic: CLINICS[s] }))
    .filter((entry): entry is { slug: string; clinic: (typeof CLINICS)[string] } => Boolean(entry.clinic));
  const otherSpecialties = Object.entries(SPECIALTIES).filter(([s]) => s !== slug);

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Medical", href: "/medical" },
          { label: specialty.name },
        ]}
      />
      <div className="flex-1">
        {/* Hero */}
        <div className="relative flex h-[320px] items-end overflow-hidden bg-[oklch(35%_0.04_155)]">
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.85)] via-[oklch(20%_0.02_155/0.3)] to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-8">
            <h1 className="font-display max-w-xl text-[2rem] font-medium leading-[1.1] text-white text-balance">
              {specialty.name}
            </h1>
            <p className="mt-1.5 max-w-xl text-[0.9rem] text-white/85">{specialty.intro}</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-5 py-10">
          {/* About the specialty */}
          <section className="mb-10">
            <h2 className="font-display mb-2 text-[1.15rem] font-medium text-foreground">
              About this specialty
            </h2>
            <p className="max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              {specialty.description}
            </p>
          </section>

          {/* Where to get treated */}
          <section className="mb-10">
            <h2 className="font-display mb-1.5 text-[1.15rem] font-medium text-foreground">
              Where to get treated in Switzerland
            </h2>
            <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
              The clinics below cover this specialty. Contact a clinic directly
              to ask about departments, referrals and pricing.
            </p>
            {clinics.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {clinics.map(({ slug: clinicSlug, clinic }) => (
                  <Link
                    key={clinicSlug}
                    href={`/clinics/${clinicSlug}`}
                    className="group block overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={clinic.img}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-[0.82rem] font-semibold leading-snug text-foreground group-hover:text-primary">
                        {clinic.name}
                      </h3>
                      <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                        {clinic.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[0.85rem] text-muted-foreground">
                No listed clinics currently cover this specialty. Contact a
                Swiss hospital or clinic directly for a referral.
              </p>
            )}
          </section>

          {/* Community CTA, not a lead-gen form */}
          <section className="mt-10 rounded-md border border-border bg-secondary p-5">
            <h2 className="font-display mb-1.5 text-[1.05rem] font-medium text-foreground">
              Looking for treatment in Switzerland?
            </h2>
            <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
              Ask the community about clinics, referrals and healthcare in
              Switzerland, or share your own experience.
            </p>
            <Link
              href="/category/general"
              className="inline-block rounded-full border border-primary px-4 py-1.5 text-[0.78rem] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Discuss on the forum
            </Link>
          </section>

          {/* Other specialties */}
          <section className="mt-14">
            <h2 className="font-display mb-4 text-[1.15rem] font-medium text-foreground">
              Other medical specialties
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {otherSpecialties.map(([otherSlug, other]) => (
                <Link
                  key={otherSlug}
                  href={`/medical/${otherSlug}`}
                  className="rounded-sm border border-border px-3 py-2 text-[0.82rem] text-link transition-colors hover:border-primary/50 hover:bg-card-hover"
                >
                  {other.name} &rarr;
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function NotFound() {
  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Medical" }]} />
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-muted-foreground">Specialty not found.</p>
      </div>
    </>
  );
}