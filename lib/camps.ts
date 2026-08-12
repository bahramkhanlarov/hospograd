// Shared summer camp data, used by both the education page (card grid) and
// the /camps/[slug] detail pages.

export interface ActivityGroup {
  category: string;
  items: readonly string[];
}

export interface CampInfo {
  name: string;
  location: string;
  cardImg: string;
  heroImg: string;
  ages: string;
  founded?: string;
  intro: string;
  locationDesc: string;
  programmeDesc: string;
  duration: string;
  dates?: string;
  fees: string;
  activities: readonly ActivityGroup[];
}

export const CAMPS: Record<string, CampInfo> = {
  "les-elfes-verbier": {
    name: "Les Elfes International Summer Camp",
    location: "Verbier, Valais Region",
    cardImg: "/images/camps/les-elfes-card.jpg",
    heroImg: "/images/camps/les-elfes-hero.jpg",
    ages: "6 – 17",
    founded: "1987",
    intro:
      "An international multi-activity camp welcoming children and teenagers from 75+ nationalities, from December through the end of August.",
    locationDesc:
      "Verbier sits on a sunny alpine plateau in the heart of the Swiss Alps, with an exceptionally sunny climate in both summer and winter. Campers are housed in two purpose-built wood-and-stone chalets in the Swiss Alpine tradition.",
    programmeDesc:
      "Language immersion classes run in the mornings, with group activities and sport in the afternoons. Campers get 45+ outdoor activities to choose from, plus excursions into Italy and France.",
    duration: "2–4 week sessions",
    dates: "7 June – 29 August",
    fees: "Contact the camp directly for current pricing.",
    activities: [
      { category: "Sports", items: ["Football", "Tennis", "Swimming", "Water sports", "Golf", "Basketball", "Horseback riding", "Cycling"] },
      { category: "Outdoors", items: ["Leadership skills", "Survival skills", "Orientation skills", "Camping", "Fishing", "Lake activities"] },
      { category: "Languages", items: ["French", "German", "Spanish", "English", "Chinese"] },
      { category: "Arts", items: ["Theatre & drama", "Painting", "Dancing", "Music"] },
    ],
  },
  "institut-montana-summer-camp": {
    name: "Institut Montana Summer Camp",
    location: "Zugerberg, Zug",
    cardImg: "/images/camps/institut-montana-card.jpg",
    heroImg: "/images/camps/institut-montana-hero.jpg",
    ages: "9 – 15",
    intro:
      "A campus set in natural surroundings for kids wanting to learn English or German, reconnect with nature, and discover a talent over two weeks.",
    locationDesc:
      "Less than an hour from Zurich, nestled in the picturesque Zugerberg Mountain setting.",
    programmeDesc:
      "Two-week sessions built around coaching and a personal talent showcase, plus workshops in business, leadership, entrepreneurship, science and tech, or creative arts. Sport (tennis, badminton, football, beach volleyball) and Swiss boarding-school-standard accommodation round it out.",
    duration: "2 weeks",
    fees: "From CHF 5,800 (2 weeks, boarding)",
    activities: [
      { category: "Sports", items: ["Basketball", "Swimming", "Football", "Beach volleyball", "Tennis"] },
      { category: "Outdoors", items: ["Lake activities", "Orientation skills", "Hiking"] },
      { category: "Arts", items: ["Music", "Filmmaking", "Painting", "Performances", "Cookery", "Jewelry making", "Creative writing"] },
      { category: "Workshops", items: ["Radio & broadcasting", "Public speaking", "Interview skills"] },
    ],
  },
  "rosenberg-camps": {
    name: "The Rosenberg Camps",
    location: "St. Gallen, St. Gallen Region",
    cardImg: "/images/camps/rosenberg-card.jpg",
    heroImg: "/images/camps/rosenberg-hero.jpg",
    ages: "6–13 & 14–18",
    intro:
      "Run on the Institut auf dem Rosenberg boarding campus, a 100,000m² estate, balancing fun and learning with a curriculum that crosses cultures.",
    locationDesc:
      "In the old town of St. Gallen, surrounded by Swiss countryside — about 50 minutes from Zurich Airport and 3 hours from Munich Airport.",
    programmeDesc:
      "The school hosts 260 students from 40+ countries during term and carries that international mix into its summer camps, which pair academics (AP, GCE, IB tracks available) with an unusually broad extracurricular slate.",
    duration: "2 weeks",
    fees: "Standard package from CHF 9,600; special package from CHF 10,900 (2 weeks)",
    activities: [
      { category: "Sports", items: ["Basketball", "Golf", "Water sports", "Swimming", "Tennis", "Football"] },
      { category: "Outdoors", items: ["Survival skills", "Leadership skills"] },
      { category: "Languages", items: ["English", "German"] },
      { category: "Arts", items: ["Music", "Dancing", "Painting", "Filmmaking", "Theatre & drama"] },
      { category: "Sciences", items: ["Computer programming", "Robotics", "Model United Nations"] },
    ],
  },
  "lyceum-alpinum-zuoz": {
    name: "Lyceum Alpinum Zuoz Summer Camp",
    location: "Zuoz, Grisons",
    cardImg: "/images/camps/lyceum-zuoz-card.jpg",
    heroImg: "/images/camps/lyceum-zuoz-hero.jpg",
    ages: "6–16",
    founded: "1904",
    intro:
      "A high-altitude camp on the Lyceum Alpinum boarding campus in the Engadin valley, pairing daily language classes with an alpine setting most camps can't match.",
    locationDesc:
      "Zuoz is a 20-minute drive from St. Moritz, flanked by ice-capped mountains and alpine meadows. Samedan Airport is 15 minutes away.",
    programmeDesc:
      "Mornings are language classes, afternoons split between digital-skill workshops and recreational activities.",
    duration: "Up to 2 weeks",
    fees: "Day camp from CHF 1,000/week; boarding from CHF 5,800 (2 weeks)",
    activities: [
      { category: "Sports", items: ["Basketball", "Golf", "Swimming", "Tennis", "Football"] },
      { category: "Outdoors", items: ["Watersports", "Lake activities", "Camping"] },
      { category: "Languages", items: ["English", "German", "French"] },
      { category: "Sciences", items: ["Computer programming", "Robotics"] },
    ],
  },
  "haut-lac-summer-camps": {
    name: "Haut-Lac Summer Camps",
    location: "Saint-Légier-La Chiésaz, Lake Geneva Area",
    cardImg: "/images/camps/haut-lac-card.jpg",
    heroImg: "/images/camps/haut-lac-hero.jpg",
    ages: "8 – 15",
    intro:
      "A bilingual Swiss Riviera camp on the shores of Lake Geneva, mixing English/French language work with outdoor activities and cultural excursions.",
    locationDesc:
      "An hour from Geneva Airport, 30 minutes from the Alps, 10 minutes from Lake Geneva — an easy hub for exploring the region.",
    programmeDesc:
      "Run by Haut-Lac International Bilingual School, a fully-authorized IB World School with 30 years teaching bilingually in English and French.",
    duration: "Weekly sessions",
    fees: "CHF 1,650 per week",
    activities: [
      { category: "Languages", items: ["French", "English"] },
      { category: "Sports", items: ["Swimming", "Water sports", "Basketball", "Golf", "Tennis", "Paddle boarding"] },
      { category: "Outdoors", items: ["Leadership skills", "Lake activities", "Orientation skills", "Watersports", "Hiking"] },
    ],
  },
};
