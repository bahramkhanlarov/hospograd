import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";

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
    href: "/category/general",
    img: "/images/education/tile-summer.jpg",
    label: "Summer Camps",
  },
  {
    href: "/category/general",
    img: "/images/education/tile-winter.jpg",
    label: "Winter Camps",
  },
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
              <HospSchoolCard
                name="Glion Institute of Higher Education"
                img="/images/schools/glion.jpg"
                desc="Ranked top 5 globally. Luxury brand management, Swiss heritage, campuses in Switzerland and London."
                slug="glion"
              />
              <HospSchoolCard
                name="Les Roches"
                img="/images/schools/les-roches.png"
                desc="Innovative hospitality school focused on entrepreneurship. Campuses in Crans-Montana and Marbella. Students from 100+ countries."
                slug="les-roches"
              />
              <HospSchoolCard
                name="EHL Hospitality Business School"
                img="/images/schools/ehl.png"
                desc="World's first hotel school (1893). Ranked number 1 by QS. Campuses in Lausanne, Singapore, and Chur."
                slug="ehl"
              />
              <HospSchoolCard
                name="SHMS, Swiss Hotel Management School"
                img="/images/schools/shms.png"
                desc="Housed in a former palace in Caux and Leysin. Focus on immersive hospitality and events management."
                slug="shms"
              />
              <HospSchoolCard
                name="César Ritz Colleges Switzerland"
                img="/images/schools/cesar-ritz.svg"
                desc="Named after the legendary hotelier. Ranked 5th globally. Focus on entrepreneurship and sustainable leadership."
                slug="cesar-ritz"
              />
              <HospSchoolCard
                name="HIM Business School, Montreux"
                img="/images/schools/him.svg"
                desc="Blends Swiss hospitality with American business degrees. Majors: hospitality, finance, marketing, management."
                slug="him"
              />
              <HospSchoolCard
                name="Cornell Nolan School of Hotel Administration"
                img="/images/schools/cornell-sha.svg"
                desc="World's first hotel management degree (1922). Ivy League. Unmatched alumni network and industry placement."
                slug="cornell-sha"
              />
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
              <SchoolCard
                name="Institut auf dem Rosenberg"
                location="St. Gallen, St. Gallen Region"
                desc="Since 1889, set in 100,000m² private parkland. 230 students from 55+ nations. AP, A-Levels, IB Diploma, IGCSE. 1:3 ratio. CHF 165,000/yr."
              />
              <SchoolCard
                name="Institut Montana"
                location="Zugerberg, Zug"
                desc="Swiss international boarding school on Mt. Zugerberg. Founded 1926. 380+ students from 55+ countries. IB Diploma, Swiss Matura, IGCSE. From CHF 70,400/yr."
              />
              <SchoolCard
                name="Haut-Lac International Bilingual School"
                location="Near Montreux"
                desc="IB World School ages 3-18. Bilingual English/French. IB PYP, MYP, DP, Swiss Matura. 150+ extracurricular activities."
              />
              <SchoolCard
                name="Collège du Léman"
                location="Geneva"
                desc="Switzerland's largest private K-12 (1,900 students, 110+ nationalities). IB Diploma, IBCP, US Diploma, French Bac, Swiss Maturité. Around CHF 113,500/yr."
              />
              <SchoolCard
                name="Copperfield International School"
                location="Verbier, Valais"
                desc="IB World School in the Alps. 3:1 student-teacher ratio. Boarding from age 11. IB PYP and IB Diploma programmes. Personalized mountain education."
              />
              <SchoolCard
                name="École d'Humanité"
                location="Hasliberg Goldern, Bernese Oberland"
                desc="Progressive boarding school ages 12-19. US High School Diploma and Swiss Matura. 25 countries represented. Alpine setting with holistic approach."
              />
              <SchoolCard
                name="Brillantmont International School"
                location="Lausanne"
                desc="One of the oldest Swiss boarding schools (est. 1882), family-owned. IGCSE, A-Levels, US High School Diploma. Central Lausanne location."
              />
              <SchoolCard
                name="Collège Alpin Beau Soleil"
                location="Villars-sur-Ollon"
                desc="Premier Alpine boarding school founded 1910. IB Diploma, French Bac, IGCSE. CHF 110,000 to 130,000/yr. Known for outdoor leadership."
              />
              <SchoolCard
                name="Chantemerle"
                location="Blonay/Vevey"
                desc="Private boarding school founded 1966. IGCSE, A-Levels, Swiss Matura. CHF 59,500/yr (boarding). Family-run with two campuses overlooking Lake Geneva."
              />
              <SchoolCard
                name="St. George's International School"
                location="Montreux"
                desc="British international school near Montreux. Ages 18 months to 18 years. IB Diploma, IGCSE, British curriculum. Nearly a century of history."
              />
              <SchoolCard
                name="Surval Montreux"
                location="Montreux"
                desc="All-girls boarding school est. 1961. Around 65 students. IGCSE, A-Levels, US Diploma, Gap Year. Lake Geneva views. Focus on girls' empowerment."
              />
              <SchoolCard
                name="Stiftsschule Engelberg"
                location="Engelberg"
                desc="IB World School in a Benedictine monastery setting. Ages 11-19. Swiss Matura and IB Diploma. Unique spiritual and academic environment."
              />
              <SchoolCard
                name="Collège Champittet"
                location="Lausanne"
                desc="Bilingual school with 120+ years of tradition. IB Diploma, French Bac, Swiss Maturité. Family-sized boarding. Part of Nord Anglia Education."
              />
            </div>
          </section>

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

function SchoolCard({ name, location, desc }: { name: string; location: string; desc: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-0.5 text-[0.9rem] font-semibold text-foreground">{name}</h3>
      <p className="mb-2 text-[0.72rem] font-medium text-primary">{location}</p>
      <p className="text-[0.8rem] leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function HospSchoolCard({ name, img, desc, slug }: { name: string; img: string; desc: string; slug: string }) {
  return (
    <Link
      href={`/schools/${slug}`}
      className="group block rounded-md border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={name} className="mb-2 h-9 w-auto rounded-sm bg-secondary object-contain px-3 py-1" />
      <h3 className="mb-1 text-[0.85rem] font-semibold text-foreground group-hover:text-primary">{name}</h3>
      <p className="text-[0.78rem] leading-relaxed text-muted-foreground">{desc}</p>
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
