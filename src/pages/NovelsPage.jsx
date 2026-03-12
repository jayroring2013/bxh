import React, { useState, useEffect, useRef } from 'react'
import { PURPLE } from '../constants.js'
import { useSeriesNovels, useNovelGenres, useNovelPublishers, useDebounce, seriesUrl } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { NovelCard }  from '../components/NovelCard.jsx'

// ── Sort dropdown (standalone) ────────────────────────────────────
function SortDropdown({ value, options, onChange, accent }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const currentLabel = options.find(o => o.id === value)?.label || options[0]?.label

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
        color: '#C4B5FD', fontSize: 12, fontWeight: 700,
        fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
      }}>
        {currentLabel} <span style={{ opacity: 0.6, fontSize: 9 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400,
          background: '#13131f', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: 5, minWidth: 160,
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        }}>
          {options.map(opt => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false) }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: value === opt.id ? `${accent}25` : 'transparent',
              color: value === opt.id ? '#C4B5FD' : '#94A3B8',
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

// ── Advanced filter panel (single button → popover with all filters) ──
function AdvancedFilter({ status, publisher, genre, onStatus, onPublisher, onGenre,
  statusOptions, publisherOptions, genreOptions, hasActive, onClear, accent, lang, isMobile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const activeCount = [status !== 'all', publisher !== 'all', genre !== 'all'].filter(Boolean).length

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: hasActive ? `${accent}20` : 'rgba(255,248,240,0.05)',
        border: `1px solid ${hasActive ? accent + '55' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
        color: hasActive ? '#C4B5FD' : '#94A3B8', fontSize: 12, fontWeight: 600,
        fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/>
        </svg>
        {lang === 'vi' ? 'Bộ lọc' : 'Filters'}
        {activeCount > 0 && (
          <span style={{
            minWidth: 18, height: 18, borderRadius: 9, fontSize: 10, fontWeight: 800,
            background: accent, color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 4px',
          }}>{activeCount}</span>
        )}
        <span style={{ opacity: 0.5, fontSize: 9 }}>{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 400,
          background: '#13131f', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: 16, width: 'max-content', maxWidth: '90vw',
          boxShadow: '0 24px 60px rgba(0,0,0,0.75)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,248,240,0.07)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9',
              fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: 0.5 }}>
              {lang === 'vi' ? 'Bộ lọc nâng cao' : 'Advanced Filters'}
            </span>
            {hasActive && (
              <button onClick={onClear} style={{
                background: 'none', border: 'none', color: '#F87171', fontSize: 11,
                fontWeight: 600, cursor: 'pointer', fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>✕ {lang === 'vi' ? 'Xóa tất cả' : 'Clear all'}</button>
            )}
          </div>

          {/* Filter columns — horizontal layout */}
          <div style={{ display: 'flex', gap: 0, flexDirection: isMobile ? 'column' : 'row' }}>
            <FilterSection
              label={lang === 'vi' ? 'Trạng thái' : 'Status'}
              value={status} options={statusOptions} onChange={onStatus} accent={accent} />
            {!isMobile && <div style={{ width: 1, background: 'rgba(255,248,240,0.06)', margin: '0 12px', flexShrink: 0 }} />}
            <FilterSection
              label={lang === 'vi' ? 'Nhà xuất bản' : 'Publisher'}
              value={publisher} options={publisherOptions} onChange={onPublisher} accent={accent} />
            {genreOptions.length > 1 && (
              <>
                {!isMobile && <div style={{ width: 1, background: 'rgba(255,248,240,0.06)', margin: '0 12px', flexShrink: 0 }} />}
                <FilterSection
                  label={lang === 'vi' ? 'Thể loại' : 'Genre'}
                  value={genre} options={genreOptions} onChange={onGenre} accent={accent} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSection({ label, value, options, onChange, accent }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = value !== 'all' && value !== options[0]?.id
  const currentLabel = options.find(o => o.id === value)?.label || options[0]?.label

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: 1,
        textTransform: 'uppercase', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {label}
      </div>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(o => !o)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          background: active ? `${accent}20` : 'rgba(255,248,240,0.04)',
          border: `1px solid ${active ? accent + '55' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 9, padding: '7px 11px', cursor: 'pointer',
          color: active ? '#C4B5FD' : '#94A3B8', fontSize: 12, fontWeight: active ? 700 : 400,
          fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{currentLabel}</span>
          <span style={{ opacity: 0.4, fontSize: 9, flexShrink: 0 }}>{open ? '▴' : '▾'}</span>
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 500,
            background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: 4, minWidth: '100%', maxHeight: 220, overflowY: 'auto',
            boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
            scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent',
          }}>
            {options.map(opt => (
              <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false) }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: value === opt.id ? `${accent}25` : 'transparent',
                color: value === opt.id ? '#C4B5FD' : '#94A3B8',
                fontSize: 12, fontWeight: value === opt.id ? 700 : 400,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                display: 'flex', alignItems: 'center', gap: 7,
              }}
                onMouseEnter={e => { if (value !== opt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                onMouseLeave={e => { if (value !== opt.id) e.currentTarget.style.background = 'transparent' }}
              >
                {value === opt.id
                  ? <span style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                      background: accent, border: `1.5px solid ${accent}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: '#fff' }}>✓</span>
                  : <span style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                      border: '1.5px solid rgba(255,255,255,0.12)', background: 'transparent' }} />
                }
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Placeholder color fix ─────────────────────────────────────────
const inputPlaceholderStyle = `
  .nt-search-input::placeholder { color: #64748B; opacity: 1; }
  .nt-search-input::-webkit-input-placeholder { color: #64748B; }
`

// ── Inline Lucide icons for carousel titles ───────────────────────
const ArrowLeftIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
)
const ArrowRightIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
)
const BackIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
)

// ── Horizontal carousel ───────────────────────────────────────────
function Carousel({ title, TitleIcon, items, loading, onSelect, accent, isMobile }) {
  const ref = useRef(null)
  const scroll = dir => ref.current?.scrollBy({ left: dir * (260 * 4 + 14 * 3), behavior: 'smooth' })

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, padding: '0 20px' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20,
          fontWeight: 700, letterSpacing: 1, color: '#f1f5f9', margin: 0,
          display: 'flex', alignItems: 'center', gap: 8 }}>
          {TitleIcon && <TitleIcon size={18} color={accent} />}
          {title}
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1].map(i => (
            <button key={i} onClick={() => scroll(i === 0 ? -1 : 1)} style={{
              width: 30, height: 30, borderRadius: 8,
              border: `1px solid rgba(255,255,255,0.2)`,
              background: 'rgba(255,255,255,0.1)', color: '#E2E8F0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}35`; e.currentTarget.style.borderColor = `${accent}60`; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#E2E8F0' }}
            >
              {i === 0 ? <ArrowLeftIcon /> : <ArrowRightIcon />}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{
        display: 'flex', gap: 14, overflowX: 'auto', padding: '10px 20px 16px',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: isMobile ? 150 : 260, flexShrink: 0, aspectRatio: '2/3',
                borderRadius: 14, background: 'linear-gradient(90deg,#1a1a2e 25%,#242440 50%,#1a1a2e 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))
          : items.map((s, i) => (
              <div key={s.id} onClick={() => onSelect(s)} style={{
                width: isMobile ? 150 : 260, flexShrink: 0, aspectRatio: '2/3', borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                background: '#1a1a2e', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = `0 16px 40px ${accent}44` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
              >
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, width: 24, height: 24,
                  borderRadius: 7, background: i < 3
                    ? `linear-gradient(135deg,${['#FFD700','#C0C0C0','#CD7F32'][i]},${['#FFA500','#A8A8A8','#A0522D'][i]})`
                    : 'rgba(0,0,0,0.65)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 900,
                  color: i < 3 ? '#000' : '#fff',
                }}>#{i+1}</div>
                {s.cover_url
                  ? <img src={s.cover_url} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => e.target.style.display='none'} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                }
                <div style={{ position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}>
                  <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, fontWeight: 600,
                    color: '#f1f5f9', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.title}
                  </div>
                  {s.publisher && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2,
                    fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.publisher}</div>}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export function NovelsPage() {
  const { lang } = useLang()
  const [browseMode, setBrowseMode] = useState(false)
  const [searchInput,setSearchInput]= useState('')
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  const [sort,       setSort]       = useState('title_asc')
  const [status,     setStatus]     = useState('all')
  const [genre,      setGenre]      = useState('all')
  const [publisher,  setPublisher]  = useState('all')

  const search     = useDebounce(searchInput)
  const genres     = useNovelGenres()
  const publishers = useNovelPublishers()

  const { series: popular, loading: loadingPop } =
    useSeriesNovels({ search: '', sort: 'score_desc', status: 'all', genre: 'all', limit: 18 })
  const { series: recent, loading: loadingRec } =
    useSeriesNovels({ search: '', sort: 'newest', status: 'all', genre: 'all', limit: 18 })

  const isBrowsing     = browseMode || !!search || status !== 'all' || genre !== 'all' || publisher !== 'all'
  const hasActiveFilters = status !== 'all' || genre !== 'all' || publisher !== 'all'

  const { series, loading, loadingMore, error, hasMore, totalCount, loadMore, retry } =
    useSeriesNovels({ search, sort, status, genre, publisher })

  useEffect(() => {
    const fn = e => {
      if (e.detail?.type !== 'novel') return
      setSearchInput(e.detail.title || '')
      setBrowseMode(true)
    }
    window.addEventListener('nt:open-series', fn)
    return () => window.removeEventListener('nt:open-series', fn)
  }, [])

  // Listen for genre/publisher filter navigation from SeriesDetailPage
  useEffect(() => {
    const fn = e => {
      const { genre, publisher } = e.detail || {}
      if (genre)     { setGenre(genre);         setBrowseMode(true) }
      if (publisher) { setPublisher(publisher);  setBrowseMode(true) }
    }
    window.addEventListener('nt:filter', fn)
    return () => window.removeEventListener('nt:filter', fn)
  }, [])

  const NOVEL_SORTS = [
    { id: 'title_asc',  label: lang === 'vi' ? 'Tên A-Z'  : 'Title A-Z'    },
    { id: 'title_desc', label: lang === 'vi' ? 'Tên Z-A'  : 'Title Z-A'    },
    { id: 'score_desc', label: lang === 'vi' ? 'Điểm cao' : 'Top Rated'    },
    { id: 'newest',     label: lang === 'vi' ? 'Mới thêm' : 'Newest Added' },
  ]
  const STATUS_OPTIONS = [
    { id: 'all',       label: lang === 'vi' ? 'Tất cả'         : 'All'       },
    { id: 'ongoing',   label: lang === 'vi' ? 'Đang tiến hành' : 'Ongoing'   },
    { id: 'completed', label: lang === 'vi' ? 'Hoàn thành'     : 'Completed' },
    { id: 'hiatus',    label: lang === 'vi' ? 'Tạm dừng'       : 'Hiatus'    },
    { id: 'cancelled', label: lang === 'vi' ? 'Đã hủy'         : 'Cancelled' },
  ]
  const PUBLISHER_OPTIONS = [
    { id: 'all', label: lang === 'vi' ? 'Tất cả' : 'All' },
    ...publishers.map(p => ({ id: p, label: p })),
  ]
  const GENRE_OPTIONS = [
    { id: 'all', label: lang === 'vi' ? 'Tất cả' : 'All' },
    ...genres.map(g => ({ id: g.id, label: g.name })),
  ]

  const clearFilters = () => { setStatus('all'); setGenre('all'); setPublisher('all') }

  return (
    <div className="page-enter">
      <style>{inputPlaceholderStyle}</style>
      {/* No search in AppHeader on novels page — search is in the browse bar */}
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput=""
        onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />

      {/* Hero — title + tagline/count only, NO search bar */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg,#140f08,#110d0a,#0f0b09)',
        padding: isMobile ? '20px 16px 18px' : '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 280, background: `radial-gradient(ellipse, ${PURPLE}20 0%, transparent 70%)`,
          pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(22px, 3.5vw, 38px)', lineHeight: 1, letterSpacing: 2,
          marginBottom: 8, color: '#f1f5f9' }}>
          {lang === 'vi' ? 'Light Novel' : 'Light Novels'}
        </div>
        {!isBrowsing && (
          <div style={{ fontSize: 13, color: '#64748B', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {lang === 'vi' ? 'Khám phá và theo dõi light novel yêu thích của bạn'
                           : 'Discover and track your favourite light novels'}
          </div>
        )}
        {isBrowsing && totalCount > 0 && !loading && (
          <div style={{ fontSize: 12, color: '#64748B' }}>{totalCount} series</div>
        )}
      </div>

      {/* Browse toolbar */}
      {isBrowsing && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Back button — its own prominent row on both desktop and mobile */}
            {!searchInput && !hasActiveFilters && (
              <div>
                <button onClick={() => setBrowseMode(false)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9, padding: '6px 14px', cursor: 'pointer',
                  color: '#CBD5E1', fontSize: 13, fontWeight: 600,
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  {lang === 'vi' ? 'Quay lại trang chính' : 'Back to discovery'}
                </button>
              </div>
            )}

            {/* Search + Filters on same row; Sort on right */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>

              {/* Search — full width on mobile, capped on desktop */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : 280, flexShrink: 0 }}>
                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="nt-search-input"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={lang === 'vi' ? 'Tìm tên novel...' : 'Search title...'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '8px 32px 8px 32px',
                    color: '#f1f5f9', fontSize: 13, outline: 'none',
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = PURPLE + '70'; e.target.style.boxShadow = `0 0 0 3px ${PURPLE}18` }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} style={{
                    position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16, lineHeight: 1,
                  }}>×</button>
                )}
              </div>

              {/* Filters — right next to search */}
              <AdvancedFilter
                status={status} publisher={publisher} genre={genre}
                onStatus={setStatus} onPublisher={setPublisher} onGenre={setGenre}
                statusOptions={STATUS_OPTIONS} publisherOptions={PUBLISHER_OPTIONS} genreOptions={GENRE_OPTIONS}
                hasActive={hasActiveFilters} onClear={clearFilters} accent={PURPLE} lang={lang} isMobile={isMobile} />

              {/* Spacer — pushes sort right on both desktop and mobile */}
              <div style={{ flex: 1 }} />

              {/* Sort */}
              <SortDropdown value={sort} options={NOVEL_SORTS} onChange={setSort} accent={PURPLE} />
            </div>

          </div>
        </div>
      )}

      <main className="page-main">
        {/* Discovery carousels */}
        {!isBrowsing && (
          <>
            {/* Search bar in discovery mode */}
            <div style={{ maxWidth: 520, margin: '0 auto 28px', padding: '0 20px' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  opacity: 0.35, pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="nt-search-input"
                  value={searchInput}
                  onChange={e => { setSearchInput(e.target.value); if (e.target.value) setBrowseMode(true) }}
                  placeholder={lang === 'vi' ? 'Tìm tên novel...' : 'Search novels...'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,248,240,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '11px 36px 11px 40px',
                    color: '#fff', fontSize: 13, outline: 'none',
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = PURPLE + '70'; e.target.style.boxShadow = `0 0 0 3px ${PURPLE}18` }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18, lineHeight: 1,
                  }}>×</button>
                )}
              </div>
            </div>
            <Carousel
              title={lang === 'vi' ? 'Phổ biến nhất' : 'Most Popular'}
              TitleIcon={({ size, color }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              )}
              items={popular} loading={loadingPop} onSelect={s => { window.location.hash = seriesUrl(s) }} accent={PURPLE} isMobile={isMobile} />
            <Carousel
              title={lang === 'vi' ? 'Mới thêm gần đây' : 'Recently Added'}
              TitleIcon={({ size, color }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
              items={recent} loading={loadingRec} onSelect={s => { window.location.hash = seriesUrl(s) }} accent={PURPLE} isMobile={isMobile} />
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <button onClick={() => setBrowseMode(true)} style={{
                padding: '12px 32px', background: `linear-gradient(135deg,${PURPLE},#6366F1)`,
                border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 8px 24px ${PURPLE}44`,
              }}>
                {lang === 'vi' ? 'Xem thêm' : 'Browse all'}
              </button>
            </div>
          </>
        )}

        {/* Browse grid */}
        {isBrowsing && (
          <>
            {error && <ErrorBox msg={error} onRetry={retry} color={PURPLE} />}
            {loading && !error && <SkeletonGrid />}
            {!loading && !error && series.length > 0 && (
              <>
                <CardGrid>
                  {series.map((s, i) => (
                    <NovelCard key={s.id} series={s} rank={i + 1} />
                  ))}
                </CardGrid>
                {hasMore && <LoadMoreBtn onLoad={loadMore} loading={loadingMore} color={PURPLE} />}
              </>
            )}
            {!loading && !error && series.length === 0 && (
              <EmptyState
                icon={<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                msg={lang === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'} />
            )}
          </>
        )}
      </main>

      <PageFooter color={PURPLE} src="LiDex" />
    </div>
  )
}
