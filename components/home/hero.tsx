// Homepage hero — full-width Swiss Alps photo with a value-pitch headline,
// a tagline and two primary CTAs. Mirrors the /education hero's photo
// treatment and the site's pine/copper design tokens. Uses the existing
// hero-alps.jpg asset (no new image needed).

import Link from "next/link";

export function Hero() {
  return (
    <div className="relative flex h-[440px] items-end overflow-hidden">
      <img
        src="/images/education/hero-alps.jpg"
        alt="Snow-capped Swiss Alps above a lakeside cluster of chalets"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.9)] via-[oklch(20%_0.02_155/0.4)] to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12">
        <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-white/90 backdrop-blur-sm">
          Students &amp; alumni of Switzerland&rsquo;s hospitality schools
        </p>
        <h1 className="font-display max-w-2xl text-[2.6rem] font-medium leading-[1.05] text-white text-balance">
          The community for hotel management students and alumni.
        </h1>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/85">
          Housing, visas, jobs, salaries, insurance — everything you actually
          need to know about student life and a career in Switzerland, from
          people who&rsquo;ve been there.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-primary px-5 py-2 text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Join the community
          </Link>
          <Link
            href="/category/general"
            className="inline-block rounded-full border border-white/40 px-5 py-2 text-[0.85rem] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Browse threads
          </Link>
        </div>
      </div>
    </div>
  );
}