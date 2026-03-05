-- ═══════════════════════════════════════════════════════════
-- NovelTrend — Supabase Schema
-- Run this entire file in: supabase.com → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- 1) Monthly votes table
--    One row per novel per month. vote_count increments on each vote.
CREATE TABLE IF NOT EXISTS novel_votes (
  id           BIGSERIAL PRIMARY KEY,
  novel_id     TEXT        NOT NULL,          -- RanobeDB series ID
  novel_title  TEXT        NOT NULL,
  novel_romaji TEXT,
  cover_url    TEXT,
  month        INTEGER     NOT NULL,          -- 1-12
  year         INTEGER     NOT NULL,
  vote_count   INTEGER     NOT NULL DEFAULT 0,
  prev_rank    INTEGER,                       -- rank from previous month (for trend arrows)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (novel_id, month, year)
);

-- 2) Function to safely increment a vote (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_vote(
  p_novel_id     TEXT,
  p_novel_title  TEXT,
  p_novel_romaji TEXT,
  p_cover_url    TEXT,
  p_month        INTEGER,
  p_year         INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO novel_votes (novel_id, novel_title, novel_romaji, cover_url, month, year, vote_count)
  VALUES (p_novel_id, p_novel_title, p_novel_romaji, p_cover_url, p_month, p_year, 1)
  ON CONFLICT (novel_id, month, year)
  DO UPDATE SET
    vote_count = novel_votes.vote_count + 1,
    updated_at = NOW();
END;
$$;

-- 3) Enable Row Level Security but allow public read + insert
ALTER TABLE novel_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read votes"
  ON novel_votes FOR SELECT
  USING (true);

CREATE POLICY "Public can insert/update votes"
  ON novel_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update vote counts"
  ON novel_votes FOR UPDATE
  USING (true);

-- 4) Index for fast monthly queries
CREATE INDEX IF NOT EXISTS idx_votes_month_year
  ON novel_votes (year DESC, month DESC, vote_count DESC);

-- ═══════════════════════════════════════════════════════════
-- Done! Now go to:
-- supabase.com → Your Project → Settings → API
-- Copy "Project URL" and "anon public" key into src/supabase.js
-- ═══════════════════════════════════════════════════════════
