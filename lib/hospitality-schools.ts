// Shared hospitality school data. Used by:
// - the education page's card grid (links to /hospitality-schools/[slug])
// - app/hospitality-schools/[slug]/page.tsx, the camps-style brochure page
// - app/schools/[slug]/page.tsx, the forum-integrated page (posts, links
//   back to the brochure page)
//
// Facts (founding years, campuses, program names, rankings) verified
// directly against each school's own official website via browser
// automation, not fabricated. Rankings are dated since they change yearly.

export interface HospitalitySchoolInfo {
  name: string;
  short: string;
  location: string;
  img: string;
  desc: string;
  founded?: string;
  ranking?: string;
  campuses: readonly string[];
  programs: readonly string[];
  intro: string;
  fees: string;
}

export const HOSPITALITY_SCHOOLS: Record<string, HospitalitySchoolInfo> = {
  glion: {
    name: "Glion Institute of Higher Education",
    short: "Glion",
    location: "Glion (Montreux) & Bulle, Switzerland",
    img: "/images/hospitality-schools/glion.jpg",
    desc: "Ranked #3 worldwide for Hospitality & Leisure Management (QS 2026). Two Swiss campuses — the flagship above Montreux and a second in Bulle — plus London.",
    founded: "1962",
    ranking: "#3 worldwide, Hospitality & Leisure Management (QS 2026)",
    campuses: ["Glion, above Montreux, Switzerland", "Bulle, Switzerland", "London, UK"],
    programs: [
      "Bachelor of Science in International Hospitality Business",
      "Bachelor of Science in Luxury Business",
      "Master's Degrees (4 tracks)",
      "Executive Master's Degrees",
      "Short & Online Programs",
    ],
    intro:
      "Glion's flagship campus sits in the hills above Montreux, in a former luxury hotel with its own Michelin-starred restaurant — genuinely the original Glion. A second, more business-school-style campus in Bulle houses the main academic center, plus a London campus at the University of Roehampton. Ranked #3 worldwide for Hospitality & Leisure Management and #3 for Employer Reputation (QS 2026).",
    fees: "Contact the school directly for current tuition.",
  },
  "les-roches": {
    name: "Les Roches",
    short: "Les Roches",
    location: "Crans-Montana, Valais",
    img: "/images/hospitality-schools/les-roches.jpg",
    desc: "World's No. 2 ranked institution in hospitality (per Les Roches). Campuses in Crans-Montana, Marbella and Abu Dhabi. 98% graduate employment rate.",
    founded: "1954",
    ranking: "5-star QS rating; dual Swiss (SAC) and NECHE accreditation",
    campuses: ["Crans-Montana, Switzerland", "Marbella, Spain", "Abu Dhabi, UAE"],
    programs: [
      "Bachelor of Science in Global Hospitality Management",
      "Bachelor of Science in Sports Business Management",
      "Master's Degrees (4 tracks)",
      "MBA in Global Hospitality Management",
      "Executive Education",
      "Advanced Studies Programs",
    ],
    intro:
      "70+ years old, with a 98% graduate employment rate and dual accreditation — Swiss Accreditation Council status plus NECHE, the same body that accredits Yale and Harvard. A genuinely international student body (100+ nationalities, 16:1 student-to-faculty ratio) across three very different campuses: the Swiss Alps, the Spanish coast, and Abu Dhabi.",
    fees: "Contact the school directly for current tuition.",
  },
  ehl: {
    name: "EHL Hospitality Business School",
    short: "EHL",
    location: "Lausanne",
    img: "/images/hospitality-schools/ehl.jpg",
    desc: "World's first hotel school (1893). Campuses in Lausanne, Passugg (near Chur), and Singapore. Offers everything from an Associate Degree to a Doctorate.",
    founded: "1893",
    ranking: "World's first hotel school; consistently ranked #1-2 globally for Hospitality & Leisure Management (QS)",
    campuses: ["Lausanne, Switzerland", "Passugg, Switzerland", "Singapore"],
    programs: [
      "Bachelor of Science in International Hospitality Management",
      "Associate Degree in Culinary Arts",
      "Master's Degrees",
      "MBA Programs",
      "Doctor of Business Administration",
      "Executive Education",
      "Swiss Professional Diplomas",
    ],
    intro:
      "The world's first hotel school, and the one every other hospitality school on this list measures itself against. The flagship Lausanne campus sits in the hills above the city; a second Swiss campus in Passugg (near Chur) runs out of a former Belle Époque hotel; a third campus is in Singapore. The only school here offering a full Doctor of Business Administration alongside its Bachelor's, Master's and MBA tracks.",
    fees: "Contact the school directly for current tuition.",
  },
  shms: {
    name: "Swiss Hotel Management School",
    short: "SHMS",
    location: "Caux & Leysin",
    img: "/images/hospitality-schools/shms.jpg",
    desc: "Housed in a former palace in Caux and a ski-resort campus in Leysin. Part of Swiss Education Group. Offers everything from a Swiss ES diploma to postgraduate business degrees.",
    campuses: ["Caux, Switzerland", "Leysin, Switzerland"],
    programs: [
      "Swiss Professional Degree (ES)",
      "Bachelor of Arts in International Hospitality Management",
      "Master of Arts in International Hospitality Business Management",
      "Master of Arts, Luxury Brand Management track",
      "Master of Science in International Hospitality Management",
      "Postgraduate Diploma in International Hotel, Resort & Spa Management",
    ],
    intro:
      "Runs out of a genuinely former palace overlooking Lake Geneva in Caux, plus a second campus with ski-resort alpine scenery in Leysin. Part of Swiss Education Group, the same alliance behind César Ritz and HIM.",
    fees: "Contact the school directly for current tuition.",
  },
  "cesar-ritz": {
    name: "César Ritz Colleges Switzerland",
    short: "César Ritz",
    location: "Brig, Valais",
    img: "/images/hospitality-schools/cesar-ritz.jpg",
    desc: "Named after the legendary hotelier. Ranked #5 Best Hospitality School in the World (QS 2026). Single campus in Brig, 20 minutes from Ritz's birthplace.",
    founded: "1982",
    ranking: "#5 worldwide (QS 2026); #3 Academic Reputation, #5 Employer Reputation (QS 2025)",
    campuses: ["Brig, Switzerland"],
    programs: [
      "Bachelor of Science in Hospitality Business Management",
      "Bachelor of Science in Applied AI for Hospitality Business Management",
      "Master of Science in Leadership",
    ],
    intro:
      "Named for César Ritz, the hotelier who defined luxury hospitality. Its single campus in Brig sits 20 minutes from Ritz's actual birthplace, between the Milan and Zurich hubs. Part of Swiss Education Group. 12,500+ alumni, with roughly 40% now in C-suite roles.",
    fees: "Contact the school directly for current tuition.",
  },
  him: {
    name: "HIM Business School Montreux",
    short: "HIM",
    location: "Montreux",
    img: "/images/hospitality-schools/him.jpg",
    desc: "Ranked 8th best hospitality school in the world (QS 2026). Single lakeside campus in Montreux, spread across four buildings downtown.",
    ranking: "#8 worldwide overall; #6 Academic & Employer Reputation (QS 2026)",
    campuses: ["Montreux, Switzerland"],
    programs: [
      "Bachelor of Business Administration (BBA)",
      "Bilingual BBA, French-English",
      "Bilingual BBA, Chinese-English",
      "Master in Applied AI in Customer Experience",
    ],
    intro:
      "A smaller school on Lake Geneva, spread across four downtown Montreux buildings within walking distance of each other. Part of Swiss Education Group. Beyond the core BBA, it offers French-English and Chinese-English bilingual tracks and a Master's in Applied AI in Customer Experience.",
    fees: "Contact the school directly for current tuition.",
  },
  "cornell-sha": {
    name: "Cornell Nolan School of Hotel Administration",
    short: "Cornell SHA",
    location: "Ithaca, New York, USA",
    img: "/images/hospitality-schools/cornell-sha.jpg",
    desc: "World's first hotel management degree (1922). Ivy League. Ranked #6 best hospitality/hotel management school in the world (CEOWORLD 2026).",
    founded: "1922",
    ranking: "#6 worldwide (CEOWORLD, 2026)",
    campuses: ["Ithaca, New York, USA"],
    programs: [
      "Bachelor's Degree, Hotel Administration",
      "Master of Management in Hospitality",
      "Executive Master of Management in Hospitality",
      "Master of Professional Studies in Real Estate",
      "Cornell-Peking MMH/MBA",
      "M.S. & Ph.D. (research-focused)",
    ],
    intro:
      "The world's first hotel management degree program, part of Cornell's SC Johnson College of Business. The only Ivy League school on this list, and the only one not in Switzerland. Students run The Establishment, a real working restaurant, and the student-run Hotel Ezra Cornell conference; the on-campus Statler Hotel is a full-service luxury hotel used for hands-on training.",
    fees: "Contact the school directly for current tuition.",
  },
};
