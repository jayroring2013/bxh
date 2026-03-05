export const RANOBE  = 'https://ranobedb-s1pr.onrender.com/api/v0'

// ── CORS proxy (Cloudflare Worker) ───────────────────────────
// On localhost we call APIs directly.
// On GitHub Pages we route through the worker to bypass CORS.
// Replace WORKER_URL with your deployed worker URL after setup.
const WORKER_URL = 'YOUR_WORKER_URL'  // e.g. https://noveltrend-proxy.yourname.workers.dev
const IS_LOCAL   = window.location.hostname === 'localhost'
                || window.location.hostname === '127.0.0.1'

export const ANILIST    = IS_LOCAL ? 'https://graphql.anilist.co'    : `${WORKER_URL}/anilist`
export const MANGADEX   = IS_LOCAL ? 'https://api.mangadex.org'      : `${WORKER_URL}/mangadex`

export const CYAN    = '#06B6D4'
export const PURPLE  = '#8B5CF6'

/* ── Novel options ─────────────────────────────────────────── */
export const NOVEL_SORTS = [
  { id: 'Start date desc', label: '🆕 Newest'     },
  { id: 'Start date asc',  label: '📅 Oldest'     },
  { id: 'Title asc',       label: '🔤 A-Z'        },
  { id: 'Title desc',      label: '🔤 Z-A'        },
  { id: 'Num. books desc', label: '📚 Most Vols'  },
  { id: 'Num. books asc',  label: '📖 Fewest Vols'},
]

export const NOVEL_STATUSES = [
  { id: 'all',       label: 'All'       },
  { id: 'ongoing',   label: 'Ongoing'   },
  { id: 'completed', label: 'Completed' },
  { id: 'hiatus',    label: 'Hiatus'    },
  { id: 'cancelled', label: 'Cancelled' },
]

/* ── Anime options ─────────────────────────────────────────── */
export const ANIME_SORTS = [
  { id: 'POPULARITY_DESC', label: '🔥 Popular'    },
  { id: 'SCORE_DESC',      label: '⭐ Top Rated'  },
  { id: 'TRENDING_DESC',   label: '📈 Trending'   },
  { id: 'START_DATE_DESC', label: '🆕 Newest'     },
  { id: 'START_DATE',      label: '📅 Oldest'     },
  { id: 'TITLE_ROMAJI',    label: '🔤 A-Z'        },
  { id: 'FAVOURITES_DESC', label: '❤️ Favourited' },
]

export const ANIME_STATUSES = [
  { id: '',                  label: 'All'      },
  { id: 'RELEASING',         label: 'Airing'   },
  { id: 'FINISHED',          label: 'Finished' },
  { id: 'NOT_YET_RELEASED',  label: 'Upcoming' },
  { id: 'CANCELLED',         label: 'Cancelled'},
]

export const ANIME_FORMATS = [
  { id: '',        label: 'All'     },
  { id: 'TV',      label: 'TV'      },
  { id: 'MOVIE',   label: 'Movie'   },
  { id: 'OVA',     label: 'OVA'     },
  { id: 'ONA',     label: 'ONA'     },
  { id: 'SPECIAL', label: 'Special' },
]

export const ANIME_GENRES = [
  'All','Action','Adventure','Comedy','Drama','Fantasy','Horror',
  'Mecha','Mystery','Psychological','Romance','Sci-Fi',
  'Slice of Life','Sports','Supernatural','Thriller',
]

/* ── Helpers ───────────────────────────────────────────────── */
export const novelStatusColor = s =>
    s === 'completed' ? 'rgba(34,197,94,0.9)'
  : s === 'ongoing'   ? 'rgba(139,92,246,0.85)'
  : s === 'hiatus'    ? 'rgba(234,179,8,0.85)'
  : s === 'cancelled' ? 'rgba(239,68,68,0.85)'
  : 'rgba(100,116,139,0.85)'

export const animeStatusColor = s =>
    s === 'FINISHED'          ? 'rgba(34,197,94,0.9)'
  : s === 'RELEASING'         ? 'rgba(6,182,212,0.85)'
  : s === 'NOT_YET_RELEASED'  ? 'rgba(234,179,8,0.85)'
  : s === 'CANCELLED'         ? 'rgba(239,68,68,0.85)'
  : 'rgba(100,116,139,0.85)'

export const animeStatusLabel = s =>
    s === 'RELEASING'        ? 'Airing'
  : s === 'NOT_YET_RELEASED' ? 'Upcoming'
  : s === 'FINISHED'         ? 'Finished'
  : s === 'CANCELLED'        ? 'Cancelled'
  : s || 'Unknown'

export const fmtDate = d =>
  d?.year
    ? `${d.year}-${String(d.month || 1).padStart(2,'0')}-${String(d.day || 1).padStart(2,'0')}`
    : '?'

/* ── Manga options ─────────────────────────────────────────── */
export const MANGADEX_COVER = 'https://uploads.mangadex.org/covers'
export const ROSE = '#F43F5E'

export const MANGA_SORTS = [
  { id: 'followedCount',  label: '🔥 Popular'   },
  { id: 'rating',         label: '⭐ Top Rated'  },
  { id: 'latestUploadedChapter', label: '🆕 Latest' },
  { id: 'createdAt',      label: '📅 Newest'     },
  { id: 'title',          label: '🔤 A-Z'        },
  { id: 'relevance',      label: '🎯 Relevance'  },
]

export const MANGA_STATUSES = [
  { id: '',           label: 'All'       },
  { id: 'ongoing',    label: 'Ongoing'   },
  { id: 'completed',  label: 'Completed' },
  { id: 'hiatus',     label: 'Hiatus'    },
  { id: 'cancelled',  label: 'Cancelled' },
]

export const MANGA_DEMOGRAPHICS = [
  { id: '',          label: 'All'      },
  { id: 'shounen',   label: 'Shounen'  },
  { id: 'shoujo',    label: 'Shoujo'   },
  { id: 'seinen',    label: 'Seinen'   },
  { id: 'josei',     label: 'Josei'    },
]

export const mangaStatusColor = s =>
    s === 'completed' ? 'rgba(34,197,94,0.9)'
  : s === 'ongoing'   ? 'rgba(244,63,94,0.85)'
  : s === 'hiatus'    ? 'rgba(234,179,8,0.85)'
  : s === 'cancelled' ? 'rgba(239,68,68,0.85)'
  : 'rgba(100,116,139,0.85)'
