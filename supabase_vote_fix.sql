-- ═══════════════════════════════════════════════════════════
-- Fix vote fraud: track per-user votes for logged-in users
-- Run in: supabase.com → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- 1) Table to track which users voted for which novel each month
CREATE TABLE IF NOT EXISTS novel_vote_log (
  id         BIGSERIAL PRIMARY KEY,
  novel_id   TEXT        NOT NULL,
  month      INTEGER     NOT NULL,
  year       INTEGER     NOT NULL,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash    TEXT,        -- hashed IP for anonymous vote limiting
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One vote per user per novel per month (logged-in users)
  UNIQUE NULLS NOT DISTINCT (novel_id, month, year, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vote_log_novel ON novel_vote_log (novel_id, month, year);

-- RLS
ALTER TABLE novel_vote_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert vote log" ON novel_vote_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read vote log"   ON novel_vote_log FOR SELECT USING (true);

-- 2) Replace increment_vote to check for duplicate votes
CREATE OR REPLACE FUNCTION increment_vote(
  p_novel_id    TEXT,
  p_month       INTEGER,
  p_year        INTEGER,
  p_novel_title TEXT DEFAULT NULL,
  p_cover_url   TEXT DEFAULT NULL,
  p_user_id     UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already BOOLEAN := FALSE;
BEGIN
  -- Check if logged-in user already voted
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM novel_vote_log
      WHERE novel_id = p_novel_id
        AND month    = p_month
        AND year     = p_year
        AND user_id  = p_user_id
    ) INTO v_already;

    IF v_already THEN
      RETURN jsonb_build_object('error', 'already_voted');
    END IF;
  END IF;

  -- Log the vote
  INSERT INTO novel_vote_log (novel_id, month, year, user_id)
  VALUES (p_novel_id, p_month, p_year, p_user_id)
  ON CONFLICT DO NOTHING;

  -- Upsert vote count
  INSERT INTO novel_votes (novel_id, novel_title, cover_url, month, year, vote_count)
  VALUES (p_novel_id, p_novel_title, p_cover_url, p_month, p_year, 1)
  ON CONFLICT (novel_id, month, year)
  DO UPDATE SET
    vote_count = novel_votes.vote_count + 1,
    updated_at = NOW(),
    novel_title = COALESCE(EXCLUDED.novel_title, novel_votes.novel_title),
    cover_url   = COALESCE(EXCLUDED.cover_url,   novel_votes.cover_url);

  RETURN jsonb_build_object('success', true);
END;
$$;
