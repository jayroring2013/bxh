#!/usr/bin/env python3
"""
NovelTrend — Data Sync Script
Fetches top anime (AniList) and manga (MangaDex) and upserts into Supabase.

Environment variables (set in GitHub Actions secrets):
  SUPABASE_URL          https://zragvkqsslfyarjbjmmz.supabase.co
  SUPABASE_SERVICE_KEY  your service_role key (NOT anon key)
"""

import os, json, time, urllib.request, urllib.error
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get('SUPABASE_URL', '').rstrip('/')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars")

# ── Helpers ──────────────────────────────────────────────────

def fetch_json(url, method='GET', body=None, headers=None, retries=6):
    h = {'Content-Type': 'application/json', 'User-Agent': 'NovelTrend-Sync/1.0'}
    if headers:
        h.update(headers)
    data = json.dumps(body).encode() if body else None

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers=h, method=method)
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read())

        except urllib.error.HTTPError as e:
            msg = e.read().decode()
            print(f"\n  ⚠ HTTP {e.code} (attempt {attempt+1}/{retries}): {msg[:120]}")

            if e.code == 429:
                # Exponential backoff: 60s, 120s, 180s...
                wait = 60 * (attempt + 1)
                print(f"  Rate limited — waiting {wait}s before retry...", flush=True)
                time.sleep(wait)
            elif e.code >= 500:
                wait = 10 * (attempt + 1)
                print(f"  Server error — waiting {wait}s...", flush=True)
                time.sleep(wait)
            elif attempt == retries - 1:
                raise
            else:
                time.sleep(5)

        except Exception as e:
            if attempt == retries - 1:
                raise
            print(f"\n  ⚠ Error attempt {attempt+1}: {e} — retrying in 10s...")
            time.sleep(10)

def supabase_upsert(table, rows):
    if not rows:
        return
    url  = f"{SUPABASE_URL}/rest/v1/{table}"
    h    = {
        'apikey':        SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type':  'application/json',
        'Prefer':        'resolution=merge-duplicates,return=minimal',
    }
    data = json.dumps(rows).encode()
    req  = urllib.request.Request(url, data=data, headers=h, method='POST')
    with urllib.request.urlopen(req, timeout=40) as r:
        # 201 or 204 — both are success; body may be empty
        if r.status not in (200, 201, 204):
            raise Exception(f"Supabase upsert returned {r.status}")

# ── Supabase Storage ─────────────────────────────────────────

def upload_cover(manga_id, cover_fn):
    """Download cover from MangaDex and upload to Supabase Storage."""
    src_url  = f"https://uploads.mangadex.org/covers/{manga_id}/{cover_fn}.512.jpg"
    dest_path = f"{manga_id}/{cover_fn}.512.jpg"
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/manga-covers/{dest_path}"

    # Download image
    try:
        req = urllib.request.Request(src_url, headers={'User-Agent': 'NovelTrend-Sync/1.0'})
        with urllib.request.urlopen(req, timeout=20) as r:
            image_data = r.read()
    except Exception as e:
        return None

    # Upload to Supabase Storage
    upload_url = f"{SUPABASE_URL}/storage/v1/object/manga-covers/{dest_path}"
    try:
        req = urllib.request.Request(
            upload_url,
            data=image_data,
            headers={
                'apikey':        SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type':  'image/jpeg',
                'x-upsert':      'true',
            },
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            pass
        return public_url
    except Exception as e:
        return None

# ── AniList ──────────────────────────────────────────────────
# AniList rate limit: ~90 requests/minute (1 req per 0.67s safe)
# We use perPage=50 to halve the number of requests needed for 1000 anime

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
    # Use perPage=50 → only 20 requests for 1000 anime instead of 40
    per_page = 50
    pages    = total // per_page
    all_rows = []
    print(f"\n📺 Fetching top {total} anime from AniList ({pages} pages × {per_page})...")

    for page in range(1, pages + 1):
        print(f"  Page {page}/{pages}...", end=' ', flush=True)
        try:
            data  = fetch_json(
                'https://graphql.anilist.co',
                method='POST',
                body={'query': ANILIST_QUERY, 'variables': {'page': page, 'perPage': per_page}},
            )
            media = data['data']['Page']['media']
            now   = datetime.now(timezone.utc).isoformat()
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
                    'synced_at':     now,
                })
            print(f"✓ {len(media)} anime")

            # Upsert immediately after each page so progress is saved
            # even if the job times out later
            upsert_batch('anime', all_rows[-len(media):], batch_size=50, quiet=True)

            # Stay well under 90 req/min — 1 request every 2s = 30/min
            time.sleep(2)

        except Exception as e:
            print(f"✗ {e} — skipping page")
            time.sleep(10)

    return all_rows

