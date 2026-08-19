-- Referral attribution: signups that arrived via an invite link record who
-- invited them. The inviter is stored by username at signup time (the invite
-- link is /invite?ref=<username>), so no separate referral-code table is
-- needed — username is already unique and stable.
ALTER TABLE users ADD COLUMN invited_by TEXT REFERENCES users(id);

CREATE INDEX idx_users_invited_by ON users(invited_by);