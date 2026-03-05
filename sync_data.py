#!/usr/bin/env python3
"""
NovelTrend — Data Sync Script
Fetches top anime (AniList) and manga (MangaDex) and upserts into Supabase.

Usage:
  python sync_data.py

Environment variables (set in GitHub Actions secrets or .env):
  SUPABASE_URL          https://zragvkqsslfyarjbjmmz.supabase.co
  SUPABASE_SERVICE_KEY  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYWd2a3Fzc2xmeWFyamJqbW16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzMzY4NCwiZXhwIjoyMDg4MjA5Njg0fQ.V2VYm1pzKLbylTkHS4nTX8T6dMqpRdENpMWLydC_jmE (NOT anon key)
"""

import os, json, time, urllib.request, urllib.error
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get('SUPABASE_URL', '').rstrip('/')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars")

# ── Helpers ──────────────────────────────────────────────────

def fetch_json(url, method='GET', body=None, headers=None, retries=3):
    h = {'Content-Type': 'application/json', 'User-Agent': 'NovelTrend-Sync/1.0'}
    if headers:
        h.update(headers)
    data = json.dumps(body).encode() if body else None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers=h, method=method)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            msg = e.read().decode()
            print(f"  HTTP {e.code} on attempt {attempt+1}: {msg[:200]}")
            if e.code == 429:
                wait = 60
                print(f"  Rate limited — waiting {wait}s...")
                time.sleep(wait)
            elif attempt == retries - 1:
                raise
            else:
                time.sleep(5)
        except Exception as e:
            if attempt == retries - 1:
                raise
            print(f"  Error attempt {attempt+1}: {e} — retrying...")
            time.sleep(5)

def supabase_upsert(table, rows):
    if not rows:
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    fetch_json(url, method='POST', body=rows, headers={
        'apikey':        SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Prefer':        'resolution=merge-duplicates,return=minimal',
        'Content-Type':  'application/json',
    })

# ── AniList ──────────────────────────────────────────────────

ANILIST_QUERY = """
query($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    media(sort: POPULARITY_DESC, type: ANIME) {
      id
      title { romaji english native }
      coverImage { extraLarge color }
      bannerImage
      description(asHtml: false)
      genres status format episodes duration
      season seasonYear
      startDate { year month day }
      endDate   { year month day }
      averageScore meanScore popularity favourites
      studios(isMain: true) { nodes { name } }
      siteUrl
    }
  }
}
"""

def fmt_date(d):
    if not d or not d.get('year'):
        return None
    return f"{d['year']}-{str(d.get('month') or 1).zfill(2)}-{str(d.get('day') or 1).zfill(2)}"

def fetch_anime(total=1000):
    print(f"\n📺 Fetching top {total} anime from AniList...")
    per_page = 25
    pages    = total // per_page
    all_rows = []

    for page in range(1, pages + 1):
        print(f"  Page {page}/{pages}...", end=' ', flush=True)
        try:
            data = fetch_json(
                'https://graphql.anilist.co',
                method='POST',
                body={'query': ANILIST_QUERY, 'variables': {'page': page, 'perPage': per_page}},
            )
            media = data['data']['Page']['media']
            for m in media:
                studio_nodes = m.get('studios', {}).get('nodes', [])
                all_rows.append({
                    'id':            m['id'],
                    'title_romaji':  m['title'].get('romaji'),
                    'title_english': m['title'].get('english'),
                    'title_native':  m['title'].get('native'),
                    'cover_large':   m.get('coverImage', {}).get('extraLarge'),
                    'cover_color':   m.get('coverImage', {}).get('color'),
                    'banner_image':  m.get('bannerImage'),
                    'description':   (m.get('description') or '')[:2000],
                    'genres':        m.get('genres', []),
                    'status':        m.get('status'),
                    'format':        m.get('format'),
                    'episodes':      m.get('episodes'),
                    'duration':      m.get('duration'),
                    'season':        m.get('season'),
                    'season_year':   m.get('seasonYear'),
                    'start_date':    fmt_date(m.get('startDate')),
                    'end_date':      fmt_date(m.get('endDate')),
                    'average_score': m.get('averageScore'),
                    'mean_score':    m.get('meanScore'),
                    'popularity':    m.get('popularity'),
                    'favourites':    m.get('favourites'),
                    'studio':        studio_nodes[0]['name'] if studio_nodes else None,
                    'site_url':      m.get('siteUrl'),
                    'synced_at':     datetime.now(timezone.utc).isoformat(),
                })
            print(f"✓ {len(media)} anime")
            # AniList rate limit: 90 req/min
            time.sleep(0.8)
        except Exception as e:
            print(f"✗ Error: {e}")

    return all_rows

# ── MangaDex ─────────────────────────────────────────────────

def fetch_manga(total=500):
    print(f"\n📚 Fetching top {total} manga from MangaDex...")
    limit    = 25
    all_rows = []
    offset   = 0
    pages    = total // limit

    for page in range(1, pages + 1):
        print(f"  Page {page}/{pages} (offset {offset})...", end=' ', flush=True)
        try:
            params = '&'.join([
                f'limit={limit}',
                f'offset={offset}',
                'order[followedCount]=desc',
                'contentRating[]=safe',
                'contentRating[]=suggestive',
                'includes[]=cover_art',
                'includes[]=author',
                'availableTranslatedLanguage[]=en',
            ])
            data  = fetch_json(f'https://api.mangadex.org/manga?{params}')
            items = data.get('data', [])

            # Fetch stats for this batch
            ids = [m['id'] for m in items]
            stats_map = {}
            if ids:
                stat_params = '&'.join(f'manga[]={i}' for i in ids)
                try:
                    stat_data  = fetch_json(f'https://api.mangadex.org/statistics/manga?{stat_params}')
                    stats_map  = stat_data.get('statistics', {})
                except Exception as e:
                    print(f"\n  Stats error: {e}", end=' ')

            # Fetch aggregate (chapter/volume counts) for each manga
            agg_map = {}
            for mid in ids:
                try:
                    agg = fetch_json(f'https://api.mangadex.org/manga/{mid}/aggregate?translatedLanguage[]=en')
                    volumes = agg.get('volumes', {})
                    if not volumes or isinstance(volumes, list):
                        agg2 = fetch_json(f'https://api.mangadex.org/manga/{mid}/aggregate')
                        volumes = agg2.get('volumes', {})
                    if isinstance(volumes, dict):
                        vol_count = len([k for k in volumes if k != 'none'])
                        ch_set    = set()
                        for v in volumes.values():
                            if isinstance(v, dict) and isinstance(v.get('chapters'), dict):
                                ch_set.update(v['chapters'].keys())
                        agg_map[mid] = {'volumes': vol_count or None, 'chapters': len(ch_set) or None}
                    time.sleep(0.3)
                except Exception:
                    pass

            for m in items:
                attrs    = m['attributes']
                rels     = m.get('relationships', [])
                cover    = next((r for r in rels if r['type'] == 'cover_art'), None)
                authors  = list({r['attributes']['name'] for r in rels
                                 if r['type'] in ('author','artist') and r.get('attributes', {}).get('name')})
                cover_fn = cover['attributes']['fileName'] if cover and cover.get('attributes') else None
                cover_url= f"https://uploads.mangadex.org/covers/{m['id']}/{cover_fn}.512.jpg" if cover_fn else None
                title_en = attrs['title'].get('en') or attrs['title'].get('ja-ro') or list(attrs['title'].values())[0] if attrs['title'] else None
                genres   = [t['attributes']['name']['en'] for t in attrs.get('tags',[]) if t['attributes']['group']=='genre']
                themes   = [t['attributes']['name']['en'] for t in attrs.get('tags',[]) if t['attributes']['group']=='theme']
                stat     = stats_map.get(m['id'], {})
                agg      = agg_map.get(m['id'], {})

                all_rows.append({
                    'id':               m['id'],
                    'title_en':         title_en,
                    'title_ja_ro':      attrs['title'].get('ja-ro'),
                    'title_ja':         attrs['title'].get('ja'),
                    'cover_url':        cover_url,
                    'description_en':   (attrs.get('description') or {}).get('en', '')[:2000],
                    'status':           attrs.get('status'),
                    'demographic':      attrs.get('publicationDemographic'),
                    'content_rating':   attrs.get('contentRating'),
                    'year':             attrs.get('year'),
                    'last_chapter':     attrs.get('lastChapter'),
                    'last_volume':      attrs.get('lastVolume'),
                    'original_language':attrs.get('originalLanguage'),
                    'genres':           genres,
                    'themes':           themes,
                    'author':           ', '.join(authors[:2]) if authors else None,
                    'follows':          stat.get('follows'),
                    'rating':           round(stat.get('rating', {}).get('bayesian', 0), 2) or None,
                    'chapters':         agg.get('chapters'),
                    'volumes':          agg.get('volumes'),
                    'synced_at':        datetime.now(timezone.utc).isoformat(),
                })

            print(f"✓ {len(items)} manga")
            offset += limit
            time.sleep(1.5)  # MangaDex rate limit

        except Exception as e:
            print(f"✗ Error: {e}")
            time.sleep(5)

    return all_rows

# ── Upsert to Supabase ────────────────────────────────────────

def upsert_batch(table, rows, batch_size=100):
    total = len(rows)
    print(f"\n💾 Upserting {total} rows into '{table}'...")
    for i in range(0, total, batch_size):
        batch = rows[i:i+batch_size]
        print(f"  Batch {i//batch_size + 1}/{(total+batch_size-1)//batch_size} ({len(batch)} rows)...", end=' ')
        try:
            supabase_upsert(table, batch)
            print("✓")
        except Exception as e:
            print(f"✗ {e}")
        time.sleep(0.3)

# ── Main ──────────────────────────────────────────────────────

if __name__ == '__main__':
    start = time.time()
    print("=" * 55)
    print("  NovelTrend Data Sync")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 55)

    anime_rows = fetch_anime(total=1000)
    upsert_batch('anime', anime_rows)

    manga_rows = fetch_manga(total=500)
    upsert_batch('manga', manga_rows)

    elapsed = time.time() - start
    print(f"\n✅ Done in {elapsed/60:.1f} min")
    print(f"   Anime: {len(anime_rows)} rows")
    print(f"   Manga: {len(manga_rows)} rows")
