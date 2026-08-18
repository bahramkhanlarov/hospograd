// Swiss personal-finance guides, used by the /finance landing page and the
// /finance/[slug] detail pages. Mirrors lib/specialties.ts.
//
// The guides are original HospoGrad content written for students and recent
// graduates of Swiss hospitality schools: first salary, taxes, health
// insurance, banking, budgeting and saving. Figures are verified against the
// official sources listed under each guide (admin.ch, bag.admin.ch,
// priminfo.admin.ch) and against the independent Swiss FIRE blog Mustachian
// Post, which is cited as further reading rather than copied.

export interface FinanceGuideSection {
  heading: string;
  body: string;
}

export interface FinanceGuideSource {
  label: string;
  url: string;
}

export interface FinanceGuideInfo {
  name: string;
  intro: string;
  description: string;
  sections: readonly FinanceGuideSection[];
  sources: readonly FinanceGuideSource[];
}

export const FINANCE_GUIDES: Record<string, FinanceGuideInfo> = {
  "first-salary": {
    name: "Your First Salary in Switzerland",
    intro:
      "What actually lands in your bank account, and what gets taken out before it does.",
    description:
      "A Swiss employment contract quotes a gross annual salary, but the number you see in your contract is not the number you can spend. Between the social-insurance deductions, pension contributions and income tax, roughly 15–20% of a typical hospitality salary is deducted before it reaches your account. Understanding each line of your payslip — and what you are legally entitled to — is the first step to actually building savings in Switzerland.",
    sections: [
      {
        heading: "The 13th salary and the monthly rhythm",
        body: "Most Swiss employment contracts for full-time staff include a 13th monthly salary, paid in two half-payments (typically in summer and December). The 13th is taxed and deducted from just like the other twelve. Some contracts in hospitality include 'in-kind' benefits — meals, accommodation or uniform — and these may have a taxable value, so ask your HR department exactly how the gross figure is composed before you accept an offer.",
      },
      {
        heading: "Social-insurance deductions you cannot avoid",
        body: "The statutory deductions are the same for every employee in Switzerland and are split between you and your employer. From your gross salary you pay 5.3% for OASI (AHV/AVS), 1.4% for disability insurance (IV/AI) and 0.5% for loss-of-earnings compensation (EO/APG) — together roughly 7.05% — plus unemployment insurance (ALV/AC), which ranges around 1.1% depending on your income. Your employer pays at least the same amount on top, which is why your gross figure never matches your net figure.",
      },
      {
        heading: "Pension deductions (2nd pillar)",
        body: "If you are over 24 and earn more than the coordination threshold (around CHF 25,000 gross a year in 2025), you are automatically enrolled in the occupational pension scheme, the 2nd pillar (BVG/LPP). Your contribution starts at around 7% of the insured salary for the youngest employees and rises with age. These deductions are painful on a first payslip, but they are forced savings: your employer contributes at least as much as you do, and the money grows tax-free until retirement.",
      },
      {
        heading: "Income tax: Quellensteuer or a tax return",
        body: "Whether your employer deducts income tax directly depends on your residence status. If you do not hold a C permit (permanent residence), your employer deducts 'tax at source' (Quellensteuer) from your salary every month, and the rate depends on your canton and salary. If you hold a C permit or Swiss citizenship, you generally do not pay at source and instead file an annual tax return. You can read more about Quellensteuer in the dedicated guide below.",
      },
    ],
    sources: [
      { label: "AHV/IV – salary contributions (official)", url: "https://www.ahv-iv.ch/p/2.01.e" },
      { label: "BSV – overview of social security contributions (official)", url: "https://www.bsv.admin.ch/en/contributions-overview" },
    ],
  },
  "quellensteuer": {
    name: "Tax at Source (Quellensteuer)",
    intro:
      "How income tax works when your employer withholds it from your salary — and when you still need to file a return.",
    description:
      "Tax at source is the way Switzerland collects income tax from most foreign nationals who do not yet hold a C permit. Instead of receiving a tax bill after the year ends, your employer withholds tax from each monthly salary and forwards it to your canton. For many students and new graduates this is genuinely simpler — the tax is already paid — but there are important cases where you must still file an ordinary tax return.",
    sections: [
      {
        heading: "Who is taxed at source",
        body: "You are generally taxed at source if you are employed in Switzerland, do not hold a C permit, and earn less than the annual threshold for mandatory ordinary taxation (around CHF 120,000 in most cantons). Cross-border commuters living in France, Germany, Italy or Austria are also taxed at source. The withheld amount is based on your gross salary and your personal situation (single, married, with or without children), and the employer applies the rate from an official table.",
      },
      {
        heading: "When you must still file a tax return",
        body: "Even while taxed at source, you may be asked to file an ordinary tax return — for example if your annual income is high, if you have significant other income, if your net wealth is large, or if your canton requires it for married couples with two incomes. Some cantons also allow you to request ordinary taxation voluntarily, which can work in your favour when you have large deductions such as a 3a contribution. When in doubt, ask the cantonal tax office.",
      },
      {
        heading: "What changes when you get a C permit",
        body: "Once you hold a C permit (permanent residence) — typically after five or ten years of residence, depending on your nationality and permit type — you are no longer taxed at source. From then on you file an annual tax return and receive an assessment after the fact. This can feel like a surprise bill after a year of no withholding, so the first year after the change is a good moment to set money aside.",
      },
    ],
    sources: [
      { label: "Canton of Zurich – leaflet for employees taxed at source (PDF)", url: "https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/steuern-finanzen/steuern/quellensteuer/infobl%C3%A4tter/div_q_informationsblatt_qs_2025_EN.pdf" },
      { label: "Remote – payroll taxes in Switzerland (employer's guide)", url: "https://remote.com/blog/taxes/payroll-taxes-switzerland" },
    ],
  },
  "health-insurance": {
    name: "Health Insurance in Switzerland",
    intro:
      "The mandatory basic insurance you must take out within three months of arriving — and how to keep the premium low.",
    description:
      "Basic health insurance (Krankenpflegeversicherung, or LAMal/KVG) is compulsory for everyone residing in Switzerland. You must sign up with an approved insurer within three months of taking up residence — if you miss the deadline the canton assigns you an insurer and you may owe back premiums. There is no way around this cost, but how much you pay is partly within your control: the choice of deductible, insurer and insurance model can move your monthly premium by well over a hundred francs.",
    sections: [
      {
        heading: "How much it costs",
        body: "The average basic premium for 2026 is CHF 393 per month, and for young adults (18–25) around CHF 326. Premiums vary strongly by canton and even by region within a canton — roughly CHF 240–300 in the cheapest cantons, CHF 400+ in Geneva and Basel. You can compare all approved insurers and premium regions free of charge on priminfo.admin.ch, the official government comparison tool.",
      },
      {
        heading: "The deductible (franchise) choice",
        body: "You choose an annual deductible between CHF 300 (the standard) and CHF 2,500. A higher deductible lowers your monthly premium, because you pay the first part of your own medical bills yourself. The rule of thumb for young, healthy people: if you rarely need care, a high deductible usually works out cheaper; if you have regular treatment, stay low. Remember that you also pay 10% of your own treatment costs above the deductible, capped at CHF 700 a year, plus CHF 15 per day in hospital.",
      },
      {
        heading: "Alternative models and premium reductions",
        body: "Choosing a managed-care model — a family doctor, telemedicine or HMO model instead of free choice of doctor — typically cuts the premium by 10–25%. On top of that, many students qualify for a cantonal premium reduction (Prämienverbilligung): cantons must reduce the premiums of young adults in education by at least 50% in many cases, and some cantons apply the reduction automatically while others require an application. Check your canton's rules early in the semester.",
      },
    ],
    sources: [
      { label: "FOPH – health insurance premium FAQs (official)", url: "https://www.bag.admin.ch/en/premiums-and-costs-answers-to-frequently-asked-questions" },
      { label: "FOPH – premium comparison (official)", url: "https://www.bag.admin.ch/en/health-insurance-comparison-of-premiums" },
      { label: "Priminfo – official insurance comparison", url: "https://www.priminfo.admin.ch" },
    ],
  },
  "banking": {
    name: "Banking & Money Apps in Switzerland",
    intro:
      "Opening a Swiss account, choosing a low-fee bank, and using budgeting apps the way Swiss FIRE bloggers do.",
    description:
      "You will need a Swiss bank account (or a fintech alternative) for your salary, rent payments and the QR-bill payments that Swiss invoicing relies on. Traditional cantonal banks charge CHF 5–10 a month for a basic package, but a growing number of free alternatives — from Neobank to the Bank WIR 'Bankpaket top' — offer zero-cost accounts and cards. This guide covers what to look for and how to keep banking fees to basically zero.",
    sections: [
      {
        heading: "Free banking is realistic",
        body: "Several providers now offer genuinely free Swiss accounts with a Maestro or Mastercard debit card, including Bank WIR's Bankpaket top, Neobank and Yuh (Swissquote's fintech). If you open an account before your salary is due, many banks also handle direct deposit as standard. Always check the small print for hidden fees — foreign-currency transactions, ATM withdrawals outside Switzerland and paper statements are where banks quietly make money.",
      },
      {
        heading: "A credit card is optional — and fees add up",
        body: "Swiss credit cards rarely earn meaningful rewards, and many charge a yearly fee. For everyday spending a debit card is enough. If you travel, the real costs to watch are the exchange-rate margin and foreign-transaction fees, which can run to 2% of every purchase abroad. The Mustachian Post keeps a running comparison of the cheapest Swiss credit cards, and it regularly saves readers several hundred francs a year on card fees abroad.",
      },
      {
        heading: "Budgeting apps for Swiss finances",
        body: "The Swiss FIRE community heavily favours YNAB (You Need A Budget) for envelope-style budgeting, and it is often quoted as the tool that turned regular salaries into a real savings rate. Free alternatives exist, but whatever you choose, the important habit is the same: give every franc a job before the month starts. Most Swiss salary recipients also set up a standing order to a savings or 3a account on payday, so saving happens before spending can.",
      },
    ],
    sources: [
      { label: "Mustachian Post – Bank WIR Bankpaket top review", url: "https://www.mustachianpost.com/wir-bankpaket-top-review/" },
      { label: "Mustachian Post – card fees abroad (2026)", url: "https://www.mustachianpost.com/blog/save-on-card-fees-abroad/" },
      { label: "Mustachian Post – best Swiss credit cards", url: "https://www.mustachianpost.com/best-credit-card-switzerland/" },
    ],
  },
  "pillar-3a": {
    name: "Pillar 3a: The Tax-Saving Retirement Account",
    intro:
      "The voluntary Swiss retirement account that cuts your tax bill today and grows tax-free for decades.",
    description:
      "Pillar 3a is the voluntary, tax-privileged savings account at the heart of Swiss retirement planning. Any employed person with OASI income can pay in every year, deduct the full contribution from their taxable income, and watch the money grow without tax until it is withdrawn. For a young hospitality professional it is often the single most tax-efficient place to save — the annual contribution limit is roughly CHF 7,000, and the tax saving can be CHF 1,000–2,000 a year depending on your canton and salary.",
    sections: [
      {
        heading: "How much you can pay in",
        body: "For 2026 the maximum annual contribution is CHF 7,258 if you have an occupational pension (2nd pillar) — which almost every employee does — and up to CHF 36,288 (or 20% of net income) if you do not. You can open a 3a account or fund at any bank, insurance company or fintech, and split the annual maximum across several providers if you want. Payments must reach the provider by 31 December to count for that tax year.",
      },
      {
        heading: "Why the tax math works for you",
        body: "You deduct the contribution from your taxable income, so at an CHF 80,000 salary the tax saving is typically CHF 1,000–2,000 per year depending on where you live. The money inside the account grows free of income and wealth tax, and is not touched by wealth tax either. When you finally withdraw it — after the earliest permitted age — it is taxed separately at a reduced rate. Withdrawing in stages, rather than all at once, keeps that final tax rate lower.",
      },
      {
        heading: "Interest, funds and long horizons",
        body: "Classic 3a accounts at banks currently pay around 1% interest; 3a investment solutions hold ETFs and can compound much faster over a 20–40 year horizon, though they carry market risk. Because a 3a withdrawal before retirement age is only possible for a few specific reasons (buying a home, starting a business, leaving Switzerland for good), money you may need soon should not go here. For savings you will not touch for years, the tax shelter makes 3a hard to beat.",
      },
    ],
    sources: [
      { label: "FDF – maximum 3a deductions for 2026 (official)", url: "https://www.admin.ch/de/newnsb/xgRMirCsezICX4rtof9Lm" },
      { label: "UBS – pillar 3a maximum contributions 2026", url: "https://www.ubs.com/ch/en/services/pension/pillar-3/maximal-contribution.html" },
      { label: "Mustachian Post – switching pillar 3a: when, costs, why", url: "https://www.mustachianpost.com/blog/switch-pillar-3a-when-costs-why/" },
    ],
  },
  "budgeting": {
    name: "Budgeting & Saving on a Swiss Salary",
    intro:
      "Making a 50–80% savings rate realistic on a normal salary — the way the Swiss FIRE community actually does it.",
    description:
      "Swiss salaries are among the highest in Europe, and so is the cost of living. The good news for anyone starting a career is that the 'save as much as you can, early' principle works unusually well here, because wages outpace most people's expenses within a few years. The Swiss FIRE community — bloggers like Mustachian Post and their readers — regularly reach savings rates of 50–80%, and the methods are simple enough to start on a first salary.",
    sections: [
      {
        heading: "Build the budget backwards",
        body: "The method that works is 'pay yourself first': set the savings target at the start of the month — a standing order to savings and 3a on payday — and live on the rest. Envelope budgeting (YNAB-style) forces every franc to have a job, which is what catches the small leaks that add up to hundreds of francs a month. The Mustachian Post documented exactly this path from CHF 48,500 to over CHF 2 million in 13 years, and the boring middle of that journey was simply a consistent savings rate.",
      },
      {
        heading: "Where the money actually goes",
        body: "For a young single person the big three are housing (rent plus utilities, typically CHF 1,000–1,500 a month for a shared or small flat), health insurance (CHF 250–450) and food. Groceries in Switzerland can be brutal if you buy the same branded products as at home — shopping discounters like Aldi and Lidl, cooking at home, and dropping the daily café habit are the fastest wins. Housing is the one item where a flatmate or a smaller place changes the savings rate most.",
      },
      {
        heading: "Automate, then don't look",
        body: "The people who actually reach financial independence are not the ones who think about money every day; they are the ones who automated savings and index investing and then got on with their career. The case studies the FIRE community publishes — including one from Geneva with a 78% savings rate and a CHF 2.35 million net worth at 45 — share a pattern: raise the savings rate early, invest in low-cost index funds, and let the salary increases compound. The first year is the hardest; it only gets easier.",
      },
    ],
    sources: [
      { label: "Mustachian Post – the FIRE boring middle: 13 years", url: "https://www.mustachianpost.com/blog/boring-middle-fire/" },
      { label: "Mustachian Post – FIRE in Geneva at 45 (case study)", url: "https://www.mustachianpost.com/blog/financial-independence-geneva-case-study/" },
      { label: "Mustachian Post – YNAB review", url: "https://www.mustachianpost.com/ynab-review/" },
    ],
  },
  "investing": {
    name: "Investing: Getting Started with Index Funds",
    intro:
      "Low-cost ETF investing in Switzerland — where to open an account, and why simplicity beats stock-picking.",
    description:
      "For most people the long-term savings engine is not the bank account but low-cost index funds (ETFs). Switzerland has a well-regulated set of discount brokers — Interactive Brokers, DEGIRO and Saxo Bank are the three most recommended by the Swiss FIRE community — where you can buy world index ETFs for small monthly amounts. The core idea is deliberately boring: own the whole global market, keep costs tiny, and let decades of compounding do the work.",
    sections: [
      {
        heading: "Why index funds, not individual stocks",
        body: "A single world index ETF holds thousands of companies across dozens of countries in one purchase, which diversifies away the risk of betting on any one stock or country. The fees matter enormously over 30 years: a 0.2% fund fee versus a 1.5% actively managed fund can easily mean six figures of difference in final wealth. The Swiss FIRE bloggers who retired early did it with this approach, not with picking winners.",
      },
      {
        heading: "Choosing a broker",
        body: "The three discount brokers most recommended for Swiss residents — Interactive Brokers, DEGIRO and Saxo Bank — all offer low or zero commission on recurring ETF purchases and access to world index ETFs. Which one is cheapest depends on your purchase size and frequency, and the Mustachian Post keeps a regularly updated full comparison. If you are also building a 3a, many banks now let you invest that too, rather than leaving it in a 1% account.",
      },
      {
        heading: "Starting small, staying consistent",
        body: "You do not need a big starting amount: monthly savings plans let you buy fractions of an ETF for as little as CHF 50–100. The key variables are the savings rate (see the budgeting guide) and time in the market — not timing the market. Historically, long horizons have smoothed out every crash, which is why the advice from the FIRE community is always the same: start early, automate the monthly purchase, and resist the urge to check the balance during a panic.",
      },
    ],
    sources: [
      { label: "Mustachian Post – best broker for Swiss investors", url: "https://www.mustachianpost.com/best-broker-in-switzerland/" },
      { label: "Mustachian Post – tracking Interactive Brokers in YNAB", url: "https://www.mustachianpost.com/blog/track-interactive-brokers-ynab/" },
    ],
  },
};