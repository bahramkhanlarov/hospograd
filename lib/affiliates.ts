// Affiliate / referral program registry, used by the /tools page and the
// "Tools we recommend" callouts on finance guide pages.
//
// Each entry has a base URL plus an optional tracking parameter and value.
// Until you register with a programme and paste your code into
// AFFILIATE_CODES below, the plain URL renders with no tracking — the
// infrastructure is what ships now, the codes are one-edits-per-program.
//
// Every page that renders these links must include the AffiliateDisclosure
// component (components/affiliate/affiliate-disclosure.tsx) so we stay
// transparent about the commission, per FTC guidelines and the spirit of
// the site's "student-run, independent" positioning.

export type AffiliateCategory =
  | "banking"
  | "insurance"
  | "investing"
  | "budgeting";

export interface AffiliateProgram {
  slug: string;
  name: string;
  category: AffiliateCategory;
  description: string;
  url: string;
  trackingParam?: string;
  trackingValue?: string;
  note?: string;
}

// Paste your registered tracking codes here. Empty values render plain links.
const AFFILIATE_CODES: Record<string, string> = {
  yuh: "",
  "interactive-brokers": "",
  degiro: "",
  "saxo-bank": "",
  ynabs: "",
  comparis: "",
};

export const AFFILIATE_PROGRAMS: readonly AffiliateProgram[] = [
  {
    slug: "yuh",
    name: "Yuh",
    category: "banking",
    description:
      "Free Swiss mobile banking and investing app from Swissquote and PostFinance. No account fees, ETF savings plans from small monthly amounts, and a built-in pillar 3a.",
    url: "https://www.yuh.com",
    trackingParam: "utm_source",
    trackingValue: AFFILIATE_CODES.yuh,
    note: "Free",
  },
  {
    slug: "interactive-brokers",
    name: "Interactive Brokers",
    category: "investing",
    description:
      "The low-cost broker most recommended by the Swiss FIRE community for recurring world-index ETF purchases. Transparent pricing, no custody fees.",
    url: "https://www.interactivebrokers.com",
    trackingParam: "ref",
    trackingValue: AFFILIATE_CODES["interactive-brokers"],
    note: "Low fees",
  },
  {
    slug: "degiro",
    name: "DEGIRO",
    category: "investing",
    description:
      "A discount broker popular with Swiss index investors, with a large ETF range and low per-trade commissions.",
    url: "https://www.degiro.ch",
    trackingParam: "tap_a",
    trackingValue: AFFILIATE_CODES.degiro,
    note: "Low fees",
  },
  {
    slug: "saxo-bank",
    name: "Saxo Bank",
    category: "investing",
    description:
      "A licensed Danish/Swiss broker in the FIRE community's standard three (with Interactive Brokers and DEGIRO), solid for larger portfolios.",
    url: "https://www.saxobank.com",
    trackingParam: "ref",
    trackingValue: AFFILIATE_CODES["saxo-bank"],
    note: "Low fees",
  },
  {
    slug: "ynabs",
    name: "YNAB",
    category: "budgeting",
    description:
      "You Need A Budget — the envelope-style budgeting app the Swiss FIRE community uses to turn a salary into a real savings rate.",
    url: "https://www.ynab.com",
    trackingParam: "ref",
    trackingValue: AFFILIATE_CODES.ynabs,
    note: "34-day free trial",
  },
  {
    slug: "comparis",
    name: "Comparis",
    category: "insurance",
    description:
      "Switzerland's biggest independent comparison portal. Compare mandatory health-insurance premiums and request quotes — essential when your first Swiss policy is due.",
    url: "https://en.comparis.ch/krankenkassen/default",
    trackingParam: "utm_source",
    trackingValue: AFFILIATE_CODES.comparis,
    note: "Free",
  },
];

export function affiliateUrl(program: AffiliateProgram): string {
  if (program.trackingParam && program.trackingValue) {
    const sep = program.url.includes("?") ? "&" : "?";
    return `${program.url}${sep}${program.trackingParam}=${encodeURIComponent(
      program.trackingValue,
    )}`;
  }
  return program.url;
}

export const AFFILIATE_CATEGORY_LABELS: Record<AffiliateCategory, string> = {
  banking: "Banking",
  insurance: "Health insurance",
  investing: "Investing",
  budgeting: "Budgeting",
};