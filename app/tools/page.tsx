import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { AffiliateDisclosure } from "@/components/affiliate/affiliate-disclosure";
import {
  AFFILIATE_PROGRAMS,
  AFFILIATE_CATEGORY_LABELS,
  affiliateUrl,
  type AffiliateCategory,
} from "@/lib/affiliates";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER: readonly AffiliateCategory[] = [
  "banking",
  "insurance",
  "investing",
  "budgeting",
];

export default function ToolsPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Tools" },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display mb-3 text-[2rem] font-normal leading-tight tracking-[-0.02em] text-foreground">
            Tools we use &amp; recommend
          </h1>
          <p className="max-w-3xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Banking, insurance, budgeting and investing tools that actually
            work for students and recent graduates in Switzerland. Every one
            of these is something we use or would recommend to a friend —
            and if you sign up through our links, a small commission helps
            keep this community running.
          </p>
        </div>

        {CATEGORY_ORDER.map((category) => {
          const programs = AFFILIATE_PROGRAMS.filter(
            (p) => p.category === category,
          );
          return (
            <section key={category} className="mb-10">
              <h2 className="font-display mb-4 text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
                {AFFILIATE_CATEGORY_LABELS[category]}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
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
            </section>
          );
        })}

        <AffiliateDisclosure />
      </div>
    </>
  );
}