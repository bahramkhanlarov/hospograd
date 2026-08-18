-- Pay-per-posting job board: paid job posts are authored by the reserved
-- hospograd-team system account (migration 0003) and flagged featured for a
-- fixed window, so they pin to the top of the jobs-internships category.
ALTER TABLE posts ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE posts ADD COLUMN featured_until INTEGER;

-- Pending/paid job listings. The employer is NOT a forum user, so the job
-- details live here and the visible post is created (authored by the team
-- account) only after payment succeeds.
CREATE TABLE job_listings (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  apply_url TEXT,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  post_id TEXT REFERENCES posts(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_job_listings_session ON job_listings(stripe_session_id);
CREATE INDEX idx_posts_featured ON posts(featured, featured_until);
