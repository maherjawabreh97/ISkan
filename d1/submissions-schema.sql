-- Public "list your property" submissions and upload rate-limiting (D1 / SQLite).
-- Apply with:
--   npx wrangler d1 execute iskan-submissions --remote --file=./d1/submissions-schema.sql

-- Property listings submitted by visitors. They stay hidden from the public site
-- until an admin approves them from the dashboard.
CREATE TABLE IF NOT EXISTS submissions (
  id         TEXT PRIMARY KEY,
  status     TEXT NOT NULL DEFAULT 'pending',
  ip         TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  data       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_ip_idx ON submissions (ip, created_at DESC);

-- Rolling counters for the public image-upload endpoint (abuse control).
CREATE TABLE IF NOT EXISTS upload_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  n  INTEGER NOT NULL DEFAULT 1,
  at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS upload_events_ip_idx ON upload_events (ip, at DESC);

-- Visitor-submitted testimonials ("what our clients say"). They stay
-- hidden from the public site until an admin approves them.
CREATE TABLE IF NOT EXISTS testimonials (
  id         TEXT PRIMARY KEY,
  status     TEXT NOT NULL DEFAULT 'pending',
  ip         TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  data       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS testimonials_status_idx ON testimonials (status, created_at DESC);
CREATE INDEX IF NOT EXISTS testimonials_ip_idx ON testimonials (ip, created_at DESC);
