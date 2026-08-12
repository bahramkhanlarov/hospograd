// Shared hospitality school data, used by the education page's card grid
// and by /schools/[slug] (the forum-integrated school pages — see
// app/schools/[slug]/page.tsx and school-posts.tsx). Unlike camps and
// boarding schools, hospitality schools don't get a separate brochure
// route: their existing forum page gets a hero photo + intro on top.

export interface HospitalitySchoolInfo {
  name: string;
  short: string;
  location: string;
  img: string;
  desc: string;
}

export const HOSPITALITY_SCHOOLS: Record<string, HospitalitySchoolInfo> = {
  glion: {
    name: "Glion Institute of Higher Education",
    short: "Glion",
    location: "Bulle, Fribourg Region",
    img: "/images/hospitality-schools/glion.jpg",
    desc: "Ranked top 5 globally. Luxury brand management, Swiss heritage, campuses in Switzerland and London.",
  },
  "les-roches": {
    name: "Les Roches",
    short: "Les Roches",
    location: "Crans-Montana, Valais",
    img: "/images/hospitality-schools/les-roches.jpg",
    desc: "Innovative hospitality school focused on entrepreneurship. Campuses in Crans-Montana and Marbella. Students from 100+ countries.",
  },
  ehl: {
    name: "EHL Hospitality Business School",
    short: "EHL",
    location: "Lausanne",
    img: "/images/hospitality-schools/ehl.jpg",
    desc: "World's first hotel school (1893). Ranked number 1 by QS. Campuses in Lausanne, Singapore, and Chur.",
  },
  shms: {
    name: "Swiss Hotel Management School",
    short: "SHMS",
    location: "Caux & Leysin",
    img: "/images/hospitality-schools/shms.jpg",
    desc: "Housed in a former palace in Caux and Leysin. Focus on immersive hospitality and events management.",
  },
  "cesar-ritz": {
    name: "César Ritz Colleges Switzerland",
    short: "César Ritz",
    location: "Le Bouveret & Brig, Valais",
    img: "/images/hospitality-schools/cesar-ritz.jpg",
    desc: "Named after the legendary hotelier. Ranked 5th globally. Focus on entrepreneurship and sustainable leadership.",
  },
  him: {
    name: "HIM Business School Montreux",
    short: "HIM",
    location: "Montreux",
    img: "/images/hospitality-schools/him.jpg",
    desc: "Blends Swiss hospitality with American business degrees. Majors: hospitality, finance, marketing, management.",
  },
  "cornell-sha": {
    name: "Cornell Nolan School of Hotel Administration",
    short: "Cornell SHA",
    location: "Ithaca, New York, USA",
    img: "/images/hospitality-schools/cornell-sha.jpg",
    desc: "World's first hotel management degree (1922). Ivy League. Unmatched alumni network and industry placement.",
  },
};
