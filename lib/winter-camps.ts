// Shared winter camp data, used by both the education page (card grid) and
// the /winter-camps/[slug] detail pages. Mirrors lib/camps.ts (summer camps).

import type { ActivityGroup, CampInfo } from "./camps";

export type { ActivityGroup, CampInfo };

export const WINTER_CAMPS: Record<string, CampInfo> = {
  "les-elfes-international-winter-camp": {
    name: "Les Elfes International Winter Camp",
    location: "Verbier, Valais Region",
    cardImg: "/images/winter-camps/les-elfes-card.jpg",
    heroImg: "/images/winter-camps/les-elfes-hero.jpg",
    ages: "6 – 17",
    founded: "1987",
    intro:
      "An award-winning ski camp welcoming children and teenagers from 75+ nationalities, running every week from mid-December to the end of April.",
    locationDesc:
      "Verbier has been named \"Best Ski Resort, Switzerland\" every year since 2018, with 410km of slopes and a season that runs early December to end of April. Campers stay in two purpose-built wood-and-stone chalets in the Swiss Alpine tradition.",
    programmeDesc:
      "Up to six hours of skiing or snowboarding a day, plus optional language courses and excursions. Après-ski runs until 9 or 10pm depending on age group, and ski/snowboard certificates are awarded at the end of each week. Les Elfes also runs a private high-altitude restaurant at 2,200m for warm lunches on the slopes.",
    duration: "Weekly sessions",
    dates: "Mid-December – end of April",
    fees: "Day camp from CHF 250/week; boarding from CHF 2,200/week",
    activities: [
      { category: "Sports", items: ["Ice skating", "Snowboarding", "Skiing", "Swimming", "Tennis", "Volleyball"] },
      { category: "Outdoors", items: ["Leadership skills", "Snowshoeing", "Snowman building", "Sledging"] },
      { category: "Languages", items: ["English", "German", "French", "Spanish"] },
    ],
  },
  "braunwald-ski-snowboard-camp-frilingue": {
    name: "Braunwald Ski & Snowboard Camp – friLingue",
    location: "Braunwald, Swiss Alps",
    cardImg: "/images/winter-camps/braunwald-card.jpg",
    heroImg: "/images/winter-camps/braunwald-hero.jpg",
    ages: "8 – 17",
    intro:
      "A one-week ski-and-language camp run by friLingue at the Adrenalin Backpacker Hostel in a car-free alpine village above the fog line.",
    locationDesc:
      "Braunwald sits on a sunny, car-free terrace in Glarnerland, just over an hour from Zurich.",
    programmeDesc:
      "15 hours of ski or snowboard time and 12 hours of language classes (English, German or French) a week — or a pure skiing track for non-language learners. friLingue runs these camps for around 1,000 youngsters a year, with a 6-student class cap for a personalized approach.",
    duration: "1-week sessions (multi-week packages available)",
    fees: "From CHF 1,200/week, boarding — room type and length affect the exact rate",
    activities: [
      { category: "Language lessons", items: ["French", "English"] },
      { category: "Sports", items: ["Snowboarding", "Skiing"] },
      { category: "Outdoors", items: ["Leadership skills", "Snowshoeing", "Snowman building", "Sledging"] },
      { category: "Arts", items: ["Painting"] },
    ],
  },
  "surval-winter-camp": {
    name: "Surval's Swiss Winter Camp",
    location: "Montreux, Lake Geneva Area",
    cardImg: "/images/winter-camps/surval-card.jpg",
    heroImg: "/images/winter-camps/surval-hero.jpg",
    ages: "12 – 18 (girls only)",
    intro:
      "A girls-only blend of study and snow on the Surval Montreux campus, mixing on-campus academics with Alpine snow sports.",
    locationDesc:
      "Surval Montreux sits on the shores of Lake Geneva, about 90 minutes from Geneva Airport (transfers included). Campers share two- or three-person dorms with private ensuites and alpine-view balconies.",
    programmeDesc:
      "Surval Montreux caps enrollment at 60 students for a family-like atmosphere. Academic and language classes happen on campus; snow sports and activities use the surrounding Alps. On-site facilities include a dining hall, jacuzzi and fitness centre, tennis court, art centre and dance studio.",
    duration: "3, 4 or 5-week packages",
    fees: "3 weeks CHF 9,000; 4 weeks CHF 12,000; 5 weeks CHF 15,000",
    activities: [
      { category: "Language lessons", items: ["French", "English"] },
      { category: "Sports", items: ["Ice skating", "Snowboarding", "Skiing"] },
      { category: "Outdoors", items: ["Snowshoeing", "Snowman building", "Sledging", "Trips and outings in Switzerland"] },
      { category: "Indoors", items: ["Culinary arts", "Culture and savoir-vivre"] },
    ],
  },
  "ecole-winter-camp-skiventure": {
    name: "The Ecole Winter Camp SkiVenture",
    location: "Hasliberg Goldern, Bern Region",
    cardImg: "/images/winter-camps/skiventure-card.jpg",
    heroImg: "/images/winter-camps/skiventure-hero.jpg",
    ages: "12 – 16",
    intro:
      "Dynamic ski training paired with immersive German or English language learning, run by the École d'Humanité in the Bernese Alps.",
    locationDesc:
      "Located in the Canton of Bern between Lucerne and Interlaken, reachable by bus and gondola via Brünig Hasliberg or Hasliberg Reuti.",
    programmeDesc:
      "Run by the École d'Humanité, a small, progressive, not-for-profit boarding school built around cooperation, internationalism and closeness to nature. The 2-week programme is all-inclusive: accommodation, meals, activities and gear.",
    duration: "2 weeks",
    fees: "CHF 6,000 / 2 weeks",
    activities: [
      { category: "Language lessons", items: ["English", "German"] },
      { category: "Sports", items: ["Snowboarding", "Skiing"] },
      { category: "Outdoors", items: ["Snowman building", "Trips and outings in Switzerland"] },
    ],
  },
  "winter-camp-at-ecole-chantemerle": {
    name: "Winter Camp at Ecole Chantemerle",
    location: "Blonay, Vaud Region",
    cardImg: "/images/winter-camps/chantemerle-card.jpg",
    heroImg: "/images/winter-camps/chantemerle-hero.jpg",
    ages: "6 – 18",
    founded: "1966",
    intro:
      "An immersion winter camp on the Chantemerle boarding campus overlooking Lake Geneva and the Alps, from a 2-week minimum stay up to a full trimester.",
    locationDesc:
      "Chantemerle sits in the historic municipality of Blonay with sweeping views of Lake Geneva and the Alps, about 30 minutes from Lausanne.",
    programmeDesc:
      "Chantemerle International School has run an elite, French-speaking education for ages 6–18 since 1966, with warm boarding-house accommodation and 24/7 supervision.",
    duration: "2 weeks minimum, up to a trimester",
    dates: "January – end of March",
    fees: "2–4 weeks: CHF 1,600/week; 5–8 weeks: CHF 1,450/week; 8+ weeks: CHF 1,300/week",
    activities: [
      { category: "Sports", items: ["Ice skating", "Snowboarding", "Skiing", "Swimming", "Archery"] },
      { category: "Outdoors", items: ["Leadership skills", "Snowshoeing", "Snowman building", "Sledging", "Survival skills"] },
      { category: "Languages", items: ["English", "German", "French"] },
      { category: "Arts", items: ["Dancing", "Painting"] },
      { category: "Sciences", items: ["Computer programming", "Robotics", "Sciences"] },
    ],
  },
  "international-winter-camp-lovell-camps": {
    name: "Lovell Winter Camps",
    location: "Gstaad, Swiss Alps",
    cardImg: "/images/winter-camps/lovell-card.jpg",
    heroImg: "/images/winter-camps/lovell-hero.jpg",
    ages: "6 – 18",
    intro:
      "An alpine adventure at a cosy Mountain Lodge in Schönried, part of the Gstaad ski resort, from over 40 years of running Swiss winter camps.",
    locationDesc:
      "The Mountain Lodge sits in Schönried, a traditional alpine village in Gstaad known for consistent snowfall, 600m from the train station and cable car. It has 18 rooms plus two group rooms, all with en-suite facilities.",
    programmeDesc:
      "Lovell runs three programmes from mid-December to early April: a traditional ski camp, the Lovell Academy, and ski trips for schools and groups — all built around ski time plus language lessons and other activities.",
    duration: "Weekly sessions",
    dates: "Mid-December – early April",
    fees: "Day camp CHF 1,800/week; boarding CHF 2,300/week",
    activities: [
      { category: "Sports", items: ["Snowboarding", "Skiing", "Swimming", "Tennis", "Climbing", "Multi sport", "Bowling & karting"] },
      { category: "Outdoors", items: ["Leadership skills", "Snowman building", "Sledging"] },
      { category: "Languages", items: ["English", "German", "French"] },
    ],
  },
};
