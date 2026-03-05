-- Fix existing manga cover URLs in Supabase
-- Run in: supabase.com → SQL Editor → New query
-- Changes uploads.mangadex.org → mangadex.org/covers (hotlink-friendly proxy)

UPDATE manga
SET cover_url = REPLACE(cover_url, 'https://uploads.mangadex.org/covers/', 'https://mangadex.org/covers/')
WHERE cover_url LIKE 'https://uploads.mangadex.org/covers/%';
