# NovelTrend

A Vietnamese/English tracking site for Light Novels, Anime, and Manga.
Built with React + Vite, hosted on GitHub Pages, backed by Supabase.

## Setup

### 1. Supabase — Run SQL files in order
Go to supabase.com → SQL Editor → run each file:
1. `supabase_schema.sql`          — vote tables
2. `supabase_anime_manga.sql`     — anime/manga cache tables
3. `supabase_novels.sql`          — novel cache table
4. `supabase_user_lists.sql`      — user list tracking
5. `supabase_storage.sql`         — manga cover image bucket
6. `supabase_vote_fix.sql`        — vote fraud prevention

### 2. GitHub Secrets
Go to your repo → Settings → Secrets → Actions → add:

| Secret name               | Value                                      |
|---------------------------|--------------------------------------------|
| `VITE_SUPABASE_URL`       | `https://yourproject.supabase.co`          |
| `VITE_SUPABASE_ANON_KEY`  | Your anon/public key from Supabase → API   |
| `SUPABASE_SERVICE_KEY`    | Your service_role key (for sync script)    |

### 3. Local development
```bash
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

### 4. First data sync
Go to Actions → Weekly Data Sync → Run workflow manually.
This takes ~45-60 minutes to fetch and cache all data.

### 5. Google OAuth (optional)
- Supabase → Authentication → Providers → Google → Enable
- Add redirect URL: `https://yourusername.github.io/bxh/`

## Architecture
- **Frontend**: React 18 + Vite, deployed to GitHub Pages
- **Database**: Supabase PostgreSQL (auth + data + storage)
- **Data sync**: Python script run weekly via GitHub Actions
- **Sources**: RanobeDB (novels), AniList (anime), MangaDex (manga)
