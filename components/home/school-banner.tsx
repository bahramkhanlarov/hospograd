// Port of the school-banner logo strip from public/index.html (lines 14-28).
// Logo list, alt text, and intrinsic width/height are copied verbatim from
// that markup. The "light chip" styling (fixed height, auto width, contain,
// light background, small radius/padding) is ported from public/css/style.css's
// `.school-banner-logos img` rule (lines 462-469) — 40px height (30px under
// the 640px breakpoint, lines 496-498), light background #f4f5f7, and
// var(--radius-sm) padding.

import Image from "next/image";

interface Logo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Ported verbatim from public/index.html lines 17-25.
const LOGOS: Logo[] = [
  { src: "/images/schools/glion.jpg", alt: "Glion Institute of Higher Education", width: 454, height: 135 },
  { src: "/images/schools/ehl.png", alt: "EHL Hospitality Business School", width: 967, height: 851 },
  { src: "/images/schools/les-roches.png", alt: "Les Roches", width: 800, height: 800 },
  { src: "/images/schools/shms.png", alt: "Swiss Hotel Management School", width: 128, height: 114 },
  { src: "/images/schools/shl.svg", alt: "SHL Schweizerische Hotelfachschule Luzern", width: 228, height: 110 },
  { src: "/images/schools/htmi.png", alt: "HTMi Hotel and Tourism Management Institute", width: 72, height: 104 },
  { src: "/images/schools/caas.png", alt: "Culinary Arts Academy Switzerland", width: 145, height: 145 },
  { src: "/images/schools/ihtti.jpg", alt: "IHTTI School of Hotel and Design Management", width: 200, height: 200 },
  { src: "/images/schools/isbm.png", alt: "ISBM Geneva", width: 360, height: 354 },
];

export function SchoolBanner() {
  return (
    <div className="border-b border-border bg-background px-5 py-[0.7rem]">
      <span className="mb-[0.45rem] block text-xs text-muted-foreground">
        Our community includes students &amp; alumni from:
      </span>
      <div className="flex flex-wrap items-center gap-5 max-[640px]:gap-[0.6rem]">
        {LOGOS.map((logo) => (
          <Image
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            className="h-[30px] w-auto rounded-sm bg-[#f4f5f7] object-contain px-[0.6rem] py-[0.35rem] sm:h-10"
          />
        ))}
      </div>
      <p className="mb-0 mt-2 text-[0.68rem] italic text-muted-foreground">
        HospoGrad is an independent, student-run community and is not affiliated with or endorsed by these institutions.
      </p>
    </div>
  );
}
