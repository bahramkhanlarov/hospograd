// Reusable affiliate program grid used by section landing pages (careers,
// education, insurance) to render "tools we recommend" callouts. The /tools
// page renders the same data full-width via AFFILIATE_PROGRAMS directly.

import Link from "next/link";
import {
  AFFILIATE_PROGRAMS,
  affiliateUrl,
  type AffiliateProgram,
} from "@/lib/affiliates";

export function AffiliateProgramGrid({
  slugs,
  title,
}: {
  slugs: readonly string[];
  title: string;
}) {
  const programs = slugs
    .map((s) => AFFILIATE_PROGRAMS.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (programs.length === 0) return null;

  return (
    <section className="mt-10 rounded-md border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <AffiliateProgramCard key={program.slug} program={program} />
        ))}
      </div>
    </section>
  );
}

export function AffiliateProgramCard({ program }: { program: AffiliateProgram }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-background p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="text-[0.92rem] font-semibold text-foreground">
          {program.name}
        </h3>
        {program.note ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-medium text-primary">
            {program.note}
          </span>
        ) : null}
      </div>
      <p className="mb-4 flex-1 text-[0.8rem] leading-relaxed text-muted-foreground">
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
  );
}