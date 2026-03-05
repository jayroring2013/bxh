-- ═══════════════════════════════════════════════════════
-- Migration: upgrade user_lists to v2 schema
-- Run this if you already have data in the old user_lists
-- ═══════════════════════════════════════════════════════

-- 1) Add missing columns to existing user_lists table
ALTER TABLE user_lists
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS item_type  TEXT;

-- 2) Create user_list_entries table
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

CREATE INDEX IF NOT EXISTS idx_list_entries_list ON user_list_entries (list_id);
CREATE INDEX IF NOT EXISTS idx_list_entries_user ON user_list_entries (user_id, item_type);

-- 3) RLS
ALTER TABLE user_list_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own entries" ON user_list_entries;
CREATE POLICY "Users manage own entries"
  ON user_list_entries FOR ALL USING (auth.uid() = user_id);

-- 4) Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS list_entries_updated_at ON user_list_entries;
CREATE TRIGGER list_entries_updated_at
  BEFORE UPDATE ON user_list_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5) RPC to create default lists
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

-- 6) Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
