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
  img: string;
  founded?: string;
  beds?: string;
  focus: string;
  intro: string;
  description: string;
  highlights: readonly string[];
  fees: string;
  website: string;
}

export const CLINICS: Record<string, ClinicInfo> = {
  "cereneo-hertenstein": {
    name: "cereneo Hertenstein",
    location: "Hertenstein (Weggis), Lake Lucerne",
    img: "/images/clinics/cereneo-hertenstein.jpg",
    founded: "2012",
    beds: "33",
    focus: "Neurological rehabilitation",
    intro:
      "cereneo is a Swiss neurorehabilitation clinic providing innovative, personalised treatment for stroke, Parkinson's disease, traumatic brain injuries and other neurological conditions. The Hertenstein site sits directly on the shores of Lake Lucerne and is connected to the Campus Hotel Hertenstein, so therapy runs alongside 4-star hospitality and 24/7 nursing care.",
    description:
      "cereneo treats people with stroke, Parkinson's disease and other neurological conditions in a purpose-built clinic on the shores of Lake Lucerne. The programme combines intensive therapy with clinical research — patients train with robotics and rehabilitation technology while clinicians track progress with standardised assessments. Because the clinic is connected to the Campus Hotel Hertenstein, patients stay in hotel-grade accommodation and keep access to 24/7 nursing care. cereneo also offers outpatient rehabilitation and continued online therapy after discharge, and runs a research partnership with University Hospital Zurich. Its roughly 175 patients a year come from Switzerland and abroad, and it accepts referrals through Swiss health insurance and international private cover.",
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
    img: "/images/clinics/clinique-nescens.jpg",
    focus: "Preventive medicine and medical check-ups",
    intro:
      "Clinique Nescens is a preventive-medicine and check-up clinic in Genolier above Lake Geneva, built on the aging research of Prof. Jacques Proust. It shares a campus with Clinique de Genolier (connected by an underground tunnel) and runs 1–3 day check-up packages alongside lifestyle, preventive and aesthetic medicine.",
    description:
      "Clinique Nescens is built around a simple idea: catch health problems before they become illnesses. Founded on the longevity research of Prof. Jacques Proust, it focuses on preventive and diagnostic medicine, lifestyle medicine, and aesthetic and regenerative medicine. Its signature offering is a one-to-three-day medical check-up carried out at the clinic, which covers a broad battery of tests, imaging and specialist consultations. The clinic shares the Genolier campus with Clinique de Genolier and is connected to it by an underground tunnel, giving patients access to more than 40 medical specialties while staying in a hotel-style setting with views over Lake Geneva. Check-up packages are published on the Nescens website and start at CHF 4,521 for the Essential package.",
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
    img: "/images/clinics/rehaklinik-seewis.jpg",
    beds: "60",
    focus: "Cardiac, oncological and psychosomatic rehabilitation",
    intro:
      "A small rehabilitation clinic set in the Prättigau valley of Graubünden, specialising in cardiac, internal-oncological, psychosomatic and psychiatric rehabilitation. Part of the VITREA Switzerland group, it runs inpatient and outpatient programmes with fully private rooms in an alpine setting.",
    description:
      "Rehaklinik Seewis sits on a sunny terrace at the entrance to the Prättigau valley in the Grisons, roughly an hour from St. Gallen and an hour and a half from Zurich. It specialises in cardiac rehabilitation, internal-oncological rehabilitation, and psychiatric and psychosomatic rehabilitation, treating patients who are recovering from surgery, illness or burnout. The clinic is part of VITREA Switzerland, one of the country's largest rehabilitation providers, and its small size keeps care personal: 60 inpatient beds, all in private rooms, with nature walks in the surrounding alpine landscape built into the therapy programme. Inpatient and outpatient programmes are both available.",
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
    img: "/images/clinics/klinik-schloss-mammern.jpg",
    founded: "1889",
    beds: "120",
    focus: "Rehabilitation (cardiovascular, musculoskeletal, oncological, pulmonary)",
    intro:
      "A family-run private rehabilitation clinic in the 1621-built Schloss Mammern on the shores of Lake Constance, led by the fourth generation of the same family since 1889. A member of Swiss Leading Hospitals, it offers cardiovascular, musculoskeletal, oncological and pulmonary rehabilitation in a hotel-grade setting.",
    description:
      "Klinik Schloss Mammern has been run by the same family for four generations since 1889, making it one of Switzerland's longest-established private clinics. It sits on the shores of Lake Constance in the canton of Thurgau, about 40 minutes from Zurich Airport, with treatment delivered in a 1621-built castle renovated into a hotel-grade medical facility. The clinic is certified by SW!SS REHA for cardiovascular, musculoskeletal, oncological and pulmonary rehabilitation, and offers around 120 beds staffed by roughly 300 employees. Patients typically stay between one and several weeks, and the clinic accepts both Swiss insured patients and international patients paying privately.",
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
    img: "/images/clinics/hirslanden-klinik-aarau.jpg",
    founded: "1988",
    beds: "155",
    focus: "Full-service private hospital",
    intro:
      "The largest private hospital in the Swiss plateau between Bern and Zurich, opened in 1988 and treating more than 10,000 inpatients a year. Specialities include cardiology, oncology, orthopaedics, urology and maxillofacial and neurosurgery, with a 24-hour emergency unit, a da Vinci surgical robot and a helicopter landing pad.",
    description:
      "Hirslanden Klinik Aarau is the largest private hospital on the Swiss plateau between Bern and Zurich. Since opening in 1988 it has grown to 155 beds, 880-plus employees and more than 180 affiliated doctors across 33 institutes and centres of expertise, treating over 10,000 inpatients a year. Its specialities include cardiology, oncology, orthopaedics, urology, and maxillofacial and neurosurgery, supported by a 24-hour accident and emergency unit with a helicopter landing pad, a da Vinci surgical robot and on-site radiology and radiotherapy institutes. The hospital is part of the Hirslanden Group, Switzerland's largest private medical network.",
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
    img: "/images/clinics/rehaklinik-tschugg.jpg",
    beds: "94",
    focus: "Neurological rehabilitation",
    intro:
      "A specialist clinic for neurological rehabilitation in the Bernese Seeland, between Lake Biel and Lake Neuchâtel, with a dedicated Parkinson's centre and an epileptology department. Part of VITREA Switzerland, it offers a private ward for international patients alongside robotic-assisted therapy.",
    description:
      "Rehaklinik Tschugg is a specialist clinic for neurological rehabilitation set in the Bernese Seeland between Lake Biel and Lake Neuchâtel. It treats patients recovering from stroke, brain and spinal injuries, and neurological conditions such as Parkinson's disease, with a dedicated Parkinson's centre and an epileptology department. The clinic holds SW!SS REHA certification for inpatient neurological rehabilitation, runs robotic-assisted movement therapy and LSVT LOUD and LSVT BIG programmes, and houses around 94 beds staffed by some 330 people. It is part of VITREA Switzerland and operates a private ward for international patients alongside Swiss insured care.",
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
    img: "/images/clinics/klinik-adelheid.jpg",
    beds: "140",
    focus: "Musculoskeletal, neurological and internal-organ rehabilitation",
    intro:
      "The leading rehabilitation centre of central Switzerland, located above Lake Ägerisee in the canton of Zug. Medicine, nursing and therapy work together interdisciplinary across musculoskeletal, neurological and internal-organ rehabilitation, with an outpatient therapy centre in Steinhausen.",
    description:
      "Klinik Adelheid is the rehabilitation centre of the canton of Zug and central Switzerland, set above Lake Ägerisee in the village of Unterägeri. It treats patients across musculoskeletal, neurological and internal-organ rehabilitation, bringing medicine, nursing and therapy together in interdisciplinary teams. The clinic has 140 beds in a modern, largely single-room facility — recently expanded in modules to add a further ward — and runs an outpatient therapy centre in Steinhausen. Patients recover in a calm lakeside and mountain setting roughly half an hour from Zurich, with treatment accepted under Swiss basic and supplementary insurance as well as privately.",
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
    img: "/images/clinics/clinique-de-genolier.jpg",
    founded: "1972",
    beds: "128",
    focus: "Oncology, radio-oncology and multi-specialty care",
    intro:
      "The flagship hospital of Swiss Medical Network, founded in 1972 with sweeping views of Lake Geneva and Mont Blanc. It is known for cancer care — its radio-oncology centre is among the most modern in Europe and it was the first Swiss facility to offer intra-operative radiotherapy (IORT) for breast cancer — and it is a member of the Mayo Clinic Care Network.",
    description:
      "Clinique de Genolier is one of Switzerland's largest private hospitals and the flagship of Swiss Medical Network, founded in 1972 on a hillside above Lake Geneva with views of the lake and Mont Blanc. It is best known for cancer care: its radio-oncology centre is among the most modern in Europe, it was the first Swiss clinic to offer intra-operative radiotherapy (IORT) for breast cancer, and it is an ESMO Designated Centre for oncology and integrated palliative care. The hospital has 128 beds, nearly 200 admitting physicians across 44-plus specialities, and is a member of the Mayo Clinic Care Network. The Nescens check-up clinic shares its campus, connected by an underground tunnel.",
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
    img: "/images/clinics/klinik-hirslanden.jpg",
    founded: "1932",
    beds: "330",
    focus: "Full-service private hospital",
    intro:
      "The flagship private hospital of the Hirslanden group, founded in 1932 and set high above Lake Zurich. With more than 50 institutes and centres of medical excellence, its main focus areas are cardiology, visceral surgery, neuroscience, orthopaedics and gynaecology/obstetrics, backed by a 24-hour emergency unit.",
    description:
      "Klinik Hirslanden is the flagship hospital of the Hirslanden Group, founded in 1932 and set high above Lake Zurich in the leafy Hirslanden district. With 330 beds, 14 operating theatres and more than 50 institutes and centres of medical excellence, it offers the full range of private hospital care — with particular strengths in cardiology, visceral surgery, neuroscience, orthopaedics and gynaecology and obstetrics. It runs a 24-hour emergency department and certified stroke centre, and was one of the first Swiss private hospitals to use robotic da Vinci surgery. The hospital serves patients of all insurance categories and treats international patients alongside Swiss insured ones.",
    highlights: [
      "330 beds and 14 operating theatres",
      "50+ institutes and centres of medical excellence",
      "24-hour emergency department and certified stroke centre",
      "One of the first Swiss private hospitals to use robotic (da Vinci) surgery",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.hirslanden.ch/en/klinik-hirslanden/home.html",
  },
  "clinique-la-prairie": {
    name: "Clinique La Prairie",
    location: "Clarens, Montreux (Vaud)",
    img: "/images/clinics/clinique-la-prairie.jpg",
    founded: "1931",
    focus: "Longevity, preventive medicine and medical check-ups",
    intro:
      "The world-famous longevity and health resort on the shore of Lake Geneva at Clarens-Montreux, founded in 1931 by Dr Paul Niehans, pioneer of cellular therapy. Today it combines a medical centre (preventive and curative medicine, surgery, diagnostics) with its iconic Revitalisation and Health Diagnostic programmes that draw guests from around the world.",
    description:
      "Clinique La Prairie is one of the most famous health establishments in the world, founded in 1931 by the Swiss physician Dr Paul Niehans after he pioneered cellular therapy. Set on the shore of Lake Geneva at Clarens, in the Riviera district of the canton of Vaud, the institution has grown from its longevity origins into a two-part operation: the Clinique La Prairie Medical Center, which provides preventive and curative medicine, surgery, imaging, dental and aesthetic care to local and international patients, and the health resort, whose signature Revitalisation and Health Diagnostic Assessment programmes combine medical screening, nutrition, fitness and wellness. Its Health Diagnostic Assessment draws on more than 50 medical specialists. The group also operates destinations beyond Switzerland, with wellness sites planned in Thailand and Saudi Arabia.",
    highlights: [
      "Founded 1931 by Dr Paul Niehans, pioneer of cellular therapy",
      "Medical center covering preventive, curative, dental and aesthetic medicine",
      "Health Diagnostic Assessment with more than 50 medical specialists",
      "Iconic Revitalisation programme, a benchmark in longevity medicine",
    ],
    fees: "Medical check-ups and programmes are priced individually; contact the clinic directly.",
    website: "https://cliniquelaprairie.com/",
  },
  "clinique-valmont": {
    name: "Clinique Valmont",
    location: "Glion, Montreux (Vaud)",
    img: "/images/clinics/clinique-valmont.jpg",
    founded: "1905",
    focus: "Orthopaedic and neurological rehabilitation",
    intro:
      "A rehabilitation clinic in Glion, high above Montreux with views of Lake Geneva and the Alps, welcoming patients since 1905. Today part of Swiss Medical Network, it focuses exclusively on orthopaedic and neurological rehabilitation with a 1,500 m² technical platform and a large team of physiotherapists, occupational and speech therapists.",
    description:
      "Clinique Valmont was founded in 1905 by Dr Henri Auguste Widmer and first welcomed patients with digestive disorders and neurasthenia in a setting that combined Alpine landscape, hotel-grade welcome and innovative treatments. In the 1980s it became the first clinic in Switzerland entirely dedicated to aesthetics before refocusing on rehabilitation in 1993, and it was acquired by Swiss Medical Network in 2006. Today the clinic concentrates exclusively on orthopaedic and neurological rehabilitation, treating patients after stroke, Parkinson's disease, multiple sclerosis, hip and knee replacements, fractures and spinal surgery. Its team of 25 physiotherapists and sports teachers, 12 occupational therapists and 9 speech therapists and neuropsychologists works across a 1,500 m² technical platform, with programmes supported by all supplementary health insurance providers.",
    highlights: [
      "Founded 1905; acquired by Swiss Medical Network in 2006",
      "Exclusively orthopaedic and neurological rehabilitation since 1993",
      "1,500 m² technical platform with state-of-the-art equipment",
      "Views over Lake Geneva and the Alps from Glion above Montreux",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.swissmedical.net/en/hospitals/valmont",
  },
  "clinique-de-la-source": {
    name: "Clinique de La Source",
    location: "Lausanne (Vaud)",
    img: "/images/clinics/clinique-de-la-source.jpg",
    founded: "1891",
    beds: "150",
    focus: "Full-service private hospital (acute care)",
    intro:
      "The largest private multidisciplinary acute-care clinic in the canton of Vaud, founded in 1891 in Lausanne. A private non-profit institution with 150 beds, 12 operating theatres, cardiac surgery heritage and one of the biggest radiology institutes in the canton, treating more than 100,000 patients a year.",
    description:
      "Clinique de La Source is the largest private institution offering multidisciplinary acute care in the canton of Vaud. It was founded in 1891 by Dr Charles Krafft, a European pioneer of appendectomies, who opened a clinic in his apartment in Lausanne. Today it belongs to the Fondation La Source, a private non-profit institution that also runs a renowned nursing school (now part of HES-SO). The clinic has 150 beds, 12 operating theatres plus 2 delivery rooms, a cardiac catheterisation laboratory, intensive care and imaging and interventional radiology. Its specialities span cardiology and cardiac surgery (a centre directed in its day by Prof. Charles Hahn, pioneer of coronary surgery in Europe), oncology and radio-oncology, orthopaedics and traumatology, gynaecology and obstetrics, urology (with a dedicated prostate centre), digestive diseases and more. It treats more than 100,000 patients every year.",
    highlights: [
      "Largest private multidisciplinary acute-care clinic in the canton of Vaud",
      "Founded 1891; belongs to the non-profit Fondation La Source",
      "150 beds, 12 operating theatres and 2 delivery rooms",
      "Historic centre for cardiac surgery and largest private imaging institute in the canton",
    ],
    fees: "Outpatient care is billed at the same rates as public hospitals under basic insurance; contact the clinic for inpatient pricing.",
    website: "https://www.lasource.ch/en/clinique-de-la-source",
  },
  "hirslanden-clinique-bois-cerf": {
    name: "Hirslanden Clinique Bois-Cerf",
    location: "Lausanne (Vaud)",
    img: "/images/clinics/hirslanden-clinique-bois-cerf.jpg",
    founded: "1892",
    beds: "68",
    focus: "Private hospital with orthopaedics, ophthalmology and oncology centres",
    intro:
      "A Hirslanden private hospital in the heart of Lausanne, founded by a religious community in 1892 and part of the Hirslanden Group since 1998. With 68 beds and around 340 affiliated specialists, it hosts centres of excellence in orthopaedic surgery, ophthalmology, oncology and cardiovascular rehabilitation.",
    description:
      "Hirslanden Clinique Bois-Cerf traces its origins to 1892, when the Trinitarian Sisters of Valence hired the Petit Bois-Cerf villa in Lausanne to care for the sick and poor; the community sold the clinic in 1987, and it joined the Hirslanden Private Hospital Group in 1998. Today it has 68 beds, 11 of them in continuous care, 5 operating theatres and around 340 affiliated specialists. The clinic hosts institutes and centres of excellence including an orthopaedic surgery centre, an ophthalmology centre, an oncology centre, a cardiovascular rehabilitation centre, an institute of lithotripsy, a radiology institute and a radiotherapy institute, as well as a sports laboratory. Its main specialities include orthopaedic surgery and traumatology, ophthalmology, oncology, spine surgery, urology, ENT and physical medicine and rehabilitation.",
    highlights: [
      "Part of the Hirslanden Group since 1998",
      "68 beds, 5 operating theatres, around 340 affiliated specialists",
      "Centres of excellence in orthopaedics, ophthalmology, oncology and cardiovascular rehabilitation",
      "Founded by a religious community in Lausanne in 1892",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.hirslanden.ch/en/clinique-bois-cerf/home.html",
  },
  "clinique-de-montchoisi": {
    name: "Clinique de Montchoisi",
    location: "Lausanne (Vaud)",
    img: "/images/clinics/clinique-de-montchoisi.jpg",
    founded: "1932",
    beds: "32",
    focus: "Ophthalmology, orthopaedics and ENT",
    intro:
      "A well-known private clinic in the heart of Lausanne, founded in 1932 and part of Swiss Medical Network since 2003. Every room looks onto Lake Geneva and the Alps, and the clinic concentrates on ophthalmology, orthopaedics and traumatology, ENT and plastic surgery.",
    description:
      "Clinique de Montchoisi was founded in 1932 by Prof. R. L. Rochat, a prominent gynaecologist, and has always been one of the most respected private establishments in the canton of Vaud. It joined Swiss Medical Network in 2003 and was subsequently renovated and modernised, with all rooms enjoying views over Lake Geneva and the Alps. Today the clinic concentrates on three main specialities — ophthalmology, orthopaedics and traumatology, and ENT — with a strong reputation in ophthalmology, particularly in the treatment of glaucoma and cataracts in partnership with the Swiss Visio network. It has 32 beds and around 100 collaborators, plus a radiology institute and a centre for physical and cognitive therapies covering physiotherapy, occupational therapy, speech therapy and neuropsychology.",
    highlights: [
      "Founded 1932; part of Swiss Medical Network since 2003",
      "32 beds with views over Lake Geneva and the Alps",
      "Renowned in ophthalmology, especially glaucoma and cataract treatment",
      "Centres for orthopaedics, hand surgery, ENT and physical and cognitive therapies",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.swissmedical.net/en/hospitals/montchoisi",
  },
  "hopital-de-la-tour": {
    name: "Hôpital de La Tour",
    location: "Meyrin, Geneva",
    img: "/images/clinics/hopital-de-la-tour.jpg",
    founded: "1976",
    beds: "190",
    focus: "Full-service private hospital (acute care)",
    intro:
      "Geneva's largest private hospital, founded in 1976 in Meyrin on the city's right bank and the only private hospital in French-speaking Switzerland with a 24/7 emergency department, certified intensive care and a neonatal unit. A teaching hospital with 190 beds, 11 operating theatres and 2 cardiac catheterisation laboratories.",
    description:
      "Hôpital de La Tour was inaugurated on 22 October 1976 in Meyrin, becoming the first hospital on Geneva's right bank, born of the vision of three physicians to meet the needs of a rapidly growing region. It is today the largest private hospital in the canton of Geneva and the only private institution in French-speaking Switzerland to offer the full range of services normally reserved for university hospitals: a 24/7 emergency department, an SSMI-certified intensive care unit, a progressive care unit and a neonatal intensive care unit, as well as internal medicine and pulmonology departments. It has 190 beds, 11 operating theatres, 2 cardiac catheterisation laboratories and 4 delivery rooms, and hosts the Swiss Olympic Medical Centre for sports medicine. As a teaching hospital it runs 12 training programmes welcoming around 40 physicians and fellows a year. Its main clinical focuses are orthopaedics, sports medicine, cancer, cardiopulmonary disease and heart surgery, women's and children's care, and metabolic disease and obesity.",
    highlights: [
      "Largest private hospital in the canton of Geneva, founded 1976",
      "Only private hospital in French-speaking Switzerland with 24/7 emergency, certified ICU and neonatal unit",
      "190 beds, 11 operating theatres, 2 cardiac catheterisation laboratories",
      "Teaching hospital hosting the Swiss Olympic Medical Centre",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.la-tour.ch/en",
  },
  "clinique-des-grangettes": {
    name: "Hirslanden Clinique des Grangettes",
    location: "Chêne-Bougeries, Geneva",
    img: "/images/clinics/clinique-des-grangettes.jpg",
    founded: "1933",
    beds: "117",
    focus: "Maternity, cardiology, oncology and emergencies",
    intro:
      "A renowned Hirslanden private hospital in Chêne-Bougeries near Geneva, founded in 1933. Its main specialities are the mother-and-child sector — it is the first private maternity hospital in Switzerland, with over 900 births a year — plus cardiology, oncology and emergencies, with more than 900 approved doctors and surgeons.",
    description:
      "Hirslanden Clinique des Grangettes grew out of the Pouponnière de l'Oeuvre des Amis de l'Enfance, founded in 1918 by Barbara Borsinger to treat children during the Spanish flu epidemic; in 1933 it expanded to adult care and moved to Chêne-Bougeries, where the Clinique des Grangettes was born. Managed by the nuns of Menzingen from 1957 to 1978, it developed one of the first premature-baby units in the country. Today the clinic is part of the Hirslanden Group and is best known for its mother-and-child sector: it is the first private maternity hospital in Switzerland and one of the most experienced, with more than 900 births a year. Its other main specialities are cardiology, oncology and emergencies, and it counts more than 900 approved doctors and surgeons. The clinic has 117 beds and treats around 6,000 inpatients a year, with gynaecology and obstetrics, orthopaedics and sports medicine, visceral surgery, urology and cardiology among its largest departments.",
    highlights: [
      "First private maternity hospital in Switzerland, over 900 births a year",
      "Founded 1933; part of the Hirslanden Group",
      "117 beds and more than 900 approved doctors and surgeons",
      "Main specialities: mother-and-child care, cardiology, oncology and emergencies",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.hirslanden.ch/en/clinique-des-grangettes/home.html",
  },
  "clinique-generale-beaulieu": {
    name: "Clinique Générale-Beaulieu",
    location: "Geneva",
    img: "/images/clinics/clinique-generale-beaulieu.jpg",
    founded: "1899",
    beds: "115",
    focus: "Surgery, oncology, urology, gynaecology and maternity",
    intro:
      "Geneva's second-largest private clinic, founded in 1899 and part of Swiss Medical Network since 2016. A recognised centre of expertise in robotic surgery, it has 115 beds, 9 operating theatres, a maternity ward and one of the country's main centres for medically assisted reproduction.",
    description:
      "Clinique Générale-Beaulieu was founded in Geneva in 1899 and is today the second-largest private clinic in the city, with 115 beds, 9 operating theatres (two dedicated to outpatient surgery), around 400 employees and more than 600 registered doctors and specialists. It joined Swiss Medical Network in 2016 and was the first clinic in French-speaking Switzerland to obtain ISO-9001 certification across all its activities. It is a recognised centre of expertise in robotic surgery, and its main specialities are orthopaedics, oncology and radiotherapy, general surgery, neurosurgery, ophthalmology, urology, ENT and gynaecology and obstetrics. It runs a maternity ward with around 700 births a year, one of the country's leading centres for medically assisted reproduction, an institute of radiology and nuclear medicine, and a physiotherapy and functional rehabilitation centre including a sports-medicine unit. The clinic carries out around 5,000 hospitalisations a year for an average stay of five days.",
    highlights: [
      "Founded 1899; part of Swiss Medical Network since 2016",
      "Second-largest private clinic in Geneva: 115 beds and 9 operating theatres",
      "Recognised centre of expertise in robotic surgery",
      "Maternity, medically assisted reproduction and radiology institutes",
    ],
    fees: "Contact the clinic directly for pricing.",
    website: "https://www.swissmedical.net/en/hospitals/generale-beaulieu",
  },
};
