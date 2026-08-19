-- Health-insurance comparison leads. Students must buy Swiss health
-- insurance; the comparison form captures exactly what a broker needs to
-- quote (age, canton, deductible, managed-care model, start date, contact).
-- Each submission is a lead we can sell to a broker partner (the
-- Comparis/bonus.ch model, CHF 30-50+/lead). Status tracks the handoff.
CREATE TABLE insurance_leads (
  id TEXT PRIMARY KEY,
  age INTEGER NOT NULL,
  canton TEXT NOT NULL,
  deductible INTEGER NOT NULL,
  plan_model TEXT NOT NULL CHECK (plan_model IN ('standard', 'hmo', 'family-doctor', 'telmed')),
  start_date TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_insurance_leads_status ON insurance_leads(status, created_at);