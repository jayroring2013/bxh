import { useState, useEffect, useRef } from 'react'
import { RANOBE, ANILIST } from './constants.js'

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
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [totalCount,  setTotalCount]  = useState(0)

  const fetch_novels = async (p, reset) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true)
      setError(null)
      const params = new URLSearchParams({ limit: 24, page: p, sort, rl: 'ja' })
      if (search.trim())    params.set('q', search.trim())
      if (status !== 'all') params.set('pubStatus', status)
      if (genre  !== 'all') params.append('genresInclude', genre)
      const res  = await fetch(`${RANOBE}/series?${params}`)
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      setSeries(prev => reset ? (data.series || []) : [...prev, ...(data.series || [])])
      setTotalPages(data.totalPages || 1)
      setTotalCount(parseInt(data.count) || 0)
      setPage(p)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setSeries([])
    setPage(1)
    fetch_novels(1, true)
  }, [search, sort, status, genre])

  const loadMore = () => fetch_novels(page + 1, false)
  const retry    = () => fetch_novels(1, true)

  return { series, loading, loadingMore, error, page, totalPages, totalCount, loadMore, retry }
}

/* ── Fetch anime ──────────────────────────────────────────── */
const ANIME_QUERY = `
  query(
    $page:Int, $perPage:Int, $sort:[MediaSort], $type:MediaType,
    $search:String, $status:MediaStatus, $format:MediaFormat, $genre:String
  ){
    Page(page:$page, perPage:$perPage){
      pageInfo { total currentPage lastPage hasNextPage }
      media(
        sort:$sort, type:$type, search:$search,
        status:$status, format:$format, genre:$genre
      ){
        id
        title { romaji english native }
        coverImage { extraLarge large color }
        bannerImage
        description(asHtml:false)
        genres status format episodes duration
        season seasonYear
        startDate { year month day }
        endDate   { year month day }
        averageScore meanScore popularity favourites
        studios(isMain:true) { nodes { id name } }
        nextAiringEpisode { episode airingAt }
        siteUrl
      }
    }
  }
`

export function useAnime({ search, sort, status, format, genre }) {
  const [anime,       setAnime]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error,       setError]       = useState(null)
  const [page,        setPage]        = useState(1)
  const [hasNext,     setHasNext]     = useState(false)
  const [totalCount,  setTotalCount]  = useState(0)

  const fetch_anime = async (p, reset) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true)
      setError(null)
      const vars = { page: p, perPage: 24, sort: [sort], type: 'ANIME' }
      if (search)               vars.search = search
      if (status)               vars.status = status
      if (format)               vars.format = format
      if (genre && genre !== 'All') vars.genre = genre
      const res  = await fetch(ANILIST, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({ query: ANIME_QUERY, variables: vars }),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const json = await res.json()
      if (json.errors) throw new Error(json.errors[0].message)
      const pg    = json.data?.Page
      const items = pg?.media || []
      setAnime(prev => reset ? items : [...prev, ...items])
      setHasNext(pg?.pageInfo?.hasNextPage || false)
      setTotalCount(pg?.pageInfo?.total    || 0)
      setPage(p)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setAnime([])
    setPage(1)
    fetch_anime(1, true)
  }, [search, sort, status, format, genre])

  const loadMore = () => fetch_anime(page + 1, false)
  const retry    = () => fetch_anime(1, true)

  return { anime, loading, loadingMore, error, page, hasNext, totalCount, loadMore, retry }
}

/* ── Fetch manga tags ─────────────────────────────────────── */
export function useMangaTags() {
  const [tags, setTags] = useState([])
  useEffect(() => {
    fetch('https://api.mangadex.org/manga/tag')
      .then(r => r.json())
      .then(d => {
        const genres = (d.data || [])
          .filter(t => t.attributes.group === 'genre')
          .map(t => ({ id: t.id, label: t.attributes.name.en }))
          .sort((a, b) => a.label.localeCompare(b.label))
        setTags([{ id: '', label: 'All' }, ...genres])
      })
      .catch(() => setTags([{ id: '', label: 'All' }]))
  }, [])
  return tags
}

/* ── Fetch manga ──────────────────────────────────────────── */
export function useManga({ search, sort, status, demographic, tag }) {
  const [manga,       setManga]       = useState([])
  const [stats,       setStats]       = useState({})   // id -> { rating, follows }
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

      const params = new URLSearchParams()
      params.append('limit', LIMIT)
      params.append('offset', off)
      params.append(`order[${sort}]`, 'desc')
      params.append('contentRating[]', 'safe')
      params.append('contentRating[]', 'suggestive')
      params.append('includes[]', 'cover_art')
      params.append('includes[]', 'author')
      params.append('includes[]', 'artist')
      params.append('availableTranslatedLanguage[]', 'en')
      if (search)      params.append('title', search)
      if (status)      params.append('status[]', status)
      if (demographic) params.append('publicationDemographic[]', demographic)
      if (tag)         params.append('includedTags[]', tag)

      const res  = await fetch(`https://api.mangadex.org/manga?${params}`)
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      const items = data.data || []

      setManga(prev => reset ? items : [...prev, ...items])
      setHasNext(off + LIMIT < (data.total || 0))
      setTotalCount(data.total || 0)
      setOffset(off)

      // Fetch statistics + aggregate (chapters/volumes) for these manga
      if (items.length > 0) {
        const ids = items.map(m => m.id)

        // 1) Statistics — rating & follows
        const statParams = new URLSearchParams()
        ids.forEach(id => statParams.append('manga[]', id))
        const statRes = await fetch(`https://api.mangadex.org/statistics/manga?${statParams}`)
        if (statRes.ok) {
          const statData = await statRes.json()
          const newStats = {}
          Object.entries(statData.statistics || {}).forEach(([id, s]) => {
            newStats[id] = {
              rating:  s.rating?.bayesian ? s.rating.bayesian.toFixed(2) : null,
              follows: s.follows ?? null,
            }
          })

          // 2) Aggregate — chapter & volume counts (one request per manga, run in parallel)
          const aggResults = await Promise.allSettled(
            ids.map(async id => {
              // Try English first
              let res = await fetch(`https://api.mangadex.org/manga/${id}/aggregate?translatedLanguage[]=en`)
              let data = await res.json()
              let volumes = data.volumes

              // If volumes came back as an empty array, retry without language filter
              if (!volumes || (Array.isArray(volumes) && volumes.length === 0)) {
                res = await fetch(`https://api.mangadex.org/manga/${id}/aggregate`)
                data = await res.json()
                volumes = data.volumes
              }

              if (!volumes || Array.isArray(volumes)) return { id, vols: null, chaps: null }

              // Count volumes (exclude the "none" bucket)
              const volCount = Object.keys(volumes).filter(k => k !== 'none').length

              // Count all unique chapters across every volume including "none"
              const allChapters = new Set()
              Object.values(volumes).forEach(vol => {
                if (typeof vol === 'object' && vol.chapters) {
                  if (typeof vol.chapters === 'object' && !Array.isArray(vol.chapters)) {
                    Object.keys(vol.chapters).forEach(c => allChapters.add(c))
                  }
                }
              })

              return { id, vols: volCount || null, chaps: allChapters.size || null }
            })
          )

          aggResults.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
              const { id, vols, chaps } = r.value
              if (newStats[id]) {
                newStats[id].volumes  = vols
                newStats[id].chapters = chaps
              }
            }
          })

          setStats(prev => reset ? newStats : { ...prev, ...newStats })
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setManga([])
    setStats({})
    setOffset(0)
    fetch_manga(0, true)
  }, [search, sort, status, demographic, tag])

  const loadMore = () => fetch_manga(offset + LIMIT, false)
  const retry    = () => fetch_manga(0, true)

  return { manga, stats, loading, loadingMore, error, offset, hasNext, totalCount, loadMore, retry }
}
