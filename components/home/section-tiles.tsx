// Four section tiles routing the homepage into the site's content pillars:
// Education, Careers, Medical, Finance. Uses one existing image per tile —
// the education/alpine image plus three clinic photos, so no new assets.

import Link from "next/link";

interface Tile {
  href: string;
  img: string;
  alt: string;
  title: string;
  desc: string;
}

const TILES: Tile[] = [
  {
    href: "/education",
    img: "/images/education/tile-hospitality.jpg",
    alt: "",
    title: "Education",
    desc: "Schools, boarding schools, camps and the programs behind them.",
  },
  {
    href: "/careers",
    img: "/images/clinics/hirslanden-clinique-cecil.jpg",
    alt: "",
    title: "Careers",
    desc: "CVs, interviews, salaries and management trainee programs.",
  },
  {
    href: "/medical",
    img: "/images/clinics/clinique-de-genolier.jpg",
    alt: "",
    title: "Medical",
    desc: "Clinics and check-ups across Switzerland, mapped by region.",
  },
  {
    href: "/finance",
    img: "/images/education/hero-alps.jpg",
    alt: "",
    title: "Finance",
    desc: "First salary, taxes, insurance, banking and saving — in plain terms.",
  },
];

export function SectionTiles() {
  return (
    <section className="my-10">
      <h2 className="font-display mb-5 text-[1.6rem] font-medium text-foreground">
        Everything a student actually asks about
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group block overflow-hidden rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="aspect-[4/3] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.img}
                alt={tile.alt}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-display mb-1 text-[1.05rem] font-medium text-foreground group-hover:text-primary">
                {tile.title}
              </h3>
              <p className="text-[0.8rem] leading-relaxed text-muted-foreground">
                {tile.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}