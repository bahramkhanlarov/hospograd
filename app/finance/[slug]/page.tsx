import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import type { Metadata } from "next";
import { FINANCE_GUIDES } from "@/lib/finance-guides";
import { AffiliateDisclosure } from "@/components/affiliate/affiliate-disclosure";
import {
  AFFILIATE_PROGRAMS,
  affiliateUrl,
} from "@/lib/affiliates";

// Finance guide detail pages — hero, an answer-first takeaway, an intro
// paragraph, structured sections with verified figures, a cited-sources
// block, a forum link into the money-taxes category, and a link to the other
// guides. Mirror of the /medical/[slug] structure. No photography per guide,
// so the hero uses the site's pine design colour.
//
// SEO: each guide gets its own title/description via generateMetadata (the
// root layout only ships a generic site title), plus Article JSON-LD so the
// guide can surface as a rich result for "how Swiss salary deductions work"
// style queries.

export const dynamic = "force-dynamic";

const SITE = "https://hospograd-web.bahram-khanlarov.workers.dev";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = FINANCE_GUIDES[slug];
  if (!guide) return { title: "Finance guide not found | HospoGrad" };
  return {
    title: `${guide.name} | HospoGrad`,
    description: guide.description,
    alternates: { canonical: `${SITE}/finance/${slug}` },
    openGraph: {
      title: `${guide.name} | HospoGrad`,
      description: guide.description,
      url: `${SITE}/finance/${slug}`,
      type: "article",
      siteName: "HospoGrad",
    },
  };
}

export default async function FinanceGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = FINANCE_GUIDES[slug];
  if (!guide) return <NotFound />;

  const otherGuides = Object.entries(FINANCE_GUIDES).filter(([s]) => s !== slug);

  const relatedPrograms = (guide.affiliateSlugs ?? [])
    .map((s) => AFFILIATE_PROGRAMS.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.name,
    description: guide.description,
    author: { "@type": "Organization", name: "HospoGrad" },
    publisher: { "@type": "Organization", name: "HospoGrad" },
    mainEntityOfPage: `${SITE}/finance/${slug}`,
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Finance", href: "/finance" },
          { label: guide.name },
        ]}
      />
      <div className="flex-1">
        {/* Hero */}
        <div className="relative flex h-[320px] items-end overflow-hidden bg-[oklch(35%_0.04_155)]">
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.85)] via-[oklch(20%_0.02_155/0.3)] to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-8">
            <h1 className="font-display max-w-xl text-[2rem] font-medium leading-[1.1] text-white text-balance">
              {guide.name}
            </h1>
            <p className="mt-1.5 max-w-xl text-[0.9rem] text-white/85">{guide.intro}</p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl px-5 py-10">
          {/* Answer-first takeaway */}
          <div className="mb-10 rounded-md border border-primary/30 bg-primary/5 p-4">
            <h2 className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-primary">
              The short answer
            </h2>
            <p className="text-[0.9rem] leading-relaxed text-foreground">
              {guide.keyTakeaway}
            </p>
          </div>

          {/* Intro */}
          <p className="mb-10 max-w-2xl text-[0.95rem] leading-relaxed text-foreground">
            {guide.description}
          </p>

          {/* Guide sections */}
          {guide.sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="font-display mb-2 text-[1.15rem] font-medium text-foreground">
                {section.heading}
              </h2>
              <p className="max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}

          {/* Cited sources */}
          <section className="mb-10">
            <h2 className="font-display mb-3 text-[1.15rem] font-medium text-foreground">
              Sources & further reading
            </h2>
            <ul className="space-y-2">
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <Link
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.85rem] text-link transition-colors hover:text-primary"
                  >
                    {source.label} &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Tools we recommend (affiliate links) */}
          {relatedPrograms.length > 0 ? (
            <section className="mb-10">
              <h2 className="font-display mb-3 text-[1.15rem] font-medium text-foreground">
                Tools we recommend
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedPrograms.map((program) => (
                  <div
                    key={program.slug}
                    className="flex flex-col rounded-md border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <h3 className="text-[0.95rem] font-semibold text-foreground">
                        {program.name}
                      </h3>
                      {program.note ? (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-medium text-primary">
                          {program.note}
                        </span>
                      ) : null}
                    </div>
                    <p className="mb-4 flex-1 text-[0.82rem] leading-relaxed text-muted-foreground">
                      {program.description}
                    </p>
                    <Link
                      href={affiliateUrl(program)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-sm border border-border px-3 py-1.5 text-center text-[0.78rem] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Visit {program.name}
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <AffiliateDisclosure />
              </div>
            </section>
          ) : null}

          {/* Community CTA, not a lead-gen form */}
          <section className="mt-10 rounded-md border border-border bg-secondary p-5">
            <h2 className="font-display mb-1.5 text-[1.05rem] font-medium text-foreground">
              Still figuring out Swiss money?
            </h2>
            <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
              Ask the community about salaries, taxes, insurance and banking in
              Switzerland, or share what you&rsquo;ve learned from your own
              first payslips.
            </p>
            <Link
              href="/category/money-taxes"
              className="inline-block rounded-full border border-primary px-4 py-1.5 text-[0.78rem] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Discuss on the forum
            </Link>
          </section>

          {/* Other guides */}
          <section className="mt-14">
            <h2 className="font-display mb-4 text-[1.15rem] font-medium text-foreground">
              Other finance guides
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {otherGuides.map(([otherSlug, other]) => (
                <Link
                  key={otherSlug}
                  href={`/finance/${otherSlug}`}
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
      <Breadcrumb items={[{ label: "Finance" }]} />
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-muted-foreground">Guide not found.</p>
      </div>
    </>
  );
}