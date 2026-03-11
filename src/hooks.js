import { useState, useEffect, useRef } from 'react'
import { RANOBE } from './constants.js'
import { SUPABASE_URL, SUPABASE_ANON } from './supabase.js'

/* ── Hash-based router ────────────────────────────────────── */
export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#/')
  useEffect(() => {
    const fn = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return hash
}
/* ── URL / navigation helpers ────────────────────────────────── */
export function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đ]/g, 'd').replace(/[Đ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function seriesUrl(series) {
  return `#/novel/${slugify(series.title)}-${series.id}`
}

// Match either a UUID or a plain integer at the end of a #/novel/slug-{id} path
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

export function parseSeriesId(hash) {
  // Strip /volume/N suffix first
  const base = hash.replace(/\/volume\/\d+.*$/, '')
  // Try UUID first
  const uuidM = base.match(UUID_RE)
  if (uuidM) return uuidM[0]
  // Fall back to trailing integer (e.g. slug-123)
  const intM = base.match(/-(\d+)(?:[^-\d].*)?$/)
  return intM ? intM[1] : null
}

export function parseVolumeNumber(hash) {
  const m = hash.match(/\/volume\/(\d+)/)
  return m ? parseInt(m[1]) : null
}



/* ── Debounced value ──────────────────────────────────────── */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/* ── Fetch light novels ───────────────────────────────────── */
export function useNovels({ search, sort, status, genre }) {
  const [series,      setSeries]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)
  const [offset,      setOffset]      = useState(0)
  const [hasMore,     setHasMore]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)
  const LIMIT = 24

  const fetch_novels = async (off, reset) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true)
      setError(null)

      // Try Supabase cache first
      const params = new URLSearchParams()
      params.set('limit',  LIMIT)
      params.set('offset', off)
      params.set('select', '*')

      const sortCol =
          sort === 'Start date desc' ? 'start_date.desc'
        : sort === 'Start date asc'  ? 'start_date.asc'
        : sort === 'Title asc'       ? 'title.asc'
        : sort === 'Title desc'      ? 'title.desc'
        : sort === 'Num. books desc' ? 'num_books.desc'
        : sort === 'Num. books asc'  ? 'num_books.asc'
        : 'start_date.desc'
      params.set('order', sortCol)

      if (search.trim()) {
        const enc = encodeURIComponent(search.trim())
        params.set('or', `(title.ilike.%25${enc}%25,romaji.ilike.%25${enc}%25)`)
      }
      if (status && status !== 'all') params.set('publication_status', `eq.${status}`)
      if (genre  && genre  !== 'all') params.set('genres', `cs.{"${genre}"}`)

      let usedCache = false
      try {
        const data = await sbFetch('novels', params.toString())
        if (data && data.length > 0) {
          // Normalize Supabase rows to match RanobeDB shape
          const normalized = data.map(n => ({
            ...n,
            description: typeof n.description === 'object' ? n.description?.en : n.description,
            book:   n.cover_url ? { image: { filename: n.cover_url.replace('https://images.ranobedb.org/', '') } } : null,
            tags:   (n.genres || []).map(g => ({ name: g, ttype: 'genre' })),
            rating: { score: n.score, count: n.score_count },
            c_num_books: n.num_books,
            c_start_date: n.start_date,
            c_end_date:   n.end_date,
          }))
          setSeries(prev => reset ? normalized : [...prev, ...normalized])
          setHasMore(data.length === LIMIT)
          setTotalCount(prev => reset ? data.length : prev + data.length)
          setOffset(off)
          usedCache = true
        }
      } catch (_) {}

      // Fallback to live API if cache empty or failed
      if (!usedCache) {
        const liveParams = new URLSearchParams({ limit: LIMIT, page: Math.floor(off / LIMIT) + 1, sort, rl: 'ja' })
        if (search.trim())    liveParams.set('q', search.trim())
        if (status !== 'all') liveParams.set('pubStatus', status)
        if (genre  !== 'all') liveParams.append('genresInclude', genre)
        const res  = await fetch(`${RANOBE}/series?${liveParams}`)
        if (!res.ok) throw new Error(`API ${res.status}`)
        const data = await res.json()
        setSeries(prev => reset ? (data.series || []) : [...prev, ...(data.series || [])])
        setHasMore((Math.floor(off / LIMIT) + 1) < (data.totalPages || 1))
        setTotalCount(parseInt(data.count) || 0)
        setOffset(off)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setSeries([])
    setOffset(0)
    fetch_novels(0, true)
  }, [search, sort, status, genre])

  const loadMore = () => fetch_novels(offset + LIMIT, false)
  const retry    = () => fetch_novels(0, true)

  return { series, loading, loadingMore, error, hasMore, totalCount, loadMore, retry }
}

/* ── Supabase query helper ────────────────────────────────── */
const sbFetch = async (table, query) => {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`
  const res  = await fetch(url, {
    headers: {
      apikey:        SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Supabase ${res.status} — ${url.slice(0,80)} — ${body.slice(0,120)}`)
  }
  return res.json()
}

/* ── Fetch anime from Supabase ────────────────────────────── */
export function useAnime({ search, sort, status, format, genre }) {
  const [anime,       setAnime]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)
  const [offset,      setOffset]      = useState(0)
  const [hasNext,     setHasNext]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)
  const LIMIT = 24

  const fetch_anime = async (off, reset) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true)
      setError(null)

      const sortCol =
          sort === 'POPULARITY_DESC' ? 'score.desc.nullslast'
        : sort === 'SCORE_DESC'      ? 'score.desc.nullslast'
        : sort === 'TRENDING_DESC'   ? 'score.desc.nullslast'
        : sort === 'START_DATE_DESC' ? 'updated_at.desc.nullslast'
        : sort === 'START_DATE'      ? 'updated_at.asc.nullslast'
        : sort === 'TITLE_ROMAJI'    ? 'title.asc'
        : sort === 'FAVOURITES_DESC' ? 'score.desc.nullslast'
        : 'score.desc.nullslast'

      const params = new URLSearchParams()
      params.append('item_type', 'eq.anime')
      params.append('limit',     LIMIT)
      params.append('offset',    off)
      params.append('order',     sortCol)
      params.append('select',    '*,anime_meta(*)')

      if (search)                   params.append('or',      `(title.ilike.*${search}*,title_native.ilike.*${search}*)`)
      if (status)                   params.append('status',  `eq.${status}`)
      if (format)                   params.set('select',     `*,anime_meta!inner(*)`) // inner join when filtering by meta
      if (format)                   params.append('anime_meta.format', `eq.${format}`)
      if (genre && genre !== 'All') params.append('genres',  `cs.{"${genre}"}`)

      const countParams = new URLSearchParams(params)
      countParams.set('limit', 1)
      countParams.set('offset', 0)

      const [data, countRes] = await Promise.all([
        sbFetch('series', params.toString()),
        fetch(`${SUPABASE_URL}/rest/v1/series?${countParams}`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, Prefer: 'count=exact' },
        }),
      ])

      const normalized = (data || []).map(normalizeAnime)
      const total = parseInt(countRes.headers?.get?.('content-range')?.split('/')?.[1] || 0)
      setAnime(prev => reset ? normalized : [...prev, ...normalized])
      setHasNext(off + LIMIT < total)
      setTotalCount(total || normalized.length)
      setOffset(off)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setAnime([])
    setOffset(0)
    fetch_anime(0, true)
  }, [search, sort, status, format, genre])

  const loadMore = () => fetch_anime(offset + LIMIT, false)
  const retry    = () => fetch_anime(0, true)

  return { anime, loading, loadingMore, error, offset, hasNext, totalCount, loadMore, retry }
}

/* ── Fetch manga tags from Supabase ───────────────────────── */
export function useMangaTags() {
  const [tags, setTags] = useState([{ id: '', label: 'All' }])
  useEffect(() => {
    sbFetch('manga', 'select=genres&limit=1000')
      .then(rows => {
        const seen = new Set()
        rows.forEach(r => (r.genres || []).forEach(g => seen.add(g)))
        const sorted = [...seen].sort()
        setTags([{ id: '', label: 'All' }, ...sorted.map(g => ({ id: g, label: g }))])
      })
      .catch(() => {})
  }, [])
  return tags
}