# ── MangaDex ─────────────────────────────────────────────────

def fetch_manga(total=500):
    limit  = 25
    pages  = total // limit
    all_rows = []
    print(f"\n📚 Fetching top {total} manga from MangaDex ({pages} pages × {limit})...")

    for page in range(1, pages + 1):
        offset = (page - 1) * limit
        print(f"  Page {page}/{pages}...", end=' ', flush=True)
        try:
            params = '&'.join([
                f'limit={limit}', f'offset={offset}',
                'order[followedCount]=desc',
                'contentRating[]=safe', 'contentRating[]=suggestive',
                'includes[]=cover_art', 'includes[]=author',
                'availableTranslatedLanguage[]=en',
            ])
            data  = fetch_json(f'https://api.mangadex.org/manga?{params}')
            items = data.get('data', [])
            if not items:
                print("no data — skipping")
                continue

            # Batch stats fetch (all IDs at once — 1 request instead of 25)
            ids       = [m['id'] for m in items]
            stats_map = {}
            try:
                stat_params = '&'.join(f'manga[]={i}' for i in ids)
                stat_data   = fetch_json(f'https://api.mangadex.org/statistics/manga?{stat_params}')
                stats_map   = stat_data.get('statistics', {})
            except Exception as e:
                print(f"\n    Stats batch failed: {e}", end=' ')

            # Aggregate counts — parallel with thread pool (5 workers)
            import concurrent.futures

            def fetch_agg(mid):
                try:
                    agg = fetch_json(
                        f'https://api.mangadex.org/manga/{mid}/aggregate?translatedLanguage[]=en'
                    )
                    volumes = agg.get('volumes', {})
                    if not volumes or isinstance(volumes, list):
                        agg2    = fetch_json(f'https://api.mangadex.org/manga/{mid}/aggregate')
                        volumes = agg2.get('volumes', {})
                    if isinstance(volumes, dict):
                        vol_count = len([k for k in volumes if k != 'none'])
                        ch_set    = set()
                        for v in volumes.values():
                            if isinstance(v, dict) and isinstance(v.get('chapters'), dict):
                                ch_set.update(v['chapters'].keys())
                        return mid, {'volumes': vol_count or None, 'chapters': len(ch_set) or None}
                except Exception:
                    pass
                return mid, {}

            agg_map = {}
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
                futures = {ex.submit(fetch_agg, mid): mid for mid in ids}
                for fut in concurrent.futures.as_completed(futures):
                    mid, data = fut.result()
                    if data:
                        agg_map[mid] = data

            now = datetime.now(timezone.utc).isoformat()
            for m in items:
                attrs    = m['attributes']
                rels     = m.get('relationships', [])
                cover    = next((r for r in rels if r['type'] == 'cover_art'), None)
                authors  = list({
                    r['attributes']['name']
                    for r in rels
                    if r['type'] in ('author', 'artist') and r.get('attributes', {}).get('name')
                })
                cover_fn  = cover['attributes']['fileName'] if cover and cover.get('attributes') else None
                # Upload to Supabase Storage to avoid MangaDex hotlink blocking
                if cover_fn:
                    cover_url = upload_cover(m['id'], cover_fn)
                    if not cover_url:
                        cover_url = f"https://mangadex.org/covers/{m['id']}/{cover_fn}.512.jpg"  # fallback
                else:
                    cover_url = None
                title_en  = (attrs['title'].get('en')
                             or attrs['title'].get('ja-ro')
                             or (list(attrs['title'].values())[0] if attrs['title'] else None))
                genres    = [t['attributes']['name']['en'] for t in attrs.get('tags', []) if t['attributes']['group'] == 'genre']
                themes    = [t['attributes']['name']['en'] for t in attrs.get('tags', []) if t['attributes']['group'] == 'theme']
                stat      = stats_map.get(m['id'], {})
                agg       = agg_map.get(m['id'], {})

                all_rows.append({
                    'id':                m['id'],
                    'title_en':          title_en,
                    'title_ja_ro':       attrs['title'].get('ja-ro'),
                    'title_ja':          attrs['title'].get('ja'),
                    'cover_url':         cover_url,
                    'description_en':    (attrs.get('description') or {}).get('en', '')[:2000],
                    'status':            attrs.get('status'),
                    'demographic':       attrs.get('publicationDemographic'),
                    'content_rating':    attrs.get('contentRating'),
                    'year':              attrs.get('year'),
                    'last_chapter':      attrs.get('lastChapter'),
                    'last_volume':       attrs.get('lastVolume'),
                    'original_language': attrs.get('originalLanguage'),
                    'genres':            genres,
                    'themes':            themes,
                    'author':            ', '.join(authors[:2]) if authors else None,
                    'follows':           stat.get('follows'),
                    'rating':            round(stat.get('rating', {}).get('bayesian', 0), 2) or None,
                    'chapters':          agg.get('chapters'),
                    'volumes':           agg.get('volumes'),
                    'synced_at':         now,
                })

            print(f"✓ {len(items)} manga")

            # Upsert each page immediately
            upsert_batch('manga', all_rows[-len(items):], batch_size=25, quiet=True)

            time.sleep(2)   # MangaDex: 2s between pages

        except Exception as e:
            print(f"✗ {e} — skipping page")
            time.sleep(10)

    return all_rows

# ── Upsert ────────────────────────────────────────────────────

def upsert_batch(table, rows, batch_size=100, quiet=False):
    if not rows:
        return
    total = len(rows)
    if not quiet:
        print(f"\n💾 Upserting {total} rows into '{table}'...")
    for i in range(0, total, batch_size):
        batch = rows[i:i + batch_size]
        if not quiet:
            print(f"  Batch {i//batch_size+1}/{-(-total//batch_size)} ({len(batch)} rows)...", end=' ')
        try:
            supabase_upsert(table, batch)
            if not quiet:
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
    manga_rows = fetch_manga(total=500)

    elapsed = time.time() - start
    print(f"\n✅ Done in {elapsed/60:.1f} min")
    print(f"   Anime: {len(anime_rows)} rows")
    print(f"   Manga: {len(manga_rows)} rows")

# ── Novels (RanobeDB) ─────────────────────────────────────────

RANOBE_URL = 'https://ranobedb-s1pr.onrender.com/api/v0'

def fetch_novels_cache(total=500):
    limit  = 24
    pages  = (total + limit - 1) // limit
    all_rows = []
    print(f"\n📖 Fetching top {total} novels from RanobeDB ({pages} pages × {limit})...")

    for page in range(1, pages + 1):
        print(f"  Page {page}/{pages}...", end=' ', flush=True)
        try:
            params = f'limit={limit}&page={page}&sort=num_books'
            data   = fetch_json(f'{RANOBE_URL}/series?{params}')
            items  = data.get('series', [])
            if not items:
                print("no data — stopping")
                break

            now = datetime.now(timezone.utc).isoformat()
            for s in items:
                cover_fn = s.get('book', {}).get('image', {}).get('filename') if s.get('book') else None
                cover_url = f"https://images.ranobedb.org/{cover_fn}" if cover_fn else None
                genres = [t['name'] for t in (s.get('tags') or []) if t.get('ttype') == 'genre']
                rating = s.get('rating') or {}
                all_rows.append({
                    'id':                   s['id'],
                    'title':                s.get('title'),
                    'romaji':               s.get('romaji'),
                    'title_orig':           s.get('title_orig'),
                    'cover_url':            cover_url,
                    'description':          (s.get('book_description') or {}).get('description', '')[:2000],
                    'publication_status':   s.get('publication_status'),
                    'num_books':            s.get('c_num_books') or 0,
                    'start_date':           s.get('c_start_date'),
                    'end_date':             s.get('c_end_date'),
                    'genres':               genres,
                    'score':                float(rating.get('score', 0)) or None,
                    'score_count':          rating.get('count'),
                    'synced_at':            now,
                })

            print(f"✓ {len(items)} novels")
            upsert_batch('novels', all_rows[-len(items):], batch_size=50, quiet=True)
            time.sleep(1.5)

        except Exception as e:
            print(f"✗ {e} — skipping page")
            time.sleep(5)

    return all_rows
