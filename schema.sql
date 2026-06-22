-- 2분기 GWP 활동 "AI 첫발, 함께 내딛다" — D1 스키마

CREATE TABLE IF NOT EXISTS registrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  activity   INTEGER NOT NULL,         -- 1 | 2 | 3
  name       TEXT    NOT NULL,
  url        TEXT    NOT NULL,
  created_at TEXT    DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_activity ON registrations(activity);

CREATE TABLE IF NOT EXISTS draws (             -- 추첨 1회 = 1 row
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  scope      TEXT    NOT NULL,         -- 'all' | '1' | '2' | '3'
  prize      TEXT,
  drawn_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS winners (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  draw_id         INTEGER NOT NULL REFERENCES draws(id),
  registration_id INTEGER NOT NULL REFERENCES registrations(id),
  name            TEXT,
  activity        INTEGER
);

CREATE INDEX IF NOT EXISTS idx_winners_draw ON winners(draw_id);
