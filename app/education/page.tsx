import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
        {/* Hero section — premium image banner */}
        <div className="relative flex h-[340px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a2a3a] via-[#2d4a3e] to-[#1a2a3a]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PHBhdGggZD0iTTAgMGg4MDB2NjAwSDB6IiBmaWxsPSIjMWEyYTNhIi8+PHBhdGggZD0iTTAgMzAwYzEwMCAwIDIwMC01MCAzMDAtNTBzMjAwIDUwIDMwMCA1MCAyMDAtNTAgMzAwLTUwdjMwMEgweiIgZmlsbD0iIzJkNGEzZSIgb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] bg-cover bg-center opacity-30" />
          <div className="relative z-10 text-center">
            <p className="mb-2 text-[0.85rem] font-medium uppercase tracking-[0.15em] text-white/60">Swiss</p>
            <h1 className="text-[2.8rem] font-bold leading-tight tracking-[-0.01em] text-white">
              BOARDING SCHOOLS &amp; CAMPS
            </h1>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl px-5 py-10">
          {/* Category cards — white cards with image + text, like premiumswitzerland */}
          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/schools/glion"
              className="group block overflow-hidden rounded-md border border-[#e0ddd8] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-square bg-gradient-to-br from-[#e8f4f0] to-[#d0e8df] flex items-center justify-center text-[3.5rem]">
                🎓
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-[0.95rem] font-bold text-[#222]">
                  Hospitality Management Schools
                </h3>
                <p className="text-[0.8rem] leading-relaxed text-[#666]">
                  Explore our community of hospitality schools — Glion, Les
                  Roches, EHL, SHMS, and more.
                </p>
              </div>
            </Link>

            <Link
              href="/category/jobs-internships"
              className="group block overflow-hidden rounded-md border border-[#e0ddd8] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-square bg-gradient-to-br from-[#f0ece4] to-[#e8e0d0] flex items-center justify-center text-[3.5rem]">
                🏫
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-[0.95rem] font-bold text-[#222]">
                  Boarding Schools <span className="font-normal text-[#999]">(16)</span>
                </h3>
                <p className="text-[0.8rem] leading-relaxed text-[#666]">
                  Discover the best Swiss boarding schools, their academic
                  pathways and university outcomes.
                </p>
              </div>
            </Link>

            <Link
              href="/category/general"
              className="group block overflow-hidden rounded-md border border-[#e0ddd8] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-square bg-gradient-to-br from-[#e8f0f8] to-[#d0e0f0] flex items-center justify-center text-[3.5rem]">
                ☀️
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-[0.95rem] font-bold text-[#222]">
                  Summer Camps <span className="font-normal text-[#999]">(20)</span>
                </h3>
                <p className="text-[0.8rem] leading-relaxed text-[#666]">
                  Find summer camps that combine languages, sports and creativity
                  in safe Swiss locations.
                </p>
              </div>
            </Link>

            <Link
              href="/category/general"
              className="group block overflow-hidden rounded-md border border-[#e0ddd8] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-square bg-gradient-to-br from-[#e8edf4] to-[#d0d8e8] flex items-center justify-center text-[3.5rem]">
                ⛷️
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-[0.95rem] font-bold text-[#222]">
                  Winter Camps <span className="font-normal text-[#999]">(8)</span>
                </h3>
                <p className="text-[0.8rem] leading-relaxed text-[#666]">
                  Explore Swiss winter camps with skiing, snowboarding and tailored
                  academic support.
                </p>
              </div>
            </Link>
          </div>

          {/* Swiss Boarding Schools directory */}
          <section className="mb-12">
            <h2 className="mb-2 text-[1.6rem] font-bold text-[#222]">
              Swiss Boarding Schools
            </h2>
            <p className="mb-6 text-[0.85rem] leading-relaxed text-[#666]">
              In-depth profiles for the best Swiss boarding schools, packed with
              details on tuition fees, academic programs, locations, and more.
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
                desc="Switzerland's largest private K-12 (1,900 students, 110+ nationalities). IB Diploma, IBCP, US Diploma, French Bac, Swiss Maturité. ~CHF 113,500/yr."
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
                desc="One of oldest Swiss boarding schools (est. 1882), family-owned. IGCSE, A-Levels, US High School Diploma. Central Lausanne location."
              />
              <SchoolCard
                name="Collège Alpin Beau Soleil"
                location="Villars-sur-Ollon"
                desc="Premier Alpine boarding school founded 1910. IB Diploma, French Bac, IGCSE. CHF 110,000—130,000/yr. Known for outdoor leadership."
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
                desc="All-girls boarding school est. 1961. ~65 students. IGCSE, A-Levels, US Diploma, Gap Year. Lake Geneva views. Focus on girls' empowerment."
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

          {/* Hospitality Management Schools */}
          <section className="mb-12">
            <h2 className="mb-2 text-[1.6rem] font-bold text-[#222]">
              Hospitality Management Schools
            </h2>
            <p className="mb-6 text-[0.85rem] leading-relaxed text-[#666]">
              Leading hospitality schools in our community — each with its own dedicated page.
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
                desc="World's first hotel school (1893). Ranked #1 by QS. Campuses in Lausanne, Singapore, and Chur."
                slug="ehl"
              />
              <HospSchoolCard
                name="SHMS — Swiss Hotel Management School"
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
                name="HIM Business School — Montreux"
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

          {/* Dark article cards — matching premiumswitzerland style */}
          <section className="mb-12">
            <h2 className="mb-2 text-[1.6rem] font-bold text-[#222]">
              Swiss Education — A quick overview
            </h2>
            <div className="mb-8 space-y-4 text-[0.88rem] leading-relaxed text-[#555]">
              <p>Switzerland is known for its high-quality education system and prestigious academic institutions. Swiss boarding schools are particularly renowned for their rigorous academic programs, exceptional facilities, and diverse extracurricular activities. These institutions attract students from all over the world, offering a unique opportunity for cultural exchange and personal growth.</p>
              <p>In addition to boarding schools, Switzerland also offers a variety of summer and winter camps for students of all ages. Swiss summer camps provide a fun and engaging environment for children to learn new skills, make new friends, and explore the beautiful Swiss countryside.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-md border border-[#4a4a4a] bg-[#333] p-5">
                <h3 className="mb-3 text-[0.9rem] font-semibold leading-snug text-white">
                  Advantages of the Swiss Matura program in Swiss boarding schools
                </h3>
                <span className="inline-block rounded-sm border border-white/60 px-3 py-1 text-[0.75rem] font-medium text-white/80">
                  View
                </span>
              </div>
              <div className="rounded-md border border-[#4a4a4a] bg-[#333] p-5">
                <h3 className="mb-3 text-[0.9rem] font-semibold leading-snug text-white">
                  How can students benefit from the IB program in their future careers
                </h3>
                <span className="inline-block rounded-sm border border-white/60 px-3 py-1 text-[0.75rem] font-medium text-white/80">
                  View
                </span>
              </div>
              <div className="rounded-md border border-[#4a4a4a] bg-[#333] p-5">
                <h3 className="mb-3 text-[0.9rem] font-semibold leading-snug text-white">
                  Summer Camps for digital skills in Swiss boarding schools
                </h3>
                <span className="inline-block rounded-sm border border-white/60 px-3 py-1 text-[0.75rem] font-medium text-white/80">
                  View
                </span>
              </div>
            </div>
          </section>

          {/* Info section */}
          <section className="rounded-md bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-[1.3rem] font-bold text-[#222]">
              Information about Education in Switzerland
            </h2>
            <div className="space-y-3 text-[0.85rem] leading-relaxed text-[#555]">
              <p>The country has a diverse range of public and private schools, with a low teacher-student ratio of 1:3 on average. Boarding school fees range from 50,000 CHF to 130,000 CHF per year depending on location and facilities.</p>
              <p>Extra-curricular activities are an important aspect of education in Switzerland. Many schools offer sports, music, drama, art, community service, and leadership programs, helping students develop new friendships and build confidence.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function SchoolCard({ name, location, desc }: { name: string; location: string; desc: string }) {
  return (
    <div className="rounded-md border border-[#e0ddd8] bg-white p-4 shadow-sm">
      <h3 className="mb-0.5 text-[0.9rem] font-bold text-[#222]">{name}</h3>
      <p className="mb-2 text-[0.72rem] font-medium text-[#b8860b]">{location}</p>
      <p className="text-[0.8rem] leading-relaxed text-[#666]">{desc}</p>
    </div>
  );
}

function HospSchoolCard({ name, img, desc, slug }: { name: string; img: string; desc: string; slug: string }) {
  return (
    <Link href={`/schools/${slug}`} className="group block rounded-md border border-[#e0ddd8] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <img src={img} alt={name} className="mb-2 h-9 w-auto rounded-sm bg-[#f5f3f0] object-contain px-3 py-1" />
      <h3 className="mb-1 text-[0.85rem] font-semibold text-[#222] group-hover:text-[#b8860b]">{name}</h3>
      <p className="text-[0.78rem] leading-relaxed text-[#666]">{desc}</p>
    </Link>
  );
}