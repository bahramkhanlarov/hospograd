// Shared boarding school data, used by both the education page (card grid)
// and the /boarding-schools/[slug] detail pages. Mirrors lib/camps.ts.

export interface BoardingSchoolInfo {
  name: string;
  location: string;
  img: string;
  founded?: string;
  ages?: string;
  intro: string;
  highlights: readonly string[];
  curriculum: readonly string[];
  fees: string;
}

export const BOARDING_SCHOOLS: Record<string, BoardingSchoolInfo> = {
  "institut-auf-dem-rosenberg": {
    name: "Institut auf dem Rosenberg",
    location: "St. Gallen, St. Gallen Region",
    img: "/images/boarding-schools/rosenberg.jpg",
    founded: "1889",
    ages: "10 – 18",
    intro:
      "Set in 100,000m² of private parkland above St. Gallen, Rosenberg runs a 1:3 student-teacher ratio across a genuinely international student body.",
    highlights: ["230 students from 55+ nations", "100,000m² private parkland", "1:3 student-teacher ratio"],
    curriculum: ["AP", "A-Levels", "IB Diploma", "IGCSE"],
    fees: "CHF 165,000/yr",
  },
  "institut-montana": {
    name: "Institut Montana",
    location: "Zugerberg, Zug",
    img: "/images/boarding-schools/institut-montana.jpg",
    founded: "1926",
    intro:
      "A Swiss international boarding school on Mt. Zugerberg, less than an hour from Zurich, with a century of history behind it.",
    highlights: ["380+ students from 55+ countries"],
    curriculum: ["IB Diploma", "Swiss Matura", "IGCSE"],
    fees: "From CHF 70,400/yr",
  },
  "haut-lac-international-bilingual-school": {
    name: "Haut-Lac International Bilingual School",
    location: "Near Montreux",
    img: "/images/boarding-schools/haut-lac.jpg",
    ages: "3 – 18",
    intro:
      "A bilingual English/French IB World School on the Swiss Riviera near Montreux, running the full IB continuum through to the Diploma.",
    highlights: ["150+ extracurricular activities"],
    curriculum: ["IB PYP", "IB MYP", "IB DP", "Swiss Matura"],
    fees: "Contact the school directly for current fees.",
  },
  "college-du-leman": {
    name: "Collège du Léman",
    location: "Geneva",
    img: "/images/boarding-schools/college-du-leman.jpg",
    intro:
      "Switzerland's largest private K-12, with 1,900 students from 110+ nationalities and five diploma tracks to choose between.",
    highlights: ["1,900 students, 110+ nationalities", "Switzerland's largest private K-12"],
    curriculum: ["IB Diploma", "IBCP", "US Diploma", "French Bac", "Swiss Maturité"],
    fees: "Around CHF 113,500/yr",
  },
  "copperfield-international-school": {
    name: "Copperfield International School",
    location: "Verbier, Valais",
    img: "/images/boarding-schools/copperfield.jpg",
    ages: "11+",
    intro:
      "An IB World School built into the Alps above Verbier, with boarding from age 11 and a personalized approach that comes from a 3:1 student-teacher ratio.",
    highlights: ["3:1 student-teacher ratio", "Boarding from age 11"],
    curriculum: ["IB PYP", "IB Diploma"],
    fees: "Contact the school directly for current fees.",
  },
  "ecole-dhumanite": {
    name: "École d'Humanité",
    location: "Hasliberg Goldern, Bernese Oberland",
    img: "/images/boarding-schools/ecole-dhumanite.jpg",
    ages: "12 – 19",
    intro:
      "A progressive, holistic boarding school in the Bernese Oberland with 25 countries represented among its students and an alpine setting most schools can't match.",
    highlights: ["25 countries represented", "Holistic, progressive approach"],
    curriculum: ["US High School Diploma", "Swiss Matura"],
    fees: "Contact the school directly for current fees.",
  },
  "brillantmont-international-school": {
    name: "Brillantmont International School",
    location: "Lausanne",
    img: "/images/boarding-schools/brillantmont.jpg",
    founded: "1882",
    intro:
      "One of the oldest Swiss boarding schools, family-owned since 1882, in a central Lausanne location rather than out in the mountains.",
    highlights: ["Family-owned since 1882", "Central Lausanne location"],
    curriculum: ["IGCSE", "A-Levels", "US High School Diploma"],
    fees: "Contact the school directly for current fees.",
  },
  "college-alpin-beau-soleil": {
    name: "Collège Alpin Beau Soleil",
    location: "Villars-sur-Ollon",
    img: "/images/boarding-schools/beau-soleil.jpg",
    founded: "1910",
    intro:
      "A premier Alpine boarding school known for outdoor leadership, founded in 1910 above Villars-sur-Ollon.",
    highlights: ["Known for outdoor leadership"],
    curriculum: ["IB Diploma", "French Bac", "IGCSE"],
    fees: "CHF 110,000 – 130,000/yr",
  },
  chantemerle: {
    name: "Chantemerle",
    location: "Blonay/Vevey",
    img: "/images/boarding-schools/chantemerle.jpg",
    founded: "1966",
    ages: "6 – 18",
    intro:
      "A family-run private boarding school founded in 1966, with two campuses overlooking Lake Geneva above Vevey.",
    highlights: ["Family-run since 1966", "Two campuses overlooking Lake Geneva"],
    curriculum: ["IGCSE", "A-Levels", "Swiss Matura"],
    fees: "CHF 59,500/yr (boarding)",
  },
  "st-georges-international-school": {
    name: "St. George's International School",
    location: "Montreux",
    img: "/images/boarding-schools/st-georges.jpg",
    ages: "18 months – 18 years",
    intro:
      "A British international school near Montreux with nearly a century of history and a British curriculum through to the IB Diploma.",
    highlights: ["Nearly a century of history"],
    curriculum: ["IB Diploma", "IGCSE", "British curriculum"],
    fees: "Contact the school directly for current fees.",
  },
  "surval-montreux": {
    name: "Surval Montreux",
    location: "Montreux",
    img: "/images/boarding-schools/surval.jpg",
    founded: "1961",
    intro:
      "An all-girls boarding school on Lake Geneva, founded in 1961 and deliberately kept small — around 65 students — with a focus on girls' empowerment.",
    highlights: ["Around 65 students", "Focus on girls' empowerment", "Lake Geneva views"],
    curriculum: ["IGCSE", "A-Levels", "US Diploma", "Gap Year"],
    fees: "Contact the school directly for current fees.",
  },
  "stiftsschule-engelberg": {
    name: "Stiftsschule Engelberg",
    location: "Engelberg",
    img: "/images/boarding-schools/engelberg.jpg",
    ages: "11 – 19",
    intro:
      "An IB World School set inside a working Benedictine monastery in Engelberg — a genuinely unusual spiritual and academic environment.",
    highlights: ["Set in a Benedictine monastery"],
    curriculum: ["Swiss Matura", "IB Diploma"],
    fees: "Contact the school directly for current fees.",
  },
  "college-champittet": {
    name: "Collège Champittet",
    location: "Lausanne",
    img: "/images/boarding-schools/champittet.jpg",
    intro:
      "A bilingual school with 120+ years of tradition in Lausanne, offering family-sized boarding as part of the Nord Anglia Education network.",
    highlights: ["120+ years of tradition", "Part of Nord Anglia Education"],
    curriculum: ["IB Diploma", "French Bac", "Swiss Maturité"],
    fees: "Contact the school directly for current fees.",
  },
};
