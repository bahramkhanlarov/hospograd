import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";
import { CAMPS } from "@/lib/camps";
import { WINTER_CAMPS } from "@/lib/winter-camps";
import { BOARDING_SCHOOLS } from "@/lib/boarding-schools";
import { HOSPITALITY_SCHOOLS } from "@/lib/hospitality-schools";
import { AffiliateProgramGrid } from "@/components/affiliate/affiliate-program-grid";
import { AffiliateDisclosure } from "@/components/affiliate/affiliate-disclosure";

// Restyled onto the site's pine/copper design system (see app/globals.css)
// with real Alpine photography instead of gradient-plus-emoji tiles.
// Structural cues (photo hero, quick-jump pills, 2x2 image tile grid, school
// directory cards) are borrowed from the Swiss-education-agency genre, but
// the copy and the "Popular in the community" section below are ours: we're
// a peer forum, not a placement agency, so the page ends by routing people
// into real threads rather than a fake news/insights stub.

export const dynamic = "force-dynamic";

const CATEGORY_TILES = [
  {
    href: "#hospitality-schools",
    img: "/images/education/tile-hospitality.jpg",
    label: "Hospitality Schools",
  },
  {
    href: "#boarding-schools",
    img: "/images/education/tile-boarding.jpg",
    label: "Boarding Schools",
  },
  {
    href: "#summer-camps",
    img: "/images/education/tile-summer.jpg",
    label: "Summer Camps",
  },
  {
    href: "#winter-camps",
    img: "/images/education/tile-winter.jpg",
    label: "Winter Camps",
  },
] as const;

const SUMMER_CAMP_PROGRAMS = [
  "Language classes",
  "Active adventures",
  "Art, theatre & music",
  "Culinary classes",
  "Digital skills",
  "Leadership skills",
  "Sport activities",
] as const;

const WINTER_CAMP_PROGRAMS = [
  "Language classes",
  "Culinary classes",
  "Leadership skills",
  "Science",
  "Sport activities",
] as const;

