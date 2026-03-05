-- ═══════════════════════════════════════════════════════════
-- NovelTrend — Lists v2 schema
-- Replaces supabase_user_lists.sql
-- Run in: supabase.com → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- Drop old table if exists (run this only if starting fresh)
-- DROP TABLE IF EXISTS user_lists CASCADE;

-- 1) user_lists_v2: named lists per user
CREATE TABLE IF NOT EXISTS user_lists (
  id         BIGSERIAL   PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  is_default BOOLEAN     NOT NULL DEFAULT false,
  item_type  TEXT        CHECK (item_type IN ('novel','anime','manga','all')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- 2) user_list_entries: series added to a list
CREATE TABLE IF NOT EXISTS user_list_entries (
  id         BIGSERIAL   PRIMARY KEY,
  list_id    BIGINT      NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id    TEXT        NOT NULL,
  item_type  TEXT        NOT NULL CHECK (item_type IN ('novel','anime','manga')),
  title      TEXT        NOT NULL,
  cover_url  TEXT,
  status     TEXT        NOT NULL CHECK (status IN ('reading','completed','planned','onhold','dropped')),
  rating     INTEGER     CHECK (rating BETWEEN 1 AND 10),
  review     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (list_id, item_id, item_type)
);

CREATE INDEX IF NOT EXISTS idx_list_entries_list   ON user_list_entries (list_id);
CREATE INDEX IF NOT EXISTS idx_list_entries_user   ON user_list_entries (user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_list_entries_item   ON user_list_entries (item_id, item_type);

-- RLS
ALTER TABLE user_lists        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_list_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lists"
  ON user_lists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own entries"
  ON user_list_entries FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER list_entries_updated_at
  BEFORE UPDATE ON user_list_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RPC: auto-create default lists on first login
CREATE OR REPLACE FUNCTION create_default_lists(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_lists (user_id, name, is_default, item_type) VALUES
    (p_user_id, 'My Novels', true, 'novel'),
    (p_user_id, 'My Anime',  true, 'anime'),
    (p_user_id, 'My Manga',  true, 'manga')
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$;