/* ── Fetch manga from Supabase ────────────────────────────── */
export function useManga({ search, sort, status, demographic, tag }) {
  const [manga,       setManga]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)
  const [offset,      setOffset]      = useState(0)
  const [hasNext,     setHasNext]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)
  const LIMIT = 24

  const fetch_manga = async (off, reset) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true)
      setError(null)

      const sortCol =
          sort === 'followedCount'         ? 'score.desc.nullslast'
        : sort === 'rating'                ? 'score.desc.nullslast'
        : sort === 'latestUploadedChapter' ? 'updated_at.desc.nullslast'
        : sort === 'createdAt'             ? 'updated_at.desc.nullslast'
        : sort === 'title'                 ? 'title.asc'
        : 'score.desc.nullslast'

      const params = new URLSearchParams()
      params.append('item_type', 'eq.manga')
      params.append('limit',     LIMIT)
      params.append('offset',    off)
      params.append('order',     sortCol)
      params.append('select',    '*,manga_meta(*)')

      if (search)      params.append('or',      `(title.ilike.*${search}*,title_native.ilike.*${search}*)`)
      if (status)      params.append('status',  `eq.${status}`)
      if (tag)         params.append('genres',  `cs.{"${tag}"}`)
      if (demographic) {
        params.set('select', '*,manga_meta!inner(*)')
        params.append('manga_meta.demographic', `eq.${demographic}`)
      }

      const countParams = new URLSearchParams(params)
      countParams.set('limit', 1)
      countParams.set('offset', 0)

      const [data, countRes] = await Promise.all([
        sbFetch('series', params.toString()),
        fetch(`${SUPABASE_URL}/rest/v1/series?${countParams}`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, Prefer: 'count=exact' },
        }),
      ])

      const normalized = (data || []).map(normalizeManga)
      const total = parseInt(countRes.headers?.get?.('content-range')?.split('/')?.[1] || 0)
      setManga(prev => reset ? normalized : [...prev, ...normalized])
      setHasNext(off + LIMIT < total)
      setTotalCount(total || normalized.length)
      setOffset(off)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setManga([])
    setOffset(0)
    fetch_manga(0, true)
  }, [search, sort, status, demographic, tag])

  const loadMore = () => fetch_manga(offset + LIMIT, false)
  const retry    = () => fetch_manga(0, true)

  return { manga, stats: {}, loading, loadingMore, error, offset, hasNext, totalCount, loadMore, retry }
}

