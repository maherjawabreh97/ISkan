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

-- ---------------------------------------------------------------------------
-- Public accounts (advertisers)
-- ---------------------------------------------------------------------------
-- Deliberately a *different* table from `users` in Postgres: a public
-- advertiser can never reach an admin role, and the two code paths never mix.
CREATE TABLE IF NOT EXISTS user_accounts (
  id              TEXT PRIMARY KEY,
  -- Display name and full legal name; both collected at sign-up.
  name            TEXT NOT NULL,
  full_name       TEXT NOT NULL DEFAULT '',
  gender          TEXT NOT NULL DEFAULT '',
  nationality     TEXT NOT NULL DEFAULT '',
  email           TEXT,
  phone           TEXT,
  password_hash   TEXT NOT NULL,
  -- pending_verification | active | suspended
  status          TEXT NOT NULL DEFAULT 'pending_verification',
  -- Hash of the one-time code sent to the email/phone. Never stored in clear.
  verify_hash     TEXT,
  -- Temporary copy of that code, shown on screen because no mail/SMS provider
  -- is wired up yet. Cleared the moment the code is verified and swept by the
  -- expiry in verify_expires. Remove this column once a provider is connected.
  verify_plain    TEXT,
  verify_channel  TEXT,
  verify_expires  INTEGER,
  verify_attempts INTEGER NOT NULL DEFAULT 0,
  verified_at     INTEGER,
  approved_by     TEXT,
  approved_at     INTEGER,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  last_login_at   INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS user_accounts_email_idx ON user_accounts (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS user_accounts_phone_idx ON user_accounts (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_accounts_status_idx ON user_accounts (status, created_at DESC);

-- Which account owns which listing, and whether the live copy is current.
-- pending_review  -> waiting for the admin (brand new listing)
-- published       -> live and untouched
-- changes_pending -> the owner submitted an edit that needs approval
CREATE TABLE IF NOT EXISTS listing_owners (
  slug        TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL,
  state       TEXT NOT NULL DEFAULT 'pending_review',
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS listing_owners_owner_idx ON listing_owners (owner_id, updated_at DESC);

-- Edit requests: the owner's proposed changes, held until an admin approves.
CREATE TABLE IF NOT EXISTS listing_revisions (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL,
  owner_id    TEXT NOT NULL,
  data        TEXT NOT NULL,
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  INTEGER NOT NULL,
  reviewed_at INTEGER
);

CREATE INDEX IF NOT EXISTS listing_revisions_status_idx ON listing_revisions (status, created_at DESC);

-- Anyone can report an account. Handled from the admin dashboard.
CREATE TABLE IF NOT EXISTS user_reports (
  id             TEXT PRIMARY KEY,
  target_user_id TEXT NOT NULL,
  reporter_name  TEXT NOT NULL DEFAULT '',
  reporter_email TEXT NOT NULL DEFAULT '',
  reason         TEXT NOT NULL,
  details        TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'open',
  created_at     INTEGER NOT NULL,
  resolved_at    INTEGER
);

CREATE INDEX IF NOT EXISTS user_reports_status_idx ON user_reports (status, created_at DESC);

-- Rolling rate-limit counter for the public account endpoints (sign-up, code
-- verification, sign-in, reports). The "ip" column holds "<kind>:<address>" so
-- each flow is throttled independently.
CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_attempts_ip_idx ON auth_attempts (ip, at DESC);

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
