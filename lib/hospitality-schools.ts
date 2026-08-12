// Shared hospitality school data. Used by:
// - the education page's card grid (links to /hospitality-schools/[slug])
// - app/hospitality-schools/[slug]/page.tsx, the camps-style brochure page
// - app/schools/[slug]/page.tsx, the forum-integrated page (hero + intro +
//   posts) that the brochure page's "Discuss on the forum" CTA links into

export interface HospitalitySchoolInfo {
  name: string;
  short: string;
  location: string;
  img: string;
  desc: string;
  founded?: string;
  campuses: readonly string[];
  programs: readonly string[];
  intro: string;
  fees: string;
}

export const HOSPITALITY_SCHOOLS: Record<string, HospitalitySchoolInfo> = {
  glion: {
    name: "Glion Institute of Higher Education",
    short: "Glion",
    location: "Bulle, Fribourg Region",
    img: "/images/hospitality-schools/glion.jpg",
    desc: "Ranked top 5 globally. Luxury brand management, Swiss heritage, campuses in Switzerland and London.",
    founded: "1962",
    campuses: ["Bulle, Switzerland", "London, UK"],
    programs: ["Hospitality Management", "Event Management", "Luxury Brand Management"],
    intro:
      "One of the most recognized names in hospitality education, consistently ranked in the global top 5. Glion moved its main Swiss campus to Bulle in 2018, with a second campus in London.",
    fees: "Contact the school directly for current tuition.",
  },
  "les-roches": {
    name: "Les Roches",
    short: "Les Roches",
    location: "Crans-Montana, Valais",
    img: "/images/hospitality-schools/les-roches.jpg",
    desc: "Innovative hospitality school focused on entrepreneurship. Campuses in Crans-Montana and Marbella. Students from 100+ countries.",
    founded: "1954",
    campuses: ["Crans-Montana, Switzerland", "Marbella, Spain"],
    programs: ["International Hospitality Management", "Entrepreneurship & Innovation"],
    intro:
      "A genuinely international student body — 100+ countries represented — built around an entrepreneurship-first take on hospitality education, with campuses in the Swiss Alps and on the Spanish coast.",
    fees: "Contact the school directly for current tuition.",
  },
  ehl: {
    name: "EHL Hospitality Business School",
    short: "EHL",
    location: "Lausanne",
    img: "/images/hospitality-schools/ehl.jpg",
    desc: "World's first hotel school (1893). Ranked number 1 by QS. Campuses in Lausanne, Singapore, and Chur.",
    founded: "1893",
    campuses: ["Lausanne, Switzerland", "Chur, Switzerland", "Singapore"],
    programs: ["Hospitality Management", "Business Administration"],
    intro:
      "The world's first hotel school, and the one other hospitality schools measure themselves against — ranked number 1 globally by QS. Three campuses across Switzerland and Singapore.",
    fees: "Contact the school directly for current tuition.",
  },
  shms: {
    name: "Swiss Hotel Management School",
    short: "SHMS",
    location: "Caux & Leysin",
    img: "/images/hospitality-schools/shms.jpg",
    desc: "Housed in a former palace in Caux and Leysin. Focus on immersive hospitality and events management.",
    campuses: ["Caux, Switzerland", "Leysin, Switzerland"],
    programs: ["Hospitality Management", "Events Management"],
    intro:
      "Runs out of a genuinely former palace overlooking Lake Geneva in Caux, plus a second campus in Leysin — hard to beat for a hospitality-school setting.",
    fees: "Contact the school directly for current tuition.",
  },
  "cesar-ritz": {
    name: "César Ritz Colleges Switzerland",
    short: "César Ritz",
    location: "Le Bouveret & Brig, Valais",
    img: "/images/hospitality-schools/cesar-ritz.jpg",
    desc: "Named after the legendary hotelier. Ranked 5th globally. Focus on entrepreneurship and sustainable leadership.",
    campuses: ["Le Bouveret, Switzerland", "Brig, Switzerland"],
    programs: ["Hospitality Management", "Sustainable Leadership"],
    intro:
      "Named for César Ritz, the hotelier who defined luxury hospitality — the school leans into entrepreneurship and sustainable leadership across its two Valais campuses.",
    fees: "Contact the school directly for current tuition.",
  },
  him: {
    name: "HIM Business School Montreux",
    short: "HIM",
    location: "Montreux",
    img: "/images/hospitality-schools/him.jpg",
    desc: "Blends Swiss hospitality with American business degrees. Majors: hospitality, finance, marketing, management.",
    campuses: ["Montreux, Switzerland"],
    programs: ["Hospitality", "Finance", "Marketing", "Management"],
    intro:
      "A smaller, single-campus school on Lake Geneva that pairs a Swiss hospitality foundation with American-style business degrees across four majors.",
    fees: "Contact the school directly for current tuition.",
  },
  "cornell-sha": {
    name: "Cornell Nolan School of Hotel Administration",
    short: "Cornell SHA",
    location: "Ithaca, New York, USA",
    img: "/images/hospitality-schools/cornell-sha.jpg",
    desc: "World's first hotel management degree (1922). Ivy League. Unmatched alumni network and industry placement.",
    founded: "1922",
    campuses: ["Ithaca, New York, USA"],
    programs: ["Hotel Administration", "Real Estate", "Food & Beverage Management"],
    intro:
      "The world's first hotel management degree program, part of Cornell's SC Johnson College of Business. The one Ivy League option in this list, and the only one not in Switzerland.",
    fees: "Contact the school directly for current tuition.",
  },
};
