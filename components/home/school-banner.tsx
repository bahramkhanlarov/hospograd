// Port of the school-banner logo strip from public/index.html (lines 14-28).
// Logo list, alt text, and slug are copied verbatim from that markup.
// The "light chip" styling (fixed height, auto width, contain,
// light background, small radius/padding) is ported from public/css/style.css's
// `.school-banner-logos img` rule.

interface Logo {
  src: string;
  alt: string;
  slug: string;
}

const LOGOS: Logo[] = [
  { src: "/images/schools/glion.jpg", alt: "Glion Institute of Higher Education", slug: "glion" },
  { src: "/images/schools/ehl.png", alt: "EHL Hospitality Business School", slug: "ehl" },
  { src: "/images/schools/les-roches.png", alt: "Les Roches", slug: "les-roches" },
  { src: "/images/schools/shms.png", alt: "Swiss Hotel Management School", slug: "shms" },
  { src: "/images/schools/cesar-ritz.svg", alt: "César Ritz Colleges Switzerland", slug: "cesar-ritz" },
  { src: "/images/schools/him.svg", alt: "HIM Business School Montreux", slug: "him" },
  { src: "/images/schools/cornell-sha.svg", alt: "Cornell Nolan School of Hotel Administration", slug: "cornell-sha" },
];

export function SchoolBanner() {
  return (
    <div className="border-b border-border bg-background px-5 py-[0.7rem]">
      <span className="mb-[0.45rem] block text-xs text-muted-foreground">
        Our community includes students &amp; alumni from:
      </span>
      <div className="flex flex-wrap items-center gap-6 max-[640px]:gap-4">
        {LOGOS.map((logo) => (
          <a
            key={logo.src}
            href={`/schools/${logo.slug}`}
            className="group -m-1.5 rounded-sm p-1.5 transition-transform hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-[44px] w-auto rounded-sm bg-white/80 object-contain px-3 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow group-hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] sm:h-[52px]"
            />
            <span className="mt-1 block h-px w-0 bg-primary transition-[width] duration-300 ease-out group-hover:w-full" />
          </a>
        ))}
      </div>
      <p className="mb-0 mt-2 text-[0.68rem] italic text-muted-foreground">
        HospoGrad is an independent, student-run community and is not affiliated with or endorsed by these institutions.
      </p>
    </div>
  );
}
