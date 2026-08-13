-- Reserved system account that AI-suggested answers are attributed to when an
-- admin approves them, instead of silently posting under the approving
-- admin's own identity. password_hash is random, unrelated to any real
-- password -- this account has no login path exposed anywhere in the app.
INSERT INTO users (
  id, username, email, password_hash, school, status,
  verification_state, is_admin, created_at
) VALUES (
  'hospograd-team',
  'hospograd-team',
  'team@hospograd.app',
  '70dc96fafb743a89f51d20d713e297f5:8b767565b3f00c421412cecd53643b3a3431d9ae6b49a3ac2ef61ec53dd8f868',
  'HospoGrad Team',
  'alumni',
  'verified',
  0,
  (strftime('%s','now') * 1000)
);