/* ── Fetch novels from new series table ───────────────────── */
export function useSeriesNovels({ search, sort, status, genre, publisher, limit }) {
  const [series,      setSeries]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)
  const [offset,      setOffset]      = useState(0)
  const [hasMore,     setHasMore]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)
  const LIMIT = limit || 24

  const fetchNovels = async (off, reset) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true)
      setError(null)

      const sortCol =
          sort === 'title_asc'   ? 'title.asc'
        : sort === 'title_desc'  ? 'title.desc'
        : sort === 'score_desc'  ? 'score.desc.nullslast'
        : sort === 'newest'      ? 'created_at.desc'
        : 'title.asc'

      const params = new URLSearchParams()
      params.set('item_type', 'eq.novel')
      params.set('select', 'id,item_type,title,cover_url,description,publisher,author,studio,genres,score,status,external_id')
      params.set('order', sortCol)
      params.set('limit', LIMIT)
      params.set('offset', off)

      if (search.trim()) params.set('title', `ilike.%${search.trim()}%`)
      if (status && status !== 'all') params.set('status', `eq.${status}`)
      if (genre  && genre  !== 'all') params.set('genres', `cs.{"${genre}"}`)
      if (publisher && publisher !== 'all') params.set('publisher', `eq.${publisher}`)

      // Get data + total count in parallel
      const countParams = new URLSearchParams(params)
      countParams.set('limit', 1)
      countParams.set('offset', 0)

      const [data, countRes] = await Promise.all([
        sbFetch('series', params.toString()),
        fetch(`${SUPABASE_URL}/rest/v1/series?${countParams}`, {
          headers: {
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`,
            Prefer: 'count=exact',
          },
        }),
      ])

      const total = parseInt(countRes.headers?.get?.('content-range')?.split('/')?.[1] || 0)
      setSeries(prev => reset ? data : [...prev, ...data])
      setHasMore(off + LIMIT < total)
      setTotalCount(total || data.length)
      setOffset(off)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setSeries([])
    setOffset(0)
    fetchNovels(0, true)
  }, [search, sort, status, genre, publisher])

  const loadMore = () => fetchNovels(offset + LIMIT, false)
  const retry    = () => fetchNovels(0, true)

  return { series, loading, loadingMore, error, hasMore, totalCount, loadMore, retry }
}

/* ── Fetch distinct genres for novel filter ───────────────── */
export function useNovelGenres() {
  const [genres, setGenres] = useState([])
  useEffect(() => {
    // Pull genres from vn_novels_ref (comma-separated text from NovelUpdates)
    sbFetch('vn_novels_ref', 'select=genres&limit=2000')
      .then(rows => {
        const seen = new Set()
        rows.forEach(r => {
          if (!r.genres) return
          r.genres.split(',').forEach(g => { const t = g.trim(); if (t) seen.add(t) })
        })
        const sorted = [...seen].sort()
        setGenres(sorted.map(g => ({ id: g, name: g })))
      })
      .catch(() => {})
  }, [])
  return genres
}
/* ── Fetch distinct publishers for novel filter ───────────── */
export function useNovelPublishers() {
  const [publishers, setPublishers] = useState([])
  useEffect(() => {
    sbFetch('series', 'item_type=eq.novel&select=publisher&limit=1000')
      .then(rows => {
        const seen = new Set()
        rows.forEach(r => { if (r.publisher) seen.add(r.publisher) })
        setPublishers([...seen].sort())
      })
      .catch(() => {})
  }, [])
  return publishers
}

/* ── Fetch single series by ID ───────────────────────────────── */
export function useSeriesById(id) {
  const [series,  setSeries]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    sbFetch('series', `id=eq.${id}&select=*&limit=1`)
      .then(rows => { setSeries(rows[0] || null); setLoading(false) })
      .catch(e  => { setError(e.message);          setLoading(false) })
  }, [id])

  return { series, loading, error }
}

/* ── Fetch volumes for a series ──────────────────────────────── */
export function useSeriesVolumes(seriesId) {
  const [volumes,  setVolumes]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!seriesId) return
    sbFetch('volumes',
      `series_id=eq.${seriesId}&order=volume_number.asc,is_special.asc&select=id,volume_number,volume_label,title,cover_url,release_date,description,is_special&limit=200`)
      .then(rows => { setVolumes(Array.isArray(rows) ? rows : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [seriesId])

  return { volumes, loading }
}

/* ── Fetch a single volume + its links ───────────────────────── */
export function useVolumeDetail(seriesId, volumeNumber) {
  const [volume,  setVolume]  = useState(null)
  const [links,   setLinks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!seriesId || volumeNumber == null) return
    setLoading(true)
    Promise.all([
      sbFetch('volumes',
        `series_id=eq.${seriesId}&volume_number=eq.${volumeNumber}&select=*&limit=1`),
      // volume_links has volume_id FK — fetch after we have the volume's id
      Promise.resolve(null), // placeholder, links fetched below
    ]).then(([vols]) => {
      const vol = vols[0] || null
      setVolume(vol)
      if (!vol?.id) { setLinks([]); return Promise.resolve([]) }
      return sbFetch('volume_links',
        `volume_id=eq.${vol.id}&select=link_type,label,url&limit=20`)
    }).then(lnks => {
      if (lnks) setLinks(Array.isArray(lnks) ? lnks : [])
      setLoading(false)
    }).catch(e => { setError(e.message); setLoading(false) })
  }, [seriesId, volumeNumber])

  return { volume, links, loading, error }
}

/* ── Related + recommended series ───────────────────────────── */
export function useRelatedSeries(seriesId, genres, publisher) {
  const [related, setRelated] = useState([])
  const [recs,    setRecs]    = useState([])
  const [loading, setLoading] = useState(true)

  // Relations: fire as soon as seriesId is known — no genre guard
  useEffect(() => {
    if (!seriesId) return
    sbFetch('series_relations', `series_id=eq.${seriesId}&select=related_id,relation_type&limit=20`)
      .then(rows => {
        if (!rows.length) { setRelated([]); setLoading(false); return }
        const ids = rows.map(r => r.related_id).join(',')
        return sbFetch('series', `id=in.(${ids})&select=id,title,cover_url,publisher,status,genres,item_type&limit=20`)
          .then(series => {
            const withType = series.map(s => ({
              ...s,
              relation_type: rows.find(r => r.related_id === s.id)?.relation_type ?? null,
            }))
            setRelated(withType)
            setLoading(false)
          })
      })
      .catch(() => { setRelated([]); setLoading(false) })
  }, [seriesId])

  // Recs: wait for genres/publisher to arrive
  useEffect(() => {
    if (!seriesId) return
    const g0 = (genres || [])[0]
    if (!g0 && !publisher) return
    const q = g0
      ? `genres=cs.{"${g0}"}&item_type=eq.novel&id=neq.${seriesId}&order=score.desc.nullslast&select=id,title,cover_url,publisher,status,genres&limit=16`
      : `publisher=eq.${publisher}&item_type=eq.novel&id=neq.${seriesId}&order=score.desc.nullslast&select=id,title,cover_url,publisher,status,genres&limit=16`
    sbFetch('series', q)
      .then(rec => {
        setRecs(rec || [])
      })
      .catch(() => {})
  }, [seriesId, genres, publisher])

  return { related, recs, loading }
}

/* ── Fetch series_links for a series ────────────────────────── */
export function useSeriesLinks(seriesId) {
  const [links, setLinks] = useState([])
  useEffect(() => {
    if (!seriesId) return
    sbFetch('series_links', `series_id=eq.${seriesId}&select=link_type,label,url&limit=20`)
      .then(rows => setLinks(Array.isArray(rows) ? rows : []))
      .catch(() => {})
  }, [seriesId])
  return links
}

/* ── Fetch NU/VN metadata from vn_novels_ref by series title ─── */
export function useSeriesNuData(title) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!title) { setLoading(false); return }
    // Try exact title match first, then fallback to ilike for slight differences
    sbFetch('vn_novels_ref',
      `Series=eq.${encodeURIComponent(title)}&select=nu_rating,nu_votes,genres,associated_names,num_books,start_date,end_date&limit=1`)
      .then(rows => {
        if (rows.length) { setData(rows[0]); setLoading(false); return }
        // Fallback: case-insensitive partial match
        return sbFetch('vn_novels_ref',
          `Series=ilike.${encodeURIComponent(title)}&select=nu_rating,nu_votes,genres,associated_names,num_books,start_date,end_date&limit=1`)
      })
      .then(rows => { if (rows) setData(rows[0] || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [title])

  return { nuData: data, loading }
}


/* ── Anime carousel (single carousel fetch, no pagination) ──── */
export function useAnimeCarousel({ status = '', format = '', genre = 'All', sort = 'POPULARITY_DESC', limit = 18 }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append('item_type', 'eq.anime')
    params.append('limit',     limit)
    params.append('offset',    0)
    params.append('order',     'score.desc.nullslast')
    params.append('select',    '*,anime_meta(*)')
    if (status)                   params.append('status',  `eq.${status}`)
    if (genre && genre !== 'All') params.append('genres',  `cs.{"${genre}"}`)
    if (format) {
      params.set('select', '*,anime_meta!inner(*)')
      params.append('anime_meta.format', `eq.${format}`)
    }
    sbFetch('series', params.toString())
      .then(rows => setItems(rows.map(normalizeAnime)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [status, format, genre, sort, limit])
  return { items, loading }
}

/* ── Manga carousel (single carousel fetch, no pagination) ───── */
export function useMangaCarousel({ status = '', demographic = '', genre = '', sort = 'follows', limit = 18 }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.append('item_type', 'eq.manga')
    params.append('limit',     limit)
    params.append('offset',    0)
    params.append('order',     'score.desc.nullslast')
    params.append('select',    '*,manga_meta(*)')
    if (status)      params.append('status',  `eq.${status}`)
    if (genre)       params.append('genres',  `cs.{"${genre}"}`)
    if (demographic) {
      params.set('select', '*,manga_meta!inner(*)')
      params.append('manga_meta.demographic', `eq.${demographic}`)
    }
    sbFetch('series', params.toString())
      .then(rows => setItems(rows.map(normalizeManga)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [status, demographic, genre, sort, limit])
  return { items, loading }
}

/* ── URL helpers for anime + manga detail pages ──────────────── */
// ── Normalization helpers ────────────────────────────────────────────────────
function normalizeAnime(row) {
  if (!row) return null
  const meta = Array.isArray(row.anime_meta) ? (row.anime_meta[0] || {}) : (row.anime_meta || {})
  return {
    id:           row.id,
    external_id:  row.external_id,
    title:        row.title || '',
    title_native: row.title_native || '',
    cover_url:    row.cover_url,
    banner_url:   row.banner_url,
    description:  row.description || '',
    genres:       row.genres || [],
    status:       row.status,
    score:        row.score,
    studio:       row.publisher || row.studio || null,
    author:       row.author || null,
    // from anime_meta
    episodes:     meta.episodes     ?? null,
    duration_min: meta.duration_min ?? null,
    format:       meta.format       ?? null,
    season:       meta.season       ?? null,
    season_year:  meta.season_year  ?? null,
    mean_score:   meta.mean_score   ?? null,
    popularity:   meta.popularity   ?? null,
    favourites:   meta.favourites   ?? null,
    start_date:   meta.start_date   ?? null,
    end_date:     meta.end_date     ?? null,
  }
}

function normalizeManga(row) {
  if (!row) return null
  const meta = Array.isArray(row.manga_meta) ? (row.manga_meta[0] || {}) : (row.manga_meta || {})
  return {
    id:               row.id,
    external_id:      row.external_id,
    title:            row.title || '',
    title_native:     row.title_native || '',
    cover_url:        row.cover_url,
    description:      row.description || '',
    genres:           row.genres || [],
    status:           row.status,
    score:            row.score,
    author:           row.author || null,
    publisher:        row.publisher || null,
    // from manga_meta
    demographic:      meta.demographic      ?? null,
    content_rating:   meta.content_rating   ?? null,
    original_language: meta.original_language ?? 'ja',
    year:             meta.year             ?? null,
    last_chapter:     meta.last_chapter     ?? null,
    last_volume:      meta.last_volume      ?? null,
    chapters:         meta.chapters         ?? null,
    volumes:          meta.volumes          ?? null,
    follows:          meta.follows          ?? null,
  }
}

/* ── URL helpers ─────────────────────────────────────────────── */
export function animeUrl(a) {
  const title = a.title || ''
  return `#/anime/${slugify(title)}-${a.id}`
}

export function mangaUrl(m) {
  const title = m.title || ''
  return `#/manga/${slugify(title)}-${m.id}`
}

export function parseAnimeId(hash) {
  const base = hash.replace(/^#\/anime\//, '')
  const m = base.match(/-(\d+)$/)
  return m ? m[1] : base || null
}

export function parseMangaId(hash) {
  const base = hash.replace(/^#\/manga\//, '')
  // UUID (old MangaDex links)
  const uuidM = base.match(UUID_RE)
  if (uuidM) return uuidM[0]
  // trailing integer (series.id or old AniList id)
  const m = base.match(/-(\d+)$/)
  return m ? m[1] : base || null
}

/* ── Fetch a single anime from series + anime_meta ───────────── */
export function useAnimeById(id) {
  const [anime,   setAnime]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  useEffect(() => {
    if (!id) return
    setLoading(true)
    const qs = `item_type=eq.anime&select=*,anime_meta(*)&limit=1`
    // Try series.id (bigint) first, then fall back to external_id for old URLs
    sbFetch('series', `id=eq.${id}&${qs}`)
      .then(rows => {
        if (rows[0]) { setAnime(normalizeAnime(rows[0])); setLoading(false); return }
        return sbFetch('series', `external_id=eq.${id}&${qs}`)
          .then(rows2 => { setAnime(normalizeAnime(rows2[0] || null)); setLoading(false) })
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])
  return { anime, loading, error }
}

/* ── Fetch a single manga from series + manga_meta ───────────── */
export function useMangaById(id) {
  const [manga,   setManga]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  useEffect(() => {
    if (!id) return
    setLoading(true)
    const qs = `item_type=eq.manga&select=*,manga_meta(*)&limit=1`
    const isUuid = UUID_RE.test(id)
    // UUID → external_id lookup (old MangaDex links)
    // Integer → try series.id first, then external_id
    const primary = isUuid
      ? sbFetch('series', `external_id=eq.${id}&${qs}`)
      : sbFetch('series', `id=eq.${id}&${qs}`)
    primary
      .then(rows => {
        if (rows[0]) { setManga(normalizeManga(rows[0])); setLoading(false); return }
        if (!isUuid) {
          return sbFetch('series', `external_id=eq.${id}&${qs}`)
            .then(rows2 => { setManga(normalizeManga(rows2[0] || null)); setLoading(false) })
        }
        setManga(null); setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])
  return { manga, loading, error }
}

/* ── Related anime via series_relations (seriesId = series.id) ── */
export function useAnimeRelated(seriesId, genres) {
  const [related, setRelated] = useState([])
  const [recs,    setRecs]    = useState([])

  useEffect(() => {
    if (!seriesId) return
    sbFetch('series_relations', `series_id=eq.${seriesId}&select=related_id,relation_type&limit=20`)
      .then(rels => {
        if (!rels.length) { setRelated([]); return }
        const ids = rels.map(r => r.related_id).join(',')
        return sbFetch('series', `id=in.(${ids})&select=id,title,cover_url,genres,status,item_type&limit=20`)
          .then(rows => setRelated(rows.map(r => ({
            ...r, relation_type: rels.find(rel => rel.related_id === r.id)?.relation_type ?? null
          }))))
      })
      .catch(() => setRelated([]))
  }, [seriesId])

  useEffect(() => {
    if (!seriesId) return
    const g0 = (genres || [])[0]
    if (!g0) return
    sbFetch('series', `genres=cs.{"${g0}"}&item_type=eq.anime&id=neq.${seriesId}&order=score.desc.nullslast&select=id,title,cover_url,genres,status&limit=12`)
      .then(rows => setRecs(rows.filter(r => r.id !== seriesId)))
      .catch(() => {})
  }, [seriesId, (genres||[]).join(',')])

  return { related, recs }
}

/* ── Related manga via series_relations (seriesId = series.id) ── */
export function useMangaRelated(seriesId, genres) {
  const [related, setRelated] = useState([])
  const [recs,    setRecs]    = useState([])

  useEffect(() => {
    if (!seriesId) return
    sbFetch('series_relations', `series_id=eq.${seriesId}&select=related_id,relation_type&limit=20`)
      .then(rels => {
        if (!rels.length) { setRelated([]); return }
        const ids = rels.map(r => r.related_id).join(',')
        return sbFetch('series', `id=in.(${ids})&select=id,title,cover_url,genres,status,item_type&limit=20`)
          .then(rows => setRelated(rows.map(r => ({
            ...r, relation_type: rels.find(rel => rel.related_id === r.id)?.relation_type ?? null
          }))))
      })
      .catch(() => setRelated([]))
  }, [seriesId])

  useEffect(() => {
    if (!seriesId) return
    const g0 = (genres || [])[0]
    if (!g0) return
    sbFetch('series', `genres=cs.{"${g0}"}&item_type=eq.manga&id=neq.${seriesId}&order=score.desc.nullslast&select=id,title,cover_url,genres,status&limit=12`)
      .then(rows => setRecs(rows.filter(r => r.id !== seriesId)))
      .catch(() => {})
  }, [seriesId, (genres||[]).join(',')])

  return { related, recs }
}

/* ── Series stats (views, bookmarks, avg rating) ─────────────── */
export function useSeriesStats(seriesId) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!seriesId) return
    sbFetch('series_stats_view', `series_id=eq.${seriesId}&select=views,bookmarks,avg_rating,rating_count`)
      .then(rows => setStats(rows[0] || null))
      .catch(() => {})

    // fire-and-forget view increment
    fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_series_view`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_series_id: seriesId }),
    }).catch(() => {})
  }, [seriesId])

  return stats
}

/* ── User's own rating for a series ─────────────────────────── */
export function useUserRating(seriesId, userToken) {
  const [rating,    setRating]    = useState(null)   // 1-5 or null
  const [saving,    setSaving]    = useState(false)
  const [hovered,   setHovered]   = useState(0)

  useEffect(() => {
    if (!seriesId || !userToken) { setRating(null); return }
    fetch(`${SUPABASE_URL}/rest/v1/series_ratings?series_id=eq.${seriesId}&select=rating`, {
      headers: {
        apikey:        SUPABASE_ANON,
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(r => r.json())
      .then(rows => setRating(rows[0]?.rating ?? null))
      .catch(() => {})
  }, [seriesId, userToken])

  const submitRating = async (stars) => {
    if (!userToken || saving) return
    const value = Math.round(stars * 2) / 2  // snap to nearest 0.5
    if (value < 0.5 || value > 5) return
    setSaving(true)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/series_ratings`, {
        method: 'POST',
        headers: {
          apikey:        SUPABASE_ANON,
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({ series_id: seriesId, rating: value }),
      })
      setRating(value)
    } catch (e) {
      console.error('Rating submit failed:', e)
    } finally {
      setSaving(false)
    }
  }

  return { rating, hovered, setHovered, submitRating, saving }
}
