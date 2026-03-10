import React, { useState, useEffect, useRef } from 'react'
import { CYAN } from '../constants.js'
import { useAnime, useAnimeCarousel, useDebounce } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { AnimeCard }  from '../components/AnimeCard.jsx'
import { AnimeModal } from '../components/AnimeModal.jsx'

// ── Sort dropdown ────────────────────────────────────────────────
function SortDropdown({ value, options, onChange, accent }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const label = options.find(o => o.id === value)?.label || options[0]?.label
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: `${accent}18`, border: `1px solid ${accent}50`,
        borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
        color: '#67E8F9', fontSize: 12, fontWeight: 700,
        fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
      }}>
        {label} <span style={{ opacity: 0.6, fontSize: 9 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400,
          background: '#060d1a', border: '1px solid rgba(100,200,255,0.12)',
          borderRadius: 12, padding: 5, minWidth: 160,
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
        }}>
          {options.map(opt => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false) }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: value === opt.id ? `${accent}25` : 'transparent',
              color: value === opt.id ? '#67E8F9' : '#3a6080',
              fontSize: 12, fontWeight: value === opt.id ? 700 : 400,
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {value === opt.id && <span style={{ marginRight: 6, fontSize: 10 }}>✓</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Filter section ────────────────────────────────────────────────
function FilterSection({ label, options, value, onSelect, accent }) {
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#2a5060', letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {label}
      </div>
      {options.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.id)} style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', marginBottom: 2,
          background: value === opt.id ? `${accent}22` : 'transparent',
          color: value === opt.id ? '#67E8F9' : '#3a6080',
          fontSize: 12, fontWeight: value === opt.id ? 700 : 400,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        }}>
          {value === opt.id && <span style={{ marginRight: 6, fontSize: 10 }}>✓</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Advanced filter popover ────────────────────────────────────────
function AdvancedFilter({ status, format, genre, onStatus, onFormat, onGenre,
  statusOptions, formatOptions, genreOptions, hasActive, onClear, accent, lang, isMobile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const activeCount = [status !== '', format !== '', genre !== 'All'].filter(Boolean).length
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: hasActive ? `${accent}20` : 'rgba(0,150,200,0.05)',
        border: `1px solid ${hasActive ? accent + '55' : 'rgba(100,200,255,0.1)'}`,
        borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
        color: hasActive ? '#67E8F9' : '#3a6080', fontSize: 12, fontWeight: 600,
        fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/>
        </svg>
        {lang === 'vi' ? 'Bộ lọc' : 'Filters'}
        {activeCount > 0 && (
          <span style={{ minWidth: 18, height: 18, borderRadius: 9, fontSize: 10, fontWeight: 800,
            background: accent, color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 4px' }}>{activeCount}</span>
        )}
        <span style={{ opacity: 0.5, fontSize: 9 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 400,
          background: '#060d1a', border: '1px solid rgba(100,200,255,0.12)',
          borderRadius: 16, padding: 16, width: 'max-content', maxWidth: '90vw',
          boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(100,200,255,0.07)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9',
              fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              {lang === 'vi' ? 'Bộ lọc nâng cao' : 'Advanced Filters'}
            </span>
            {hasActive && (
              <button onClick={onClear} style={{ background: 'none', border: 'none', color: '#F87171',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                ✕ {lang === 'vi' ? 'Xóa tất cả' : 'Clear all'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 0, flexDirection: isMobile ? 'column' : 'row' }}>
            <FilterSection label={lang === 'vi' ? 'Trạng thái' : 'Status'}
              options={statusOptions} value={status} onSelect={onStatus} accent={accent} />
            {!isMobile && <div style={{ width: 1, background: 'rgba(100,200,255,0.07)', margin: '0 14px' }} />}
            <FilterSection label={lang === 'vi' ? 'Định dạng' : 'Format'}
              options={formatOptions} value={format} onSelect={onFormat} accent={accent} />
            {!isMobile && <div style={{ width: 1, background: 'rgba(100,200,255,0.07)', margin: '0 14px' }} />}
            <FilterSection label={lang === 'vi' ? 'Thể loại' : 'Genre'}
              options={genreOptions} value={genre} onSelect={onGenre} accent={accent} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Carousel ──────────────────────────────────────────────────────
function Carousel({ title, items, loading, onSelect, accent, isMobile }) {
  const ref = useRef(null)
  const cardW = isMobile ? 150 : 220
  const scroll = dir => ref.current?.scrollBy({ left: dir * (cardW * 4 + 14 * 3), behavior: 'smooth' })
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, padding: '0 20px' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20,
          fontWeight: 700, letterSpacing: 1, color: '#f1f5f9', margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['←','→'].map((arrow, i) => (
            <button key={arrow} onClick={() => scroll(i === 0 ? -1 : 1)} style={{
              width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(100,200,255,0.1)',
              background: 'rgba(0,150,200,0.06)', color: '#2a6070', cursor: 'pointer',
              fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{arrow}</button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{
        display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 20px 12px',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: cardW, flexShrink: 0, aspectRatio: '2/3', borderRadius: 14,
                background: 'linear-gradient(90deg,#060d1a 25%,#0c1a28 50%,#060d1a 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))
          : items.map((item, i) => (
              <div key={item.id} onClick={() => onSelect(item._raw)} style={{
                width: cardW, flexShrink: 0, aspectRatio: '2/3', borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                background: '#050c18', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = `0 16px 40px ${accent}44` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)' }}
              >
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, width: 24, height: 24,
                  borderRadius: 7, background: i < 3
                    ? `linear-gradient(135deg,${['#FFD700','#C0C0C0','#CD7F32'][i]},${['#FFA500','#A8A8A8','#A0522D'][i]})`
                    : 'rgba(0,0,0,0.65)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 900,
                  color: i < 3 ? '#000' : '#fff',
                }}>#{i+1}</div>
                {item.cover_url
                  ? <img src={item.cover_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display='none'} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎌</div>
                }
                <div style={{ position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px' }}>
                  <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 600,
                    color: '#f1f5f9', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                    {item.score && <span style={{ fontSize: 10, color: '#FBBF24', fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>★ {item.score}</span>}
                    {item.year  && <span style={{ fontSize: 10, color: '#2a6070', fontFamily: "'Barlow Condensed', sans-serif" }}>{item.year}</span>}
                    {item.eps   && <span style={{ fontSize: 10, color: accent, fontFamily: "'Barlow Condensed', sans-serif", marginLeft: 'auto' }}>{item.eps} eps</span>}
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}

// Normalize raw anime row → carousel card shape
function na(a) {
  return {
    id:        a.id,
    cover_url: a.cover_large || a.cover_url,
    title:     a.title_english || a.title_romaji || 'Unknown',
    score:     a.average_score ? String(a.average_score) : null,
    year:      a.season_year,
    eps:       a.episodes,
    _raw: a,
  }
}

// ── Main ─────────────────────────────────────────────────────────
export function AnimePage() {
  const { lang } = useLang()
  const [selected,    setSelected]    = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [browseMode,  setBrowseMode]  = useState(false)
  const [sort,        setSort]        = useState('POPULARITY_DESC')
  const [status,      setStatus]      = useState('')
  const [format,      setFormat]      = useState('')
  const [genre,       setGenre]       = useState('All')
  const [isMobile,    setIsMobile]    = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const search = useDebounce(searchInput)
  const isBrowsing = browseMode || !!search || status !== '' || format !== '' || genre !== 'All'
  const hasActive = status !== '' || format !== '' || genre !== 'All'

  const { anime, loading, loadingMore, error, hasNext, totalCount, loadMore, retry } =
    useAnime({ search, sort, status, format, genre })

  const { items: airingRaw,  loading: l1 } = useAnimeCarousel({ status: 'RELEASING', sort: 'POPULARITY_DESC' })
  const { items: topRaw,     loading: l2 } = useAnimeCarousel({ sort: 'SCORE_DESC' })
  const { items: moviesRaw,  loading: l3 } = useAnimeCarousel({ format: 'MOVIE', sort: 'SCORE_DESC' })
  const { items: actionRaw,  loading: l4 } = useAnimeCarousel({ genre: 'Action', sort: 'POPULARITY_DESC' })

  useEffect(() => {
    const fn = e => {
      if (e.detail?.type !== 'anime') return
      setSearchInput(e.detail.title || '')
      setBrowseMode(true)
    }
    window.addEventListener('nt:open-series', fn)
    return () => window.removeEventListener('nt:open-series', fn)
  }, [])

  const SORTS = [
    { id: 'POPULARITY_DESC', label: lang === 'vi' ? 'Phổ biến'    : 'Most Popular'  },
    { id: 'SCORE_DESC',      label: lang === 'vi' ? 'Điểm cao'    : 'Top Rated'     },
    { id: 'START_DATE_DESC', label: lang === 'vi' ? 'Mới nhất'    : 'Newest'        },
    { id: 'FAVOURITES_DESC', label: lang === 'vi' ? 'Yêu thích'   : 'Most Favoured' },
    { id: 'TITLE_ROMAJI',    label: lang === 'vi' ? 'Tên A-Z'     : 'Title A-Z'     },
  ]
  const STATUS_OPTS = [
    { id: '',                 label: lang === 'vi' ? 'Tất cả'     : 'All'      },
    { id: 'RELEASING',        label: lang === 'vi' ? 'Đang chiếu' : 'Airing'   },
    { id: 'FINISHED',         label: lang === 'vi' ? 'Đã kết thúc': 'Finished' },
    { id: 'NOT_YET_RELEASED', label: lang === 'vi' ? 'Sắp ra mắt' : 'Upcoming' },
    { id: 'CANCELLED',        label: lang === 'vi' ? 'Đã hủy'     : 'Cancelled'},
  ]
  const FORMAT_OPTS = [
    { id: '',        label: lang === 'vi' ? 'Tất cả' : 'All'     },
    { id: 'TV',      label: 'TV Series' },
    { id: 'MOVIE',   label: lang === 'vi' ? 'Phim điện ảnh' : 'Movie'   },
    { id: 'OVA',     label: 'OVA'       },
    { id: 'ONA',     label: 'ONA'       },
    { id: 'SPECIAL', label: 'Special'   },
  ]
  const GENRE_OPTS = ['All','Action','Adventure','Comedy','Drama','Fantasy','Horror',
    'Mecha','Mystery','Psychological','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller']
    .map(g => ({ id: g, label: g }))

  const clearFilters = () => { setStatus(''); setFormat(''); setGenre('All') }

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/anime" accent={CYAN} searchInput=""
        onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />

      {/* Hero */}
      <div style={{ position: 'relative',
        background: 'linear-gradient(160deg,#040810,#060d1a,#040a12)',
        padding: isMobile ? '20px 16px 18px' : '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 280, background: `radial-gradient(ellipse, ${CYAN}15 0%, transparent 70%)`,
          pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(22px, 3.5vw, 38px)', lineHeight: 1, letterSpacing: 2,
          marginBottom: 8, color: '#f1f5f9', position: 'relative' }}>
          ANIME
        </div>
        {!isBrowsing && (
          <div style={{ fontSize: 13, color: '#1e4050', fontFamily: "'Be Vietnam Pro', sans-serif", position: 'relative' }}>
            {lang === 'vi' ? 'Khám phá và theo dõi anime yêu thích của bạn'
                           : 'Discover and track your favourite anime series'}
          </div>
        )}
        {isBrowsing && totalCount > 0 && !loading && (
          <div style={{ fontSize: 12, color: '#1e5060', position: 'relative' }}>
            {totalCount.toLocaleString()} series
          </div>
        )}
      </div>

      {/* Browse toolbar */}
      {isBrowsing && (
        <div style={{ background: 'rgba(0,150,200,0.02)', borderBottom: '1px solid rgba(100,200,255,0.06)', padding: '10px 20px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8,
            flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180,
              maxWidth: isMobile ? '100%' : 340, width: isMobile ? '100%' : undefined }}>
              <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                opacity: 0.2, pointerEvents: 'none' }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder={lang === 'vi' ? 'Tìm tên anime...' : 'Search anime...'}
                style={{ width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,150,200,0.06)', border: '1px solid rgba(100,200,255,0.12)',
                  borderRadius: 10, padding: '8px 32px', color: '#fff', fontSize: 12, outline: 'none',
                  fontFamily: "'Be Vietnam Pro', sans-serif" }}
                onFocus={e => { e.target.style.borderColor = CYAN + '70'; e.target.style.boxShadow = `0 0 0 3px ${CYAN}18` }}
                onBlur={e => { e.target.style.borderColor = 'rgba(100,200,255,0.12)'; e.target.style.boxShadow = 'none' }}
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} style={{ position: 'absolute', right: 9, top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#1e5060', cursor: 'pointer', fontSize: 16 }}>×</button>
              )}
            </div>
            <AdvancedFilter status={status} format={format} genre={genre}
              onStatus={setStatus} onFormat={setFormat} onGenre={setGenre}
              statusOptions={STATUS_OPTS} formatOptions={FORMAT_OPTS} genreOptions={GENRE_OPTS}
              hasActive={hasActive} onClear={clearFilters} accent={CYAN} lang={lang} isMobile={isMobile} />
            {!isMobile && <div style={{ flex: 1 }} />}
            <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'space-between' : 'flex-end', alignItems: 'center' }}>
              <SortDropdown value={sort} options={SORTS} onChange={setSort} accent={CYAN} />
              {!searchInput && !hasActive && (
                <button onClick={() => setBrowseMode(false)} style={{ background: 'none', border: 'none',
                  color: '#1e4050', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  fontFamily: "'Be Vietnam Pro', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                  ← {lang === 'vi' ? 'Quay lại' : 'Back'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="page-main">
        {!isBrowsing && (
          <>
            {/* Discovery search bar */}
            <div style={{ maxWidth: 520, margin: '0 auto 28px', padding: '0 20px' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  opacity: 0.2, pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={searchInput}
                  onChange={e => { setSearchInput(e.target.value); if (e.target.value) setBrowseMode(true) }}
                  placeholder={lang === 'vi' ? 'Tìm tên anime...' : 'Search anime...'}
                  style={{ width: '100%', boxSizing: 'border-box',
                    background: 'rgba(0,150,200,0.05)', border: '1px solid rgba(100,200,255,0.1)',
                    borderRadius: 12, padding: '11px 36px 11px 42px',
                    color: '#fff', fontSize: 13, outline: 'none',
                    fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = CYAN + '70'; e.target.style.boxShadow = `0 0 0 3px ${CYAN}18` }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(100,200,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <Carousel title={lang === 'vi' ? '📺 Đang chiếu' : '📺 Currently Airing'}
              items={airingRaw.map(na)} loading={l1}
              onSelect={a => setSelected(a)} accent={CYAN} isMobile={isMobile} />

            <Carousel title={lang === 'vi' ? '🏆 Điểm cao nhất' : '🏆 Highest Rated'}
              items={topRaw.map(na)} loading={l2}
              onSelect={a => setSelected(a)} accent={CYAN} isMobile={isMobile} />

            <Carousel title={lang === 'vi' ? '🎬 Phim & OVA' : '🎬 Movies & OVAs'}
              items={moviesRaw.map(na)} loading={l3}
              onSelect={a => setSelected(a)} accent={CYAN} isMobile={isMobile} />

            <Carousel title={lang === 'vi' ? '⚡ Hành động' : '⚡ Action'}
              items={actionRaw.map(na)} loading={l4}
              onSelect={a => setSelected(a)} accent={CYAN} isMobile={isMobile} />

            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <button onClick={() => setBrowseMode(true)} style={{
                padding: '12px 32px', background: `linear-gradient(135deg,${CYAN},#0891B2)`,
                border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 8px 24px ${CYAN}44` }}>
                {lang === 'vi' ? 'Xem tất cả anime' : 'Browse all anime'}
              </button>
            </div>
          </>
        )}

        {isBrowsing && (
          <>
            {error && <ErrorBox msg={error} onRetry={retry} color={CYAN} />}
            {loading && !error && <SkeletonGrid />}
            {!loading && !error && anime.length > 0 && (
              <>
                <CardGrid>
                  {anime.map((a, i) => (
                    <AnimeCard key={a.id} anime={a} rank={i + 1} onClick={setSelected} />
                  ))}
                </CardGrid>
                {hasNext && <LoadMoreBtn onLoad={loadMore} loading={loadingMore} color={CYAN} />}
              </>
            )}
            {!loading && !error && anime.length === 0 && (
              <EmptyState icon="🎌" msg={lang === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'} />
            )}
          </>
        )}
      </main>

      <PageFooter color={CYAN} src="AniList" />
      {selected && <AnimeModal anime={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
