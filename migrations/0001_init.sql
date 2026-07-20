CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  school TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('student', 'alumni')),
  verification_state TEXT NOT NULL CHECK (verification_state IN ('pending', 'verified', 'rejected')),
  verification_doc_key TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  otp_hash TEXT,
  otp_expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_keys TEXT NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id),
  parent_comment_id TEXT REFERENCES comments(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at INTEGER NOT NULL,
  UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_votes_target ON votes(target_type, target_id);

INSERT INTO categories (slug, name, description) VALUES
  ('accommodation', 'Accommodation & Housing', 'Finding housing, leases, roommates, landlords.'),
  ('health-insurance', 'Health & Insurance', 'Coverage, providers, claims.'),
  ('visa-legal', 'Visa & Legal', 'Work permits, residency, legal questions.'),
  ('jobs-internships', 'Jobs & Internships', 'Job postings, internship advice, employer reviews.'),
  ('money-taxes', 'Money & Taxes', 'Banking, taxes, budgeting in Switzerland.'),
  ('school-life', 'School Life & Courses', 'Courses, professors, campus life by school.'),
  ('general', 'General Discussion', 'Everything else.');
