// Shared clinic data, used by both the medical page (card grid) and the
// /clinics/[slug] detail pages. Mirrors lib/boarding-schools.ts.
//
// Facts (name, location, founding years, bed counts, specialty focus) were
// verified directly against each clinic's official website (cereneo.ch,
// nescens.com, rehaklinik-seewis.ch, klinik-schloss-mammern.ch,
// hirslanden.ch, rehaklinik-tschugg.ch, klinik-adelheid.ch,
// swissmedical.net) and Switzerland Tourism. Where a number comes only from
// third-party directories it is labelled in the highlights or omitted. Fees
// are not published by most clinics and are left as "Contact the clinic
// directly"; the one exception is Clinique Nescens, which lists check-up
// package prices on its own site.

export interface ClinicInfo {
  name: string;
  location: string;
  img?: string;
  founded?: string;
  beds?: string;
  focus: string;
  intro: string;
  highlights: readonly string[];
  fees: string;
  website: string;
}

export const CLINICS: Record<string, ClinicInfo> = {
  "cereneo-hertenstein": {
    name: "cereneo Hertenstein",
    location: "Hertenstein (Weggis), Lake Lucerne",
    founded: "2012",
    beds: "33",
    focus: "Neurological rehabilitation",
    intro:
      "cereneo is a Swiss neurorehabilitation clinic providing innovative, personalised treatment for stroke, Parkinson's disease, traumatic brain injuries and other neurological conditions. The Hertenstein site sits directly on the shores of Lake Lucerne and is connected to the Campus Hotel Hertenstein, so therapy runs alongside 4-star hospitality and 24/7 nursing care.",
    highlights: [
      "33 beds; around 175 patients treated per year",
      "Linked to the Campus Hotel Hertenstein on the shore of Lake Lucerne",
      "Research and treatment partnership with University Hospital Zurich (USZ)",
      "Online therapy continues rehabilitation at home after discharge",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://cereneo.ch/en/",
  },
  "clinique-nescens": {
    name: "Clinique Nescens",
    location: "Genolier, Lake Geneva area (Vaud)",
    focus: "Preventive medicine and medical check-ups",
    intro:
      "Clinique Nescens is a preventive-medicine and check-up clinic in Genolier above Lake Geneva, built on the aging research of Prof. Jacques Proust. It shares a campus with Clinique de Genolier (connected by an underground tunnel) and runs 1–3 day check-up packages alongside lifestyle, preventive and aesthetic medicine.",
    highlights: [
      "Three published check-up packages: Essential, Advanced and Excellence",
      "Connected by tunnel to Clinique de Genolier and 44+ medical specialties",
      "Specialists in lifestyle medicine, preventive & diagnostic medicine, and aesthetic & regenerative medicine",
      "Around 20–30 minutes by car from Geneva International Airport",
    ],
    fees: "Medical check-ups from CHF 4,521 (Essential package); Advanced and Excellence packages are higher.",
    website: "https://www.nescens.com/en-ch/",
  },
  "rehaklinik-seewis": {
    name: "Rehaklinik Seewis",
    location: "Seewis im Prättigau, Graubünden",
    beds: "60",
    focus: "Cardiac, oncological and psychosomatic rehabilitation",
    intro:
      "A small rehabilitation clinic set in the Prättigau valley of Graubünden, specialising in cardiac, internal-oncological, psychosomatic and psychiatric rehabilitation. Part of the VITREA Switzerland group, it runs inpatient and outpatient programmes with fully private rooms in an alpine setting.",
    highlights: [
      "60 inpatient beds with fully private rooms",
      "Cardiac, internal oncology, psychosomatic and psychiatric rehabilitation",
      "Part of VITREA Switzerland, one of the largest rehabilitation providers in Switzerland",
      "Alpine location, roughly 1 hour from St. Gallen and 1.5 hours from Zurich",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.rehaklinik-seewis.ch/",
  },
  "klinik-schloss-mammern": {
    name: "Klinik Schloss Mammern",
    location: "Mammern, Lake Constance (Thurgau)",
    founded: "1889",
    beds: "120",
    focus: "Rehabilitation (cardiovascular, musculoskeletal, oncological, pulmonary)",
    intro:
      "A family-run private rehabilitation clinic in the 1621-built Schloss Mammern on the shores of Lake Constance, led by the fourth generation of the same family since 1889. A member of Swiss Leading Hospitals, it offers cardiovascular, musculoskeletal, oncological and pulmonary rehabilitation in a hotel-grade setting.",
    highlights: [
      "Family-run since 1889, now in its fourth generation",
      "120 beds and around 300 employees",
      "Certified SW!SS REHA clinic for cardiovascular, musculoskeletal, oncological and pulmonary rehabilitation",
      "About 40 minutes from Zurich Airport",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.klinik-schloss-mammern.ch/en/",
  },
  "hirslanden-klinik-aarau": {
    name: "Hirslanden Klinik Aarau",
    location: "Aarau, Aargau",
    founded: "1988",
    beds: "155",
    focus: "Full-service private hospital",
    intro:
      "The largest private hospital in the Swiss plateau between Bern and Zurich, opened in 1988 and treating more than 10,000 inpatients a year. Specialities include cardiology, oncology, orthopaedics, urology and maxillofacial and neurosurgery, with a 24-hour emergency unit, a da Vinci surgical robot and a helicopter landing pad.",
    highlights: [
      "155 beds, 880+ employees and 180+ affiliated doctors",
      "24-hour accident & emergency unit with helicopter landing pad",
      "da Vinci surgical robot, cardiac catheterisation laboratory, radiology and radiotherapy institutes",
      "33 institutes and centres of expertise",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.hirslanden.ch/en/hirslanden-klinik-aarau/home.html",
  },
  "rehaklinik-tschugg": {
    name: "Rehaklinik Tschugg",
    location: "Tschugg, Bernese Seeland (Bern)",
    beds: "94",
    focus: "Neurological rehabilitation",
    intro:
      "A specialist clinic for neurological rehabilitation in the Bernese Seeland, between Lake Biel and Lake Neuchâtel, with a dedicated Parkinson's centre and an epileptology department. Part of VITREA Switzerland, it offers a private ward for international patients alongside robotic-assisted therapy.",
    highlights: [
      "94 beds and around 330 staff",
      "Certified SW!SS REHA clinic for inpatient neurological rehabilitation",
      "Dedicated Parkinson's centre and epileptology department",
      "Robotic-assisted movement therapy and LSVT LOUD / LSVT BIG treatment options",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.rehaklinik-tschugg.ch/",
  },
  "klinik-adelheid": {
    name: "Klinik Adelheid",
    location: "Unterägeri, Zug",
    beds: "140",
    focus: "Musculoskeletal, neurological and internal-organ rehabilitation",
    intro:
      "The leading rehabilitation centre of central Switzerland, located above Lake Ägerisee in the canton of Zug. Medicine, nursing and therapy work together interdisciplinary across musculoskeletal, neurological and internal-organ rehabilitation, with an outpatient therapy centre in Steinhausen.",
    highlights: [
      "140 beds in a modern facility above Lake Ägerisee",
      "Interdisciplinary medical, nursing and therapy teams",
      "Musculoskeletal, neurological and internal-organ rehabilitation",
      "Outpatient therapy centre in Steinhausen",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.klinik-adelheid.ch/",
  },
  "clinique-de-genolier": {
    name: "Clinique de Genolier",
    location: "Genolier, Lake Geneva area (Vaud)",
    founded: "1972",
    beds: "128",
    focus: "Oncology, radio-oncology and multi-specialty care",
    intro:
      "The flagship hospital of Swiss Medical Network, founded in 1972 with sweeping views of Lake Geneva and Mont Blanc. It is known for cancer care — its radio-oncology centre is among the most modern in Europe and it was the first Swiss facility to offer intra-operative radiotherapy (IORT) for breast cancer — and it is a member of the Mayo Clinic Care Network.",
    highlights: [
      "128 beds and nearly 200 admitting physicians",
      "First Swiss clinic to offer intra-operative radiotherapy (IORT)",
      "ESMO Designated Centre for oncology and integrated palliative care",
      "Member of the Mayo Clinic Care Network",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.swissmedical.net/en/hospitals/genolier",
  },
  "klinik-hirslanden": {
    name: "Klinik Hirslanden",
    location: "Zurich",
    founded: "1932",
    beds: "330",
    focus: "Full-service private hospital",
    intro:
      "The flagship private hospital of the Hirslanden group, founded in 1932 and set high above Lake Zurich. With more than 50 institutes and centres of medical excellence, its main focus areas are cardiology, visceral surgery, neuroscience, orthopaedics and gynaecology/obstetrics, backed by a 24-hour emergency unit.",
    highlights: [
      "330 beds and 14 operating theatres",
      "50+ institutes and centres of medical excellence",
      "24-hour emergency department and certified stroke centre",
      "One of the first Swiss private hospitals to use robotic (da Vinci) surgery",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.hirslanden.ch/en/klinik-hirslanden/home.html",
  },
};
