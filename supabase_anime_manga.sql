-- ═══════════════════════════════════════════════════════════
-- NovelTrend — Anime & Manga cache tables
-- Run in: supabase.com → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- 1) Anime table (from AniList)
CREATE TABLE IF NOT EXISTS anime (
  id               INTEGER PRIMARY KEY,  -- AniList ID
  title_romaji     TEXT,
  title_english    TEXT,
  title_native     TEXT,
  cover_large      TEXT,
  cover_color      TEXT,
  banner_image     TEXT,
  description      TEXT,
  genres           TEXT[],
  status           TEXT,
  format           TEXT,
  episodes         INTEGER,
  duration         INTEGER,
  season           TEXT,
  season_year      INTEGER,
  start_date       TEXT,
  end_date         TEXT,
  average_score    INTEGER,
  mean_score       INTEGER,
  popularity       INTEGER,
  favourites       INTEGER,
  studio           TEXT,
  site_url         TEXT,
  synced_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_anime_popularity  ON anime (popularity  DESC);
CREATE INDEX IF NOT EXISTS idx_anime_score       ON anime (average_score DESC);
CREATE INDEX IF NOT EXISTS idx_anime_season_year ON anime (season_year DESC);

-- 2) Manga table (from MangaDex)
CREATE TABLE IF NOT EXISTS manga (
  id               TEXT PRIMARY KEY,  -- MangaDex UUID
  title_en         TEXT,
  title_ja_ro      TEXT,
  title_ja         TEXT,
  cover_url        TEXT,
  description_en   TEXT,
  status           TEXT,
  demographic      TEXT,
  content_rating   TEXT,
  year             INTEGER,
  last_chapter     TEXT,
  last_volume      TEXT,
  original_language TEXT,
  genres           TEXT[],
  themes           TEXT[],
  author           TEXT,
  follows          INTEGER DEFAULT 0,
  rating           NUMERIC(5,2),
  chapters         INTEGER,
  volumes          INTEGER,
  synced_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_manga_follows ON manga (follows DESC);
CREATE INDEX IF NOT EXISTS idx_manga_rating  ON manga (rating  DESC);
CREATE INDEX IF NOT EXISTS idx_manga_year    ON manga (year    DESC);

-- 3) RLS — public read, no public write (only the sync script writes via service key)
ALTER TABLE anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE manga ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read anime" ON anime FOR SELECT USING (true);
CREATE POLICY "Public can read manga" ON manga FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════
-- Done! Now get your SERVICE ROLE key from:
-- supabase.com → Settings → API → service_role (secret)
-- Add it as SUPABASE_SERVICE_KEY in GitHub Actions secrets
-- ═══════════════════════════════════════════════════════════
