-- Security tables for the admin dashboard (D1 / SQLite).
-- Apply with:
--   npx wrangler d1 execute iskan-security --remote --file=./d1/security-schema.sql

CREATE TABLE IF NOT EXISTS login_failures (
  ip TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bans (
  ip TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  at INTEGER NOT NULL,
  until INTEGER NOT NULL,
  username TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS bans_until_idx ON bans (until);

CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  ip TEXT NOT NULL,
  at INTEGER NOT NULL,
  username TEXT,
  user_agent TEXT,
  detail TEXT
);

CREATE INDEX IF NOT EXISTS security_events_at_idx ON security_events (at DESC);