export default function EducationPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Education" },
        ]}
      />
      <div className="flex-1">
        {/* Hero */}
        <div className="relative flex h-[420px] items-end overflow-hidden">
          <img
            src="/images/education/hero-alps.jpg"
            alt="Snow-capped Alps above a lakeside cluster of Swiss chalets"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.85)] via-[oklch(20%_0.02_155/0.35)] to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-10">
            <h1 className="font-display max-w-xl text-[2.6rem] font-medium leading-[1.05] text-white text-balance">
              Where hospitality school actually leads.
            </h1>
            <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-white/85">
              Boarding schools, hospitality programs and camps across
              Switzerland, seen through the students who actually attend
              them.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-5 py-10">
          {/* Quick-jump tiles */}
          <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_TILES.map((tile) => (
              <a
                key={tile.label}
                href={tile.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-md"
              >
                <img
                  src={tile.img}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(20%_0.02_155/0.75)] via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 font-display text-[1.05rem] font-medium leading-tight text-white">
                  {tile.label}
                </span>
              </a>
            ))}
          </div>

          {/* Hospitality Management Schools */}
          <section id="hospitality-schools" className="mb-14 scroll-mt-6">
            <h2 className="font-display mb-2 text-[1.7rem] font-medium text-foreground">
              Hospitality Management Schools
            </h2>
            <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              The schools our own members study at, each with a dedicated
              page for questions specific to that campus.
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(HOSPITALITY_SCHOOLS).map(([slug, school]) => (
                <CampCard
                  key={slug}
                  slug={slug}
                  basePath="hospitality-schools"
                  name={school.name}
                  location={school.location}
                  img={school.img}
                  description={school.desc}
                />
              ))}
            </div>
          </section>

          {/* Swiss Boarding Schools directory */}
          <section id="boarding-schools" className="mb-14 scroll-mt-6">
            <h2 className="font-display mb-2 text-[1.7rem] font-medium text-foreground">
              Swiss Boarding Schools
            </h2>
            <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              A reference list for families researching options, tuition,
              and academic pathways.
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(BOARDING_SCHOOLS).map(([slug, school]) => (
                <CampCard
                  key={slug}
                  slug={slug}
                  basePath="boarding-schools"
                  name={school.name}
                  location={school.location}
                  img={school.img}
                  description={school.intro}
                />
              ))}
            </div>
          </section>

          {/* Swiss Summer Camps directory */}
          <section id="summer-camps" className="mb-14 scroll-mt-6">
            <h2 className="font-display mb-2 text-[1.7rem] font-medium text-foreground">
              Swiss Summer Camps
            </h2>
            <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              Multi-week residential camps that blend language learning with
              outdoor skills and sport. Most run two weeks minimum from late
              June to mid-August, with weekly boarding starting around CHF
              2,100.
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(CAMPS).map(([slug, camp]) => (
                <CampCard
                  key={slug}
                  slug={slug}
                  basePath="camps"
                  name={camp.name}
                  location={camp.location}
                  img={camp.cardImg}
                  description={camp.intro}
                />
              ))}
            </div>
          </section>

          {/* Academic programs in Swiss summer camps */}
          <section className="mb-14">
            <h2 className="font-display mb-2 text-[1.7rem] font-medium text-foreground">
              Academic programs in Swiss summer camps
            </h2>
            <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              Camps mix and match from the same handful of tracks. Worth
              checking which ones a given camp actually runs that week before
              you commit.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUMMER_CAMP_PROGRAMS.map((program) => (
                <span
                  key={program}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[0.78rem] font-medium text-foreground"
                >
                  {program}
                </span>
              ))}
            </div>
          </section>

          {/* Swiss Winter Camps directory */}
          <section id="winter-camps" className="mb-14 scroll-mt-6">
            <h2 className="font-display mb-2 text-[1.7rem] font-medium text-foreground">
              Swiss Winter Camps
            </h2>
            <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              Ski and snowboard camps in the classic resort towns, most
              running weekly sessions from mid-December to April, with
              boarding typically starting around CHF 1,200 to 2,200 a week.
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(WINTER_CAMPS).map(([slug, camp]) => (
                <CampCard
                  key={slug}
                  slug={slug}
                  basePath="winter-camps"
                  name={camp.name}
                  location={camp.location}
                  img={camp.cardImg}
                  description={camp.intro}
                />
              ))}
            </div>
          </section>

          {/* Academic programs in Swiss winter camps */}
          <section className="mb-14">
            <h2 className="font-display mb-2 text-[1.7rem] font-medium text-foreground">
              Academic programs in Swiss winter camps
            </h2>
            <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              A shorter list than summer, mostly built around the fact that
              everyone&rsquo;s on the slopes half the day.
            </p>
            <div className="flex flex-wrap gap-2">
              {WINTER_CAMP_PROGRAMS.map((program) => (
                <span
                  key={program}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-[0.78rem] font-medium text-foreground"
                >
                  {program}
                </span>
              ))}
            </div>
          </section>

          {/* Language courses & textbooks */}
          <div className="mb-14">
            <AffiliateProgramGrid
              title="Language courses &amp; textbooks"
              slugs={["babbel", "orell-fussli"]}
            />
            <div className="mt-4">
              <AffiliateDisclosure />
            </div>
          </div>

          {/* Popular in the community: real threads, not a fake news stub */}
          <section className="mb-14">
            <h2 className="font-display mb-2 text-[1.7rem] font-medium text-foreground">
              Popular in the community
            </h2>
            <p className="mb-6 max-w-2xl text-[0.88rem] leading-relaxed text-muted-foreground">
              Questions students actually ask each other about school life,
              admissions and money, straight from the forum.
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              <CommunityLinkCard
                href="/category/school-life"
                title="School Life & Courses"
                desc="Course choices, professors, campus life by school."
              />
              <CommunityLinkCard
                href="/category/accommodation"
                title="Accommodation & Housing"
                desc="Finding housing, leases, roommates, landlords."
              />
              <CommunityLinkCard
                href="/category/money-taxes"
                title="Money & Taxes"
                desc="Banking, taxes, budgeting in Switzerland."
              />
            </div>
          </section>

          {/* Info section */}
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="font-display mb-3 text-[1.3rem] font-medium text-foreground">
              Education in Switzerland, briefly
            </h2>
            <div className="space-y-3 text-[0.85rem] leading-relaxed text-muted-foreground">
              <p>
                Switzerland runs a wide mix of public and private schools,
                with an average teacher-student ratio around 1:3 at the
                boarding schools above. Fees typically run from CHF 50,000
                to CHF 130,000 a year depending on location and facilities.
              </p>
              <p>
                Extracurriculars are a real part of the pitch: sport, music,
                drama, art, community service and leadership programs are
                common, and they're often where the friendships (and the
                homesickness) actually happen.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function CampCard({
  slug,
  basePath,
  name,
  location,
  img,
  description,
}: {
  slug: string;
  basePath: "camps" | "winter-camps" | "boarding-schools" | "hospitality-schools";
  name: string;
  location: string;
  img: string;
  description: string;
}) {
  return (
    <Link
      href={`/${basePath}/${slug}`}
      className="group block overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={`${name} campus`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-0.5 text-[0.9rem] font-semibold leading-snug text-foreground group-hover:text-primary">
          {name}
        </h3>
        <p className="text-[0.75rem] text-muted-foreground">{location}</p>
        <p className="mt-2 line-clamp-3 text-[0.78rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
        <span className="mt-3 inline-block text-[0.75rem] font-medium text-primary">
          View profile →
        </span>
      </div>
    </Link>
  );
}

function CommunityLinkCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-md border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="mb-1.5 text-[0.92rem] font-semibold text-foreground group-hover:text-primary">
        {title}
      </h3>
      <p className="mb-3 text-[0.8rem] leading-relaxed text-muted-foreground">{desc}</p>
      <span className="inline-block rounded-full border border-border px-3 py-1 text-[0.72rem] font-medium text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
        Browse threads
      </span>
    </Link>
  );
}
