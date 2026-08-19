// Shared health-insurance comparison data, used by both the /insurance
// compare form and the worker lead-capture route (which validates against
// the same lists, so the form and API never drift). Mirrors lib/clinics.ts.

export const DEDUCTIBLES = [300, 500, 1000, 1500, 2000, 2500] as const;

export const PLAN_MODELS = ["standard", "hmo", "family-doctor", "telmed"] as const;

// All 26 Swiss cantons, two-letter codes as used by the premium comparators.
export const CANTONS = [
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
  "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
  "TI", "UR", "VD", "VS", "ZG", "ZH",
] as const;

export const PLAN_MODEL_LABELS: Record<(typeof PLAN_MODELS)[number], string> = {
  standard: "Standard",
  hmo: "HMO",
  "family-doctor": "Family doctor",
  telmed: "Telmed (phone-first)",
};