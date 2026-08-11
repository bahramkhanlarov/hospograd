import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CAREER_TOPICS = [
  { name: "CV Reviews", slug: "cv-reviews", desc: "Get feedback on your CV and résumé from peers and professionals." },
  { name: "Interview Tips", slug: "interview-tips", desc: "Interview experiences, advice, and preparation tips." },
  { name: "Salary Discussions", slug: "salary-discussions", desc: "Salary ranges, negotiations, and compensation talk." },
  { name: "Management Trainee Programs", slug: "management-trainee", desc: "MT programs, applications, and experiences." },
  { name: "Career Changes", slug: "career-changes", desc: "Switching paths, upskilling, and career transitions." },
  { name: "Jobs & Internships", slug: "jobs-internships", desc: "Job postings, internship advice, employer reviews." },
];

export default function CareersPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Careers" },
        ]}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-6">
        <div className="mb-8">
          <h1 className="font-display mb-3 text-[2rem] font-normal leading-tight tracking-[-0.02em] text-foreground">
            Careers &amp; Professional Development
          </h1>
          <p className="max-w-3xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Your hospitality career starts here. Get CV feedback, interview tips,
            salary insights, and advice on management trainee programs and career
            changes — all from people who&rsquo;ve been there.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAREER_TOPICS.map((t) => (
            <Link
              key={t.slug}
              href={`/category/${t.slug}`}
              className="group rounded-md border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              <h3 className="mb-1 text-[0.95rem] font-semibold text-foreground group-hover:text-primary">
                {t.name}
              </h3>
              <p className="text-[0.82rem] text-muted-foreground">{t.desc}</p>
            </Link>
          ))}
        </div>

        {/* Every school gets its own community */}
        <section className="mt-10 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Every school gets its own community
          </h2>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            Each school has its own dedicated space where students and alumni can
            discuss freshers, current courses, housing, exams, events, and jobs
            specific to their institution.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/schools/glion"
              className="inline-block rounded-sm border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              Glion
            </Link>
            <Link
              href="/schools/les-roches"
              className="inline-block rounded-sm border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              Les Roches
            </Link>
            <Link
              href="/schools/ehl"
              className="inline-block rounded-sm border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              EHL
            </Link>
            <Link
              href="/schools/shms"
              className="inline-block rounded-sm border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              SHMS
            </Link>
            <Link
              href="/schools/cesar-ritz"
              className="inline-block rounded-sm border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              César Ritz
            </Link>
            <Link
              href="/schools/him"
              className="inline-block rounded-sm border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              HIM
            </Link>
            <Link
              href="/schools/cornell-sha"
              className="inline-block rounded-sm border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground transition-colors hover:border-primary/50 hover:bg-card-hover"
            >
              Cornell SHA
            </Link>
          </div>
        </section>

        {/* Discussion board */}
        <section className="mt-6 rounded-md border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            General career discussions
          </h2>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            Browse all career-related conversations or join the discussion.
          </p>
          <Link
            href="/category/careers"
            className="inline-block rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Browse discussions
          </Link>
        </section>
      </div>
    </>
  );
}