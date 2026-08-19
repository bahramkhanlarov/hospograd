import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import type { Metadata } from "next";
import { FINANCE_GUIDES } from "@/lib/finance-guides";
import { AffiliateProgramGrid } from "@/components/affiliate/affiliate-program-grid";
import { AffiliateDisclosure } from "@/components/affiliate/affiliate-disclosure";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personal Finance in Switzerland | HospoGrad",
  description:
    "Guides to Swiss money for hospitality students and graduates: first salary, tax at source, health insurance, banking, saving and index investing. Figures verified against official Swiss sources.",
  alternates: {
    canonical: "https://hospograd-web.bahram-khanlarov.workers.dev/finance",
  },
  openGraph: {
    title: "Personal Finance in Switzerland | HospoGrad",
    description:
      "Guides to Swiss money for hospitality students and graduates: first salary, tax at source, health insurance, banking, saving and index investing.",
    url: "https://hospograd-web.bahram-khanlarov.workers.dev/finance",
    type: "website",
    siteName: "HospoGrad",
  },
};

export default function FinancePage() {
  const guides = Object.entries(FINANCE_GUIDES);

  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Finance" },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display mb-3 text-[2rem] font-normal leading-tight tracking-[-0.02em] text-foreground">
            Personal Finance in Switzerland
          </h1>
          <p className="max-w-3xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Straightforward guides to the money questions every hospitality
            student and graduate meets here: first salary, tax at source,
            health insurance, banking, saving and investing. Written for this
            community, with figures verified against official Swiss sources.
          </p>
        </div>

        {/* Guides */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map(([slug, guide]) => (
            <Link
              key={slug}
              href={`/finance/${slug}`}
              className="group rounded-md border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              <h3 className="mb-1 text-[0.95rem] font-semibold text-foreground group-hover:text-primary">
                {guide.name}
              </h3>
              <p className="text-[0.82rem] text-muted-foreground">{guide.intro}</p>
              <span className="mt-3 inline-block text-[0.78rem] font-medium text-primary">
                Read the guide →
              </span>
            </Link>
          ))}
        </div>

        {/* Bank & pillar 3a accounts */}
        <div className="mt-6">
          <AffiliateProgramGrid
            title="Bank accounts &amp; pillar 3a"
            slugs={["yuh", "neon", "ubs-key4"]}
          />
          <div className="mt-4">
            <AffiliateDisclosure />
          </div>
        </div>

        {/* Money & taxes community */}
        <section className="mt-10 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Ask the community
          </h2>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            The best answers to questions about salaries, taxes, insurance and
            budgeting come from people already doing their first Swiss
            year. Head to the Money &amp; Taxes board and ask.
          </p>
          <Link
            href="/category/money-taxes"
            className="inline-block rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Browse Money &amp; Taxes
          </Link>
        </section>

        {/* Share / invite loop */}
        <section className="mt-6 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Found these useful?
          </h2>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            Know a classmate starting their first Swiss job? Send them the
            guides — or the whole site.
          </p>
          <Link
            href="/invite"
            className="inline-block rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Invite a classmate
          </Link>
        </section>

        {/* Info section */}
        <section className="mt-6 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Swiss money, briefly
          </h2>
          <div className="space-y-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            <p>
              Switzerland taxes and saves differently from most countries. The
              key idea to absorb early is the three-pillar retirement system:
              a state pension everyone pays into, an occupational pension your
              employer co-funds, and voluntary 3a savings you can deduct from
              your taxes. Understanding the first two is simply reading your
              payslip; the third is where your own savings decisions live.
            </p>
            <p>
              Two costs dominate a young person&rsquo;s budget here: housing
              and mandatory health insurance. Salaries are high, but so are
              these two items, which is why the guides above start with the
              payslip and insurance rather than with investing. Get those two
              right and a healthy savings rate follows almost automatically.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}