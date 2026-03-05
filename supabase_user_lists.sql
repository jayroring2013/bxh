-- ═══════════════════════════════════════════════════════════
-- NovelTrend — User Lists Schema
-- Run in: supabase.com → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- User lists table
CREATE TABLE IF NOT EXISTS user_lists (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id     TEXT        NOT NULL,   -- novel id, anime id, or manga uuid
  item_type   TEXT        NOT NULL CHECK (item_type IN ('novel', 'anime', 'manga')),
  title       TEXT        NOT NULL,
  cover_url   TEXT,
  status      TEXT        NOT NULL CHECK (status IN ('reading','completed','planned','onhold','dropped')),
  rating      INTEGER     CHECK (rating BETWEEN 1 AND 10),
  review      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_id, item_type)
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_user_lists_user   ON user_lists (user_id, item_type, status);
CREATE INDEX IF NOT EXISTS idx_user_lists_item   ON user_lists (item_id, item_type);

-- RLS — users can only see and edit their own lists
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own list"
  ON user_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own list"
  ON user_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own list"
  ON user_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own list"
  ON user_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_lists_updated_at
  BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- Google OAuth setup (do this in Supabase dashboard):
-- Authentication → Providers → Google → Enable
-- Add your Google OAuth Client ID + Secret
-- Allowed redirect URLs: https://jayroring2013.github.io/bxh/
-- ═══════════════════════════════════════════════════════════
