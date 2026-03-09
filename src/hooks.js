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
          sort === 'POPULARITY_DESC' ? 'popularity.desc'
        : sort === 'SCORE_DESC'      ? 'average_score.desc'
        : sort === 'TRENDING_DESC'   ? 'popularity.desc'
        : sort === 'START_DATE_DESC' ? 'season_year.desc'
        : sort === 'START_DATE'      ? 'season_year.asc'
        : sort === 'TITLE_ROMAJI'    ? 'title_romaji.asc'
        : sort === 'FAVOURITES_DESC' ? 'favourites.desc'
        : 'popularity.desc'

      const params = new URLSearchParams()
      params.append('limit',  LIMIT)
      params.append('offset', off)
      params.append('order',  sortCol)
      params.append('select', '*')

      if (search)                params.append('or', `(title_romaji.ilike.*${search}*,title_english.ilike.*${search}*)`)
      if (status)                params.append('status', `eq.${status}`)
      if (format)                params.append('format', `eq.${format}`)
      if (genre && genre !== 'All') params.append('genres', `cs.{"${genre}"}`)

      // Get total count
      const countParams = new URLSearchParams(params)
      countParams.set('limit', 1)
      countParams.set('offset', 0)

      const [data, countRes] = await Promise.all([
        sbFetch('anime', params.toString()),
        fetch(`${SUPABASE_URL}/rest/v1/anime?${countParams}`, {
          headers: {
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`,
            Prefer: 'count=exact',
          },
        }),
      ])

      const total = parseInt(countRes.headers?.get?.('content-range')?.split('/')?.[1] || 0)
      setAnime(prev => reset ? data : [...prev, ...data])
      setHasNext(off + LIMIT < total)
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
          sort === 'followedCount'         ? 'follows.desc'
        : sort === 'rating'                ? 'rating.desc'
        : sort === 'latestUploadedChapter' ? 'synced_at.desc'
        : sort === 'createdAt'             ? 'year.desc'
        : sort === 'title'                 ? 'title_en.asc'
        : 'follows.desc'

      const params = new URLSearchParams()
      params.append('limit',  LIMIT)
      params.append('offset', off)
      params.append('order',  sortCol)
      params.append('select', '*')

      if (search)      params.append('or',            `(title_en.ilike.*${search}*,title_ja_ro.ilike.*${search}*)`)
      if (status)      params.append('status',        `eq.${status}`)
      if (demographic) params.append('demographic',   `eq.${demographic}`)
      if (tag)         params.append('genres',        `cs.{"${tag}"}`)

      const [data] = await Promise.all([
        sbFetch('manga', params.toString()),
      ])

      // Normalize to same shape the cards/modals expect
      const normalized = data.map(m => ({
        id: m.id,
        attributes: {
          title:                  { en: m.title_en, 'ja-ro': m.title_ja_ro, ja: m.title_ja },
          description:            { en: m.description_en },
          status:                 m.status,
          publicationDemographic: m.demographic,
          year:                   m.year,
          lastChapter:            m.last_chapter,
          lastVolume:             m.last_volume,
          originalLanguage:       m.original_language,
          tags: [
            ...(m.genres || []).map(g => ({ attributes: { group: 'genre',  name: { en: g } } })),
            ...(m.themes || []).map(t => ({ attributes: { group: 'theme',  name: { en: t } } })),
          ],
        },
        relationships: [
          ...(m.author ? [{ type: 'author', attributes: { name: m.author } }] : []),
        ],
        _cover_url: m.cover_url,
        _stats: {
          rating:   m.rating   ? String(parseFloat(m.rating).toFixed(2)) : null,
          follows:  m.follows,
          chapters: m.chapters,
          volumes:  m.volumes,
        },
      }))

      setManga(prev => reset ? normalized : [...prev, ...normalized])
      setHasNext(off + LIMIT < (totalCount || 999))
      setTotalCount(prev => reset ? (data.length < LIMIT ? off + data.length : prev) : prev)
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
export function useSeriesNovels({ search, sort, status, genre }) {
  const [series,      setSeries]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)
  const [offset,      setOffset]      = useState(0)
  const [hasMore,     setHasMore]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)
  const LIMIT = 24

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
  }, [search, sort, status, genre])

  const loadMore = () => fetchNovels(offset + LIMIT, false)
  const retry    = () => fetchNovels(0, true)

  return { series, loading, loadingMore, error, hasMore, totalCount, loadMore, retry }
}

/* ── Fetch distinct genres for novel filter ───────────────── */
export function useNovelGenres() {
  const [genres, setGenres] = useState([])
  useEffect(() => {
    sbFetch('series', 'item_type=eq.novel&select=genres&limit=1000')
      .then(rows => {
        const seen = new Set()
        rows.forEach(r => (r.genres || []).forEach(g => seen.add(g)))
        const sorted = [...seen].sort()
        setGenres(sorted.map(g => ({ id: g, name: g })))
      })
      .catch(() => {})
  }, [])
  return genres
}
