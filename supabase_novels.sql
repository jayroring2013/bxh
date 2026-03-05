-- ═══════════════════════════════════════════════════════════
-- NovelTrend — Novel cache table (from RanobeDB)
-- Run in: supabase.com → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS novels (
  id               INTEGER PRIMARY KEY,
  title            TEXT,
  romaji           TEXT,
  title_orig       TEXT,
  cover_url        TEXT,
  description      TEXT,
  publication_status TEXT,
  num_books        INTEGER,
  start_date       INTEGER,
  end_date         INTEGER,
  genres           TEXT[],
  score            NUMERIC(5,2),
  score_count      INTEGER,
  synced_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_novels_books  ON novels (num_books  DESC);
CREATE INDEX IF NOT EXISTS idx_novels_score  ON novels (score      DESC);
CREATE INDEX IF NOT EXISTS idx_novels_status ON novels (publication_status);

ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read novels" ON novels FOR SELECT USING (true);
