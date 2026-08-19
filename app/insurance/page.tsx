import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import type { Metadata } from "next";
import { AffiliateDisclosure } from "@/components/affiliate/affiliate-disclosure";
import { AFFILIATE_PROGRAMS, affiliateUrl } from "@/lib/affiliates";

export const dynamic = "force-dynamic";

const SITE = "https://hospograd-web.bahram-khanlarov.workers.dev";

export const metadata: Metadata = {
  title: "Swiss Health Insurance for Students | HospoGrad",
  description:
    "Health insurance is mandatory for everyone in Switzerland. See what students pay, the deductible and plan-model choices that move the premium, and compare quotes before your first policy starts.",
  alternates: { canonical: `${SITE}/insurance` },
  openGraph: {
    title: "Swiss Health Insurance for Students | HospoGrad",
    description:
      "What every student in Switzerland should know about mandatory health insurance, plus how to compare premiums before your first policy starts.",
    url: `${SITE}/insurance`,
    type: "website",
    siteName: "HospoGrad",
  },
};

const FAQ = [
  {
    question: "Is health insurance mandatory for students in Switzerland?",
    answer:
      "Yes. Every person living in Switzerland must have basic health insurance (obligatorische Krankenversicherung / assurance-maladie obligatoire), including international students. You must take out a policy within three months of arriving; the law backdates cover to your arrival date, so you pay from day one regardless of when you sign up.",
  },
  {
    question: "How much does health insurance cost for students?",
    answer:
      "Basic premiums are set per canton and by age band. Young adults up to their 25th birthday pay a reduced 'young adult' premium. Before choosing, two levers move the price most: the deductible (Franchise) and the managed-care model. Comparing quotes across insurers is worth it — identical basic cover costs differently depending on the company.",
  },
  {
    question: "What is the deductible (Franchise)?",
    answer:
      "The deductible is the amount you pay for healthcare yourself each year before insurance kicks in. Adults can choose from CHF 300 up to CHF 2,500 a year; a higher deductible means a lower monthly premium. For young adults the premium saving on a high deductible is small, so the low-deductible option is often the better deal.",
  },
  {
    question: "What are managed-care plan models?",
    answer:
      "Beyond the standard model (free choice of doctor), insurers offer cheaper managed-care models: HMO (you choose a group practice), family-doctor (one named GP coordinates your care), and Telmed (a phone-first triage line). You give up some freedom of choice in exchange for a premium discount of roughly 10\u201320%.",
  },
  {
    question: "Do students need additional or private insurance?",
    answer:
      "Basic insurance covers medically necessary treatment, but not dental care, most glasses, or alternative medicine. Many students add supplementary insurance (Zusatzversicherung) for these, and those planning to stay should also consider accident cover — basic insurance only covers accidents through your employer once you work. Compare basic first; supplementary is optional.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const comparis = AFFILIATE_PROGRAMS.find((p) => p.slug === "comparis");

export default function InsurancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Nav />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Insurance" }]} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display mb-3 text-[2rem] font-normal leading-tight tracking-[-0.02em] text-foreground">
            Swiss Health Insurance for Students
          </h1>
          <p className="max-w-3xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Health insurance is mandatory for everyone living in Switzerland —
            students included. Most hospitality schools do not arrange it for
            you, so this is one of the first things to sort out after you
            arrive. Here&rsquo;s how it works and how to compare premiums.
          </p>
        </div>

        {/* CTA: start the comparison */}
        <section className="mb-10 rounded-md border border-primary/30 bg-primary/5 p-6">
          <h2 className="mb-2 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Compare your premium in 2 minutes
          </h2>
          <p className="mb-4 max-w-2xl text-[0.85rem] leading-relaxed text-muted-foreground">
            Tell us your age, canton and the choices that drive the price, and
            we&rsquo;ll match you with the right options for your first Swiss
            policy.
          </p>
          <Link
            href="/insurance/compare"
            className="inline-block rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Start the comparison
          </Link>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="font-display mb-3 text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
            How it works
          </h2>
          <div className="space-y-4 text-[0.88rem] leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Mandatory for everyone.</strong>{" "}
              As soon as you live in Switzerland you must hold basic health
              insurance, whatever your nationality. You have three months from
              arrival to take out a policy, and cover is backdated to your
              arrival date — so there is no benefit to waiting.
            </p>
            <p>
              <strong className="text-foreground">The price has three levers.</strong>{" "}
              Your premium depends on your canton of residence (premiums vary by
              region), your age (young adults pay a reduced rate until their 25th
              birthday), and your choices of deductible and plan model. Insurers
              charge different amounts for the same statutory cover, which is
              why comparing matters.
            </p>
            <p>
              <strong className="text-foreground">You can switch each year.</strong>{" "}
              Basic-insurance policies can be cancelled and changed every year
              (in practice by 30 November), so your first choice is not your
              last. Start somewhere sensible, then re-compare annually.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-[1.4rem] font-normal tracking-[-0.01em] text-foreground">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-border">
            {FAQ.map((f) => (
              <div key={f.question} className="py-4">
                <h3 className="mb-1 text-[0.95rem] font-semibold text-foreground">
                  {f.question}
                </h3>
                <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison partner */}
        <section className="mb-10 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Compare live quotes
          </h2>
          <p className="mb-4 max-w-2xl text-[0.85rem] leading-relaxed text-muted-foreground">
            Want to see real numbers across insurers right now? Comparis runs
            Switzerland&rsquo;s best-known independent comparison for basic
            health insurance, with live premiums per canton.
          </p>
          {comparis ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={affiliateUrl(comparis)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-sm border border-border px-4 py-2 text-[0.85rem] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Compare on Comparis
              </Link>
              <AffiliateDisclosure />
            </div>
          ) : null}
        </section>

        {/* Community CTA */}
        <section className="rounded-md border border-border bg-secondary p-5">
          <h2 className="font-display mb-1.5 text-[1.05rem] font-medium text-foreground">
            Ask the community
          </h2>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            Sorting out insurance as a new arrival is easier when you can ask
            people who&rsquo;ve just done it. Head to the Money &amp; Taxes
            board.
          </p>
          <Link
            href="/category/money-taxes"
            className="inline-block rounded-full border border-primary px-4 py-1.5 text-[0.78rem] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
          >
            Discuss on the forum
          </Link>
        </section>
      </div>
    </>
  );
}