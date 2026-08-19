-- Featured clinic placement: a quarterly slot on the /medical page. One row
-- per purchase; the currently-active feature is the paid row whose window has
-- not expired. Slots are self-serve (clinic pays via Stripe Checkout) and the
-- window is set when payment is confirmed. The clinic itself is not a forum
-- user and already exists in the static CLINICS directory, so only the slug
-- and the payment/window bookkeeping live here.
CREATE TABLE featured_clinics (
  id TEXT PRIMARY KEY,
  clinic_slug TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_featured_clinics_session ON featured_clinics(stripe_session_id);
CREATE INDEX idx_featured_clinics_active ON featured_clinics(status, expires_at);