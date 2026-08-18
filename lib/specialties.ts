// Medical specialty data, used by the medical page (specialty pills) and the
// /medical/[slug] detail pages. Mirrors lib/clinics.ts.
//
// Each specialty lists the clinics in lib/clinics.ts that actually treat it,
// based on the focus areas verified against the clinics' official websites.
// Generalist private hospitals (Hirslanden, Clinique de Genolier) treat most
// specialties, so they are listed wherever their published departments cover
// them; specialist rehab clinics are listed only for their core focus.

export interface SpecialtyInfo {
  name: string;
  intro: string;
  description: string;
  clinics: readonly string[];
}

export const SPECIALTIES: Record<string, SpecialtyInfo> = {
  aesthetics: {
    name: "Aesthetics",
    intro:
      "Non-surgical aesthetic treatments, regenerative medicine and anti-ageing programmes.",
    description:
      "Aesthetic medicine covers non-surgical procedures such as injectables, skin treatments, laser and regenerative therapies. In Switzerland it is frequently paired with preventive and lifestyle medicine, particularly at clinics that combine medical check-ups with aesthetic care. Treatment is almost always private and prices vary widely by clinic and procedure, so it is worth requesting a full quote before committing.",
    clinics: ["clinique-nescens", "clinique-la-prairie", "clinique-de-genolier"],
  },
  angiology: {
    name: "Angiology",
    intro:
      "Diagnosis and treatment of conditions of the arteries, veins and lymph vessels.",
    description:
      "Angiology deals with vascular diseases — peripheral artery disease, varicose veins, deep-vein thrombosis and lymphoedema. Care typically combines ultrasound diagnostics, medication and minimally invasive procedures such as angioplasty or vein treatment. Swiss rehabilitation clinics treat vascular patients recovering from surgery, while full-service hospitals run dedicated vascular departments.",
    clinics: ["klinik-schloss-mammern", "hirslanden-klinik-aarau", "klinik-hirslanden"],
  },
  cardiology: {
    name: "Cardiology",
    intro:
      "Heart and circulatory care, from diagnosis to cardiac rehabilitation.",
    description:
      "Cardiology covers the diagnosis and treatment of heart disease — coronary artery disease, heart failure, arrhythmias and hypertension. Patients come either for acute and interventional care at a full-service hospital, or for structured cardiac rehabilitation after surgery or a cardiac event. Swiss cardiac rehab programmes combine supervised exercise, medication management and lifestyle coaching, and several clinics run them in an alpine setting.",
    clinics: ["rehaklinik-seewis", "klinik-schloss-mammern", "clinique-de-la-source", "hopital-de-la-tour", "clinique-des-grangettes", "hirslanden-klinik-aarau", "klinik-hirslanden"],
  },
  dermatology: {
    name: "Dermatology",
    intro:
      "Skin, hair and nail conditions, including skin-cancer screening.",
    description:
      "Dermatology treats skin, hair and nail conditions, from eczema and psoriasis to skin-cancer screening and treatment. Private hospitals offer dermatology as part of their outpatient and aesthetic departments, and medical check-up programmes often include a dermatological exam as standard. Skin-cancer screening is particularly relevant for patients who have spent years in strong sun.",
    clinics: ["clinique-de-genolier", "clinique-generale-beaulieu", "clinique-de-la-source", "hirslanden-clinique-bois-cerf", "klinik-hirslanden"],
  },
  endocrinology: {
    name: "Endocrinology",
    intro:
      "Hormone disorders, diabetes, thyroid and metabolic conditions.",
    description:
      "Endocrinology manages hormone-producing glands and the conditions they cause — diabetes, thyroid disease, adrenal and pituitary disorders, and metabolic imbalance. It is a core part of internal medicine at full-service hospitals, and metabolic or hormonal rehabilitation is offered at clinics specialising in internal-organ recovery. Medical check-up programmes typically include the relevant blood panels.",
    clinics: ["klinik-schloss-mammern", "hirslanden-klinik-aarau", "klinik-hirslanden"],
  },
  gastroenterology: {
    name: "Gastroenterology",
    intro:
      "Disorders of the digestive tract, liver and pancreas.",
    description:
      "Gastroenterology covers the digestive system — the oesophagus, stomach, intestines, liver and pancreas. Private hospitals offer outpatient consultations, endoscopy and colonoscopy, and treatment for conditions such as reflux, inflammatory bowel disease and liver disease. Digestive problems are also a common focus of internal and psychosomatic rehabilitation, where stress and eating habits are addressed together.",
    clinics: ["clinique-de-la-source", "hirslanden-clinique-bois-cerf", "hirslanden-klinik-aarau", "clinique-generale-beaulieu", "klinik-hirslanden", "clinique-de-genolier"],
  },
  hematology: {
    name: "Hematology",
    intro:
      "Disorders of the blood, bone marrow and lymphatic system.",
    description:
      "Hematology deals with diseases of the blood and blood-forming organs, including anaemia, clotting disorders and blood cancers such as leukaemia and lymphoma. In Switzerland it is closely linked with oncology, and patients are usually treated at hospitals with dedicated haematology-oncology units. After cancer treatment, haematology patients may move into internal-oncological rehabilitation.",
    clinics: ["clinique-de-genolier", "clinique-des-grangettes", "clinique-de-la-source", "clinique-generale-beaulieu", "klinik-hirslanden"],
  },
  checkup: {
    name: "Medical Check-Up",
    intro:
      "Comprehensive preventive health assessments, usually over one to three days.",
    description:
      "A medical check-up is a structured preventive assessment that screens for risk factors and early-stage disease. Swiss private check-ups typically run over one to three days and combine blood panels, imaging, cardiac testing and specialist consultations, with results compiled into a single report. Clinique Nescens in Genolier specialises in this format and publishes its packages and prices, while Clinique La Prairie in Montreux offers its Health Diagnostic Assessment built around more than 50 specialists; the approach is popular with executives and international patients.",
    clinics: ["clinique-nescens", "clinique-la-prairie"],
  },
  nephrology: {
    name: "Nephrology",
    intro:
      "Kidney disease, including dialysis and post-transplant care.",
    description:
      "Nephrology manages diseases of the kidneys — chronic kidney disease, kidney stones, glomerular disease and hypertension-related damage. Care ranges from medication and lifestyle management to dialysis and follow-up after transplant. Full-service private hospitals run nephrology departments, while rehabilitation clinics support patients recovering from kidney disease or surgery through internal-organ programmes.",
    clinics: ["klinik-schloss-mammern", "hirslanden-klinik-aarau"],
  },
  neurology: {
    name: "Neurology",
    intro:
      "Disorders of the brain, spinal cord and nervous system.",
    description:
      "Neurology covers disorders of the brain and nervous system — stroke, epilepsy, Parkinson's disease, multiple sclerosis and neuropathy. Acute care happens at full-service hospitals with neurology departments and certified stroke centres. Recovery continues at specialised neurorehabilitation clinics, which use intensive physiotherapy, robotics and technology to retrain movement and speech after a stroke or brain injury.",
    clinics: ["cereneo-hertenstein", "rehaklinik-tschugg", "clinique-valmont", "klinik-adelheid", "clinique-de-la-source", "hopital-de-la-tour", "klinik-hirslanden"],
  },
  obgyn: {
    name: "Obstetrics and Gynecology",
    intro:
      "Women's health, pregnancy and childbirth care.",
    description:
      "Obstetrics and gynaecology covers women's health — routine gynaecological care, contraception, fertility, pregnancy and childbirth. Swiss private hospitals offer maternity units with hotel-style private rooms, and gynaecological surgery including minimally invasive and robotic procedures. Gynaecological oncology is treated at hospitals with dedicated women's cancer units.",
    clinics: ["klinik-hirslanden", "clinique-des-grangettes", "clinique-generale-beaulieu", "clinique-de-la-source", "hopital-de-la-tour"],
  },
  oncology: {
    name: "Oncology",
    intro:
      "Cancer diagnosis and treatment, including radio-oncology and palliative care.",
    description:
      "Oncology covers the diagnosis and treatment of cancer through surgery, chemotherapy, radiotherapy, immunotherapy and targeted therapies. Switzerland is known for advanced cancer care, with private centres such as Clinique de Genolier offering modern radio-oncology and ESMO-recognised integrated care. After treatment, patients move into oncological rehabilitation, which supports recovery of strength, nutrition and quality of life.",
    clinics: ["clinique-de-genolier", "rehaklinik-seewis", "klinik-schloss-mammern", "clinique-des-grangettes", "clinique-de-la-source", "clinique-generale-beaulieu", "hirslanden-clinique-bois-cerf", "hopital-de-la-tour", "hirslanden-klinik-aarau"],
  },
  ophthalmology: {
    name: "Ophthalmology",
    intro:
      "Eye care, including cataract and refractive surgery.",
    description:
      "Ophthalmology covers diseases of the eye and vision — cataract, glaucoma, macular degeneration and refractive error. Treatment includes eye examinations, medication, laser procedures and surgery. Private hospitals offer ophthalmology through outpatient departments and surgical centres, and cataract surgery is one of the most common procedures performed at Swiss private clinics.",
    clinics: ["clinique-de-montchoisi", "clinique-de-genolier", "clinique-generale-beaulieu", "hirslanden-clinique-bois-cerf", "klinik-hirslanden"],
  },
  orthopaedics: {
    name: "Orthopaedics",
    intro:
      "Bones, joints, ligaments and spine, including joint replacement.",
    description:
      "Orthopaedics treats injuries and diseases of the musculoskeletal system — joints, bones, ligaments, tendons and the spine. It ranges from sports injuries and conservative therapy to joint replacement and spinal surgery. Recovery after orthopaedic surgery is supported by rehabilitation clinics with musculoskeletal programmes, which restore mobility, strength and function.",
    clinics: ["clinique-valmont", "klinik-adelheid", "klinik-schloss-mammern", "hopital-de-la-tour", "clinique-de-la-source", "clinique-generale-beaulieu", "clinique-de-montchoisi", "hirslanden-clinique-bois-cerf", "hirslanden-klinik-aarau", "klinik-hirslanden"],
  },
  ent: {
    name: "Otorhinolaryngology",
    intro:
      "Ear, nose and throat conditions, including hearing and sinus surgery.",
    description:
      "Otorhinolaryngology (ENT) covers the ear, nose, throat, and structures of the head and neck — hearing loss, sinusitis, tonsillitis, voice disorders and head-and-neck conditions. Treatment includes medical management and surgery, from minor procedures to complex head-and-neck surgery. Private hospitals offer ENT through outpatient departments and day-surgery units.",
    clinics: ["hirslanden-klinik-aarau", "clinique-de-genolier", "clinique-de-montchoisi", "clinique-generale-beaulieu"],
  },
  psychiatry: {
    name: "Psychiatry",
    intro:
      "Mental health care, including depression, anxiety and burnout.",
    description:
      "Psychiatry diagnoses and treats mental health conditions — depression, anxiety, burnout and psychosomatic disorders. In Switzerland, psychiatric care is often delivered through psychosomatic and psychiatric rehabilitation clinics, where therapy is combined with medical oversight in a residential setting. These programmes are common for professionals recovering from burnout and for patients whose physical symptoms have a psychological component.",
    clinics: ["rehaklinik-seewis"],
  },
  pulmonology: {
    name: "Pulmonology",
    intro:
      "Lung and respiratory conditions, including pulmonary rehabilitation.",
    description:
      "Pulmonology covers diseases of the lungs and airways — asthma, COPD, pneumonia and sleep-disordered breathing. Acute care is delivered at full-service hospitals, while pulmonary rehabilitation helps patients with chronic lung disease improve exercise tolerance and manage symptoms. Rehabilitation clinics with pulmonary programmes combine supervised exercise, breathing training and education.",
    clinics: ["klinik-schloss-mammern", "hirslanden-klinik-aarau"],
  },
  rehabilitation: {
    name: "Rehabilitation",
    intro:
      "Structured recovery programmes after illness, surgery or injury.",
    description:
      "Rehabilitation helps patients regain strength, mobility and independence after illness, surgery or injury. Swiss rehab clinics are highly structured: neurologists, physiotherapists, occupational therapists and nursing teams work together on a personalised plan, often in hotel-grade facilities with lake or alpine views. Programmes exist for cardiac, neurological, musculoskeletal, oncological, pulmonary and psychosomatic recovery, and are covered by Swiss health insurance where medically indicated.",
    clinics: ["cereneo-hertenstein", "rehaklinik-seewis", "klinik-schloss-mammern", "rehaklinik-tschugg", "clinique-valmont", "klinik-adelheid"],
  },
  rheumatology: {
    name: "Rheumatology",
    intro:
      "Autoimmune and inflammatory conditions of the joints and connective tissue.",
    description:
      "Rheumatology treats autoimmune and inflammatory conditions — rheumatoid arthritis, osteoarthritis, lupus, gout and related connective-tissue disease. Care combines medication to slow disease progression with physiotherapy to preserve joint function. Rehabilitation clinics with musculoskeletal and internal-organ programmes provide structured exercise and pain management during flare-ups and recovery.",
    clinics: ["klinik-schloss-mammern", "clinique-valmont", "clinique-de-la-source", "hirslanden-clinique-bois-cerf", "klinik-adelheid"],
  },
  urology: {
    name: "Urology",
    intro:
      "Urinary tract and male reproductive system, including prostate care.",
    description:
      "Urology covers the urinary tract and male reproductive system — prostate conditions, kidney stones, urinary incontinence and urological cancers. Treatment includes medication, minimally invasive procedures and robotic surgery, with prostate care among the most common reasons men seek private urology care. Full-service private hospitals run dedicated urology departments with modern surgical technology.",
    clinics: ["hirslanden-klinik-aarau", "clinique-de-la-source", "clinique-generale-beaulieu", "clinique-des-grangettes", "klinik-hirslanden"],
  },
};