// "Popular in the community" strip for the homepage — three link cards into
// the busiest forum categories, mirroring the /education page's pattern.
// Real forum categories, not a fake news stub.

import Link from "next/link";

interface CategoryCard {
  href: string;
  title: string;
  desc: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    href: "/category/school-life",
    title: "School Life & Courses",
    desc: "Courses, professors, campus life by school.",
  },
  {
    href: "/category/jobs-internships",
    title: "Jobs & Internships",
    desc: "Applications, offers, salaries, employer reviews.",
  },
  {
    href: "/category/accommodation",
    title: "Accommodation & Housing",
    desc: "Finding housing, leases, roommates, landlords.",
  },
];

export function PopularThreads() {
  return (
    <section className="my-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.6rem] font-medium text-foreground">
            Popular in the community
          </h2>
          <p className="mt-1 text-[0.88rem] leading-relaxed text-muted-foreground">
            The questions students actually ask each other, straight from the
            forum.
          </p>
        </div>
        <Link
          href="/category/general"
          className="hidden shrink-0 text-[0.82rem] font-medium text-primary transition-colors hover:text-primary-hover sm:inline-block"
        >
          View all threads &rarr;
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group block rounded-md border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="mb-1.5 text-[0.92rem] font-semibold text-foreground group-hover:text-primary">
              {c.title}
            </h3>
            <p className="mb-3 text-[0.8rem] leading-relaxed text-muted-foreground">
              {c.desc}
            </p>
            <span className="inline-block rounded-full border border-border px-3 py-1 text-[0.72rem] font-medium text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
              Browse threads
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}