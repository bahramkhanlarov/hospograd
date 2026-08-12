// Shared hospitality school data. Used by:
// - the education page's card grid (links to /hospitality-schools/[slug])
// - app/hospitality-schools/[slug]/page.tsx, the camps-style brochure page
// - app/schools/[slug]/page.tsx, the forum-integrated page (posts, links
//   back to the brochure page)
//
// Facts (founding years, campuses, program names, rankings) verified
// against each school's own official website, not fabricated.

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
    desc: "Ranked #3 worldwide for Hospitality & Leisure Management (QS 2026). Luxury brand management, Swiss heritage, campuses in Switzerland and London.",
    founded: "1962",
    campuses: ["Bulle, Switzerland", "London, UK"],
    programs: ["Bachelor's Degrees", "Master's Degrees", "Executive Master's Degrees", "Executive Online Courses"],
    intro:
      "Ranked #3 worldwide for Hospitality & Leisure Management and #3 for Employer Reputation (QS 2026). Glion's main Swiss campus moved to Bulle, with a second campus in London for students who want a foothold in both worlds.",
    fees: "Contact the school directly for current tuition.",
  },
  "les-roches": {
    name: "Les Roches",
    short: "Les Roches",
    location: "Crans-Montana, Valais",
    img: "/images/hospitality-schools/les-roches.jpg",
    desc: "Innovative hospitality school focused on entrepreneurship. Campuses in Crans-Montana, Marbella and Abu Dhabi. Students from 100+ countries.",
    founded: "1954",
    campuses: ["Crans-Montana, Switzerland", "Marbella, Spain", "Abu Dhabi, UAE"],
    programs: ["Bachelor's Degrees", "Master's Degrees", "MBA", "Executive Education", "Advanced Studies Programs"],
    intro:
      "A genuinely international student body — 100+ nationalities, a 16:1 student-to-faculty ratio — built around an entrepreneurship-first take on hospitality education, now across three campuses spanning the Swiss Alps, the Spanish coast and Abu Dhabi.",
    fees: "Contact the school directly for current tuition.",
  },
  ehl: {
    name: "EHL Hospitality Business School",
    short: "EHL",
    location: "Lausanne",
    img: "/images/hospitality-schools/ehl.jpg",
    desc: "World's first hotel school (1893). Ranked number 1 by QS. Campuses in Lausanne, Chur-Passugg, and Singapore.",
    founded: "1893",
    campuses: ["Lausanne, Switzerland", "Chur-Passugg, Switzerland", "Singapore"],
    programs: [
      "Bachelor of Science in Hospitality Management",
      "Master's & MBA Programs",
      "Associate Degree",
      "Executive Education",
      "Swiss Professional Diplomas",
      "Culinary Certificates",
    ],
    intro:
      "The world's first hotel school, and the one every other hospitality school on this list measures itself against. Three campuses now — two in Switzerland (Lausanne, Chur-Passugg) plus Singapore.",
    fees: "Contact the school directly for current tuition.",
  },
  shms: {
    name: "Swiss Hotel Management School",
    short: "SHMS",
    location: "Caux & Leysin",
    img: "/images/hospitality-schools/shms.jpg",
    desc: "Housed in a former palace in Caux and a ski-resort campus in Leysin. Regularly ranks among the world's top hospitality schools (QS).",
    campuses: ["Caux, Switzerland", "Leysin, Switzerland"],
    programs: ["Bachelor's Degrees in Hospitality Management", "Postgraduate Diploma to Master of Advanced Studies in Business"],
    intro:
      "Runs out of a genuinely former palace overlooking Lake Geneva in Caux, plus a second campus with ski-resort alpine scenery in Leysin — hard to beat for a hospitality-school setting either way.",
    fees: "Contact the school directly for current tuition.",
  },
  "cesar-ritz": {
    name: "César Ritz Colleges Switzerland",
    short: "César Ritz",
    location: "Le Bouveret & Brig, Valais",
    img: "/images/hospitality-schools/cesar-ritz.jpg",
    desc: "Named after the legendary hotelier. 40+ years of history. Focus on entrepreneurship and sustainable leadership.",
    campuses: ["Le Bouveret, Switzerland", "Brig, Switzerland"],
    programs: ["Bachelor of Science in Hospitality Business Management", "Master of Science in Leadership"],
    intro:
      "Named for César Ritz, the hotelier who defined luxury hospitality. 40+ years running programs that lean into entrepreneurship and sustainable leadership, across two Valais campuses — Brig sits close to Zermatt and the high Alps.",
    fees: "Contact the school directly for current tuition.",
  },
  him: {
    name: "HIM Business School Montreux",
    short: "HIM",
    location: "Montreux",
    img: "/images/hospitality-schools/him.jpg",
    desc: "Bachelor of Business Administration in Hospitality Management or Management. Single lakeside campus in Montreux.",
    campuses: ["Montreux, Switzerland"],
    programs: ["Bachelor of Business Administration (Hospitality Management)", "Bachelor of Business Administration (Management)"],
    intro:
      "A smaller, single-campus school on Lake Geneva. One three-year BBA, with a choice between a hospitality management or general management track.",
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
    programs: ["Bachelor of Science in Hotel Administration", "Master of Management in Hospitality", "MBA (via Cornell SC Johnson College)"],
    intro:
      "The world's first hotel management degree program, part of Cornell's SC Johnson College of Business. Over a century of history, and the only school on this list that's Ivy League — and not in Switzerland. Undergrads run the real, functioning Hotel Ezra Cornell conference as part of their education.",
    fees: "Contact the school directly for current tuition.",
  },
};
