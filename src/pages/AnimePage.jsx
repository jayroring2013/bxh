import React, { useState, useEffect, useRef } from 'react'
import { CYAN } from '../constants.js'
import { useAnime, useAnimeCarousel, useDebounce, animeUrl } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { AppHeader, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { AnimeCard }  from '../components/AnimeCard.jsx'

// ── Sort dropdown ─────────────────────────────────────────────────
function SortDropdown({ value, options, onChange, accent }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { theme } = useTheme()
  const isLight = theme === 'light'
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
        color: isLight ? accent : '#67E8F9', fontSize: 12, fontWeight: 700,
        fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
      }}>
        {label} <span style={{ opacity: 0.6, fontSize: 9 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400,
          background: isLight ? '#fff' : '#060d1a',
          border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(100,200,255,0.12)',
          borderRadius: 12, padding: 5, minWidth: 160,
          boxShadow: isLight ? '0 20px 50px rgba(0,0,0,0.12)' : '0 20px 50px rgba(0,0,0,0.85)',
        }}>
          {options.map(opt => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false) }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: value === opt.id ? `${accent}25` : 'transparent',
              color: value === opt.id ? (isLight ? accent : '#67E8F9') : (isLight ? '#475569' : '#3a6080'),
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
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: isLight ? '#64748B' : '#2a5060', letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {label}
      </div>
      {options.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.id)} style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', marginBottom: 2,
          background: value === opt.id ? `${accent}22` : 'transparent',
          color: value === opt.id ? (isLight ? accent : '#67E8F9') : (isLight ? '#475569' : '#3a6080'),
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
  const { theme } = useTheme()
  const isLight = theme === 'light'
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
        background: hasActive ? `${accent}20` : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,150,200,0.05)'),
        border: `1px solid ${hasActive ? accent + '55' : (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(100,200,255,0.1)')}`,
        borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
        color: hasActive ? (isLight ? accent : '#67E8F9') : (isLight ? '#475569' : '#3a6080'), fontSize: 12, fontWeight: 600,
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
          background: isLight ? '#fff' : '#060d1a',
          border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(100,200,255,0.12)',
          borderRadius: 16, padding: 16, width: 'max-content', maxWidth: '90vw',
          boxShadow: isLight ? '0 24px 60px rgba(0,0,0,0.1)' : '0 24px 60px rgba(0,0,0,0.9)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, paddingBottom: 10,
            borderBottom: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(100,200,255,0.07)' }}>
            <span style={{ fontSize: 12, fontWeight: 700,
              color: isLight ? '#0F172A' : '#f1f5f9', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
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
            {!isMobile && <div style={{ width: 1, background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(100,200,255,0.07)', margin: '0 14px' }} />}
            <FilterSection label={lang === 'vi' ? 'Định dạng' : 'Format'}
              options={formatOptions} value={format} onSelect={onFormat} accent={accent} />
            {!isMobile && <div style={{ width: 1, background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(100,200,255,0.07)', margin: '0 14px' }} />}
            <FilterSection label={lang === 'vi' ? 'Thể loại' : 'Genre'}
              options={genreOptions} value={genre} onSelect={onGenre} accent={accent} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Inline Lucide icons ───────────────────────────────────────────
const ChevronLeft  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const ChevronRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const TvIcon    = ({ size = 16, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
const ClockIcon = ({ size = 16, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>

// ── Carousel ──────────────────────────────────────────────────────
function Carousel({ title, TitleIcon, items, loading, onSelect, accent, isMobile }) {
  const ref = useRef(null)
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const cardW = isMobile ? 150 : 220
  const scroll = dir => ref.current?.scrollBy({ left: dir * (cardW * 4 + 14 * 3), behavior: 'smooth' })
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, padding: '0 20px' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20,
          fontWeight: 700, letterSpacing: 1, color: isLight ? '#0F172A' : '#f1f5f9', margin: 0,
          display: 'flex', alignItems: 'center', gap: 8 }}>
          {TitleIcon && <TitleIcon size={18} color={accent} />}
          {title}
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1].map(i => (
            <button key={i} onClick={() => scroll(i === 0 ? -1 : 1)} style={{
              width: 30, height: 30, borderRadius: 8,
              border: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.2)',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
              color: isLight ? '#475569' : '#E2E8F0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}35`; e.currentTarget.style.borderColor = `${accent}60`; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = isLight ? '#475569' : '#E2E8F0' }}
            >
              {i === 0 ? <ChevronLeft /> : <ChevronRight />}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{
        display: 'flex', gap: 14, overflowX: 'auto', padding: '10px 20px 16px',
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
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', background: `${accent}12` }}>
                      <TvIcon size={40} color={`${accent}60`} />
                    </div>
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

// Normalize series-table anime row → carousel card shape
function na(a) {
  return {
    id:        a.id,
    cover_url: a.cover_url,
    title:     a.title || 'Unknown',
    score:     a.mean_score ? String(a.mean_score) : null,
    year:      a.season_year,
    eps:       a.episodes,
    genres:    a.genres || [],
    status:    a.status,
    _raw: a,
  }
}

// ── Main ─────────────────────────────────────────────────────────
export function AnimePage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isLight = theme === 'light'
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

  const { items: popularRaw, loading: l1 } = useAnimeCarousel({ sort: 'POPULARITY_DESC' })
  const { items: recentRaw,  loading: l2 } = useAnimeCarousel({ status: 'RELEASING', sort: 'START_DATE_DESC' })

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
        background: isLight
          ? 'linear-gradient(160deg,#EEF2F7,#F1F5F9)'
          : 'linear-gradient(160deg,#040810,#060d1a,#040a12)',
        padding: isMobile ? '20px 16px 18px' : '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 280, background: `radial-gradient(ellipse, ${CYAN}15 0%, transparent 70%)`,
          pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(22px, 3.5vw, 38px)', lineHeight: 1, letterSpacing: 2,
          marginBottom: 8, color: isLight ? '#0F172A' : '#f1f5f9', position: 'relative' }}>
          ANIME
        </div>
        {!isBrowsing && (
          <div style={{ fontSize: 13, color: isLight ? '#475569' : '#1e4050', fontFamily: "'Be Vietnam Pro', sans-serif", position: 'relative' }}>
            {lang === 'vi' ? 'Khám phá và theo dõi anime yêu thích của bạn'
                           : 'Discover and track your favourite anime series'}
          </div>
        )}
        {isBrowsing && totalCount > 0 && !loading && (
          <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#1e5060', position: 'relative' }}>
            {totalCount.toLocaleString()} series
          </div>
        )}
      </div>

      {/* Browse toolbar */}
      {isBrowsing && (
        <div style={{ background: 'rgba(0,150,200,0.02)', borderBottom: '1px solid rgba(100,200,255,0.06)', padding: '10px 20px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Back button row — only when no active search/filter */}
            {!searchInput && !hasActive && (
              <div>
                <button onClick={() => setBrowseMode(false)} style={{
                  background: 'none', border: '1px solid rgba(100,200,255,0.12)',
                  borderRadius: 20, color: '#64748B', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  fontFamily: "'Be Vietnam Pro', sans-serif", display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 14px',
                }}>← {lang === 'vi' ? 'Quay lại trang chính' : 'Back to discovery'}</button>
              </div>
            )}

            {/* Search + Filter + Sort on one row, wraps on mobile */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : 280, flexShrink: 0 }}>
                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                  opacity: 0.2, pointerEvents: 'none' }}
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                  placeholder={lang === 'vi' ? 'Tìm tên anime...' : 'Search anime...'}
                  style={{ width: '100%', boxSizing: 'border-box',
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,150,200,0.06)',
                    border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(100,200,255,0.12)',
                    borderRadius: 10, padding: '8px 32px',
                    color: isLight ? '#0F172A' : '#fff', fontSize: 12, outline: 'none',
                    fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = CYAN + '70'; e.target.style.boxShadow = `0 0 0 3px ${CYAN}18` }}
                  onBlur={e => { e.target.style.borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(100,200,255,0.12)'; e.target.style.boxShadow = 'none' }}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} style={{ position: 'absolute', right: 9, top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#1e5060', cursor: 'pointer', fontSize: 16 }}>×</button>
                )}
              </div>
              {/* Filters */}
              <AdvancedFilter status={status} format={format} genre={genre}
                onStatus={setStatus} onFormat={setFormat} onGenre={setGenre}
                statusOptions={STATUS_OPTS} formatOptions={FORMAT_OPTS} genreOptions={GENRE_OPTS}
                hasActive={hasActive} onClear={clearFilters} accent={CYAN} lang={lang} isMobile={isMobile} />
              {/* Spacer pushes sort right */}
              <div style={{ flex: 1 }} />
              {/* Sort */}
              <SortDropdown value={sort} options={SORTS} onChange={setSort} accent={CYAN} />
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
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,150,200,0.05)',
                    border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(100,200,255,0.1)',
                    borderRadius: 12, padding: '11px 36px 11px 42px',
                    color: isLight ? '#0F172A' : '#fff', fontSize: 13, outline: 'none',
                    fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = CYAN + '70'; e.target.style.boxShadow = `0 0 0 3px ${CYAN}18` }}
                  onBlur={e => { e.target.style.borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(100,200,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <Carousel
              title={lang === 'vi' ? 'Phổ biến nhất' : 'Most Popular'}
              TitleIcon={TvIcon}
              items={popularRaw.map(na)} loading={l1}
              onSelect={a => { window.location.hash = animeUrl(a) }} accent={CYAN} isMobile={isMobile} />

            <Carousel
              title={lang === 'vi' ? 'Mới nhất' : 'Most Recent'}
              TitleIcon={ClockIcon}
              items={recentRaw.map(na)} loading={l2}
              onSelect={a => { window.location.hash = animeUrl(a) }} accent={CYAN} isMobile={isMobile} />

            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <button onClick={() => setBrowseMode(true)} style={{
                padding: '12px 32px', background: `linear-gradient(135deg,${CYAN},#0891B2)`,
                border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 8px 24px ${CYAN}44` }}>
                {lang === 'vi' ? 'Xem thêm' : 'More'}
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
                    <AnimeCard key={a.id} anime={a} rank={i + 1} onClick={a => { window.location.hash = animeUrl(a) }} />
                  ))}
                </CardGrid>
                {hasNext && <LoadMoreBtn onLoad={loadMore} loading={loadingMore} color={CYAN} />}
              </>
            )}
            {!loading && !error && anime.length === 0 && (
              <EmptyState icon="📺" msg={lang === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'} />
            )}
          </>
        )}
      </main>

      <PageFooter color={CYAN} src="AniList" />
    </div>
  )
}
