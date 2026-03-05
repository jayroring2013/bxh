-- ═══════════════════════════════════════════════════════════
-- Create Supabase Storage bucket for manga covers
-- Run in: supabase.com → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- Create public bucket for manga cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manga-covers',
  'manga-covers',
  true,           -- public = anyone can read
  2097152,        -- 2MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads
CREATE POLICY "Public can view manga covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'manga-covers');

-- Allow service role to upload
CREATE POLICY "Service role can upload manga covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'manga-covers');

CREATE POLICY "Service role can update manga covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'manga-covers');
