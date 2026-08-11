CREATE TABLE suggested_answers (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_suggested_post ON suggested_answers(post_id);
CREATE INDEX idx_suggested_status ON suggested_answers(status);