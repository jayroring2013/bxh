import React, { useState, useEffect, useRef } from 'react'
import { ROSE, mangaStatusColor } from '../constants.js'
import { useManga, useMangaCarousel, useDebounce, mangaUrl } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { MangaCard }  from '../components/MangaCard.jsx'

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
        color: '#FDA4AF', fontSize: 12, fontWeight: 700,
        fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
      }}>
        {label} <span style={{ opacity: 0.6, fontSize: 9 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 400,
          background: '#140810', border: '1px solid rgba(244,63,94,0.12)',
          borderRadius: 12, padding: 5, minWidth: 160,
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
        }}>
          {options.map(opt => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false) }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: value === opt.id ? `${accent}25` : 'transparent',
              color: value === opt.id ? '#FDA4AF' : '#7a3050',
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
      <div style={{ fontSize: 10, fontWeight: 700, color: '#6a2035', letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {label}
      </div>
      {options.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.id)} style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', marginBottom: 2,
          background: value === opt.id ? `${accent}22` : 'transparent',
          color: value === opt.id ? '#FDA4AF' : '#7a3050',
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
function AdvancedFilter({ status, demographic, genre, onStatus, onDemographic, onGenre,
  statusOptions, demographicOptions, genreOptions, hasActive, onClear, accent, lang, isMobile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const activeCount = [status !== '', demographic !== '', genre !== ''].filter(Boolean).length
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: hasActive ? `${accent}20` : 'rgba(244,63,94,0.05)',
        border: `1px solid ${hasActive ? accent + '55' : 'rgba(244,63,94,0.1)'}`,
        borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
        color: hasActive ? '#FDA4AF' : '#7a3050', fontSize: 12, fontWeight: 600,
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
          background: '#140810', border: '1px solid rgba(244,63,94,0.12)',
          borderRadius: 16, padding: 16, width: 'max-content', maxWidth: '90vw',
          boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(244,63,94,0.07)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
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
            {!isMobile && <div style={{ width: 1, background: 'rgba(244,63,94,0.07)', margin: '0 14px' }} />}
            <FilterSection label={lang === 'vi' ? 'Đối tượng' : 'Demographic'}
              options={demographicOptions} value={demographic} onSelect={onDemographic} accent={accent} />
            {!isMobile && <div style={{ width: 1, background: 'rgba(244,63,94,0.07)', margin: '0 14px' }} />}
            <FilterSection label={lang === 'vi' ? 'Thể loại' : 'Genre'}
              options={genreOptions} value={genre} onSelect={onGenre} accent={accent} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Carousel ──────────────────────────────────────────────────────
// ── Inline Lucide icons ───────────────────────────────────────────
const ChevronLeft   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const ChevronRight  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const BookOpenIcon  = ({ size = 16, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const RefreshCwIcon = ({ size = 16, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>

// ── Carousel ──────────────────────────────────────────────────────
function Carousel({ title, TitleIcon, items, loading, onSelect, accent, isMobile }) {
  const ref = useRef(null)
  const cardW = isMobile ? 150 : 220
  const scroll = dir => ref.current?.scrollBy({ left: dir * (cardW * 4 + 14 * 3), behavior: 'smooth' })
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
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)', color: '#E2E8F0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}35`; e.currentTarget.style.borderColor = `${accent}60`; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#E2E8F0' }}
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
                background: 'linear-gradient(90deg,#160810 25%,#271020 50%,#160810 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))
          : items.map((item, i) => (
              <div key={item.id} onClick={() => onSelect(item)} style={{
                width: cardW, flexShrink: 0, aspectRatio: '2/3', borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                background: '#100608', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
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
                      <BookOpenIcon size={40} color={`${accent}60`} />
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
                    {item.score   && <span style={{ fontSize: 10, color: '#FBBF24', fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>★ {item.score}</span>}
                    {item.sub     && <span style={{ fontSize: 10, color: '#6a2035', textTransform: 'capitalize', fontFamily: "'Barlow Condensed', sans-serif" }}>{item.sub}</span>}
                    {item.follows && <span style={{ fontSize: 10, color: accent, fontFamily: "'Barlow Condensed', sans-serif", marginLeft: 'auto' }}>{(item.follows/1000).toFixed(0)}k</span>}
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────
export function MangaPage() {
  const { lang } = useLang()
  const [searchInput, setSearchInput] = useState('')
  const [browseMode,  setBrowseMode]  = useState(false)
  const [sort,        setSort]        = useState('followedCount')
  const [status,      setStatus]      = useState('')
  const [demographic, setDemographic] = useState('')
  const [genre,       setGenre]       = useState('')
  const [isMobile,    setIsMobile]    = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const search = useDebounce(searchInput)
  const isBrowsing = browseMode || !!search || status !== '' || demographic !== '' || genre !== ''
  const hasActive = status !== '' || demographic !== '' || genre !== ''

  const { manga, stats, loading, loadingMore, error, hasNext, totalCount, loadMore, retry } =
    useManga({ search, sort, status, demographic, tag: genre })

  // Discovery carousels
  const { items: popular,  loading: lp } = useMangaCarousel({ sort: 'follows' })
  const { items: recent,   loading: lr } = useMangaCarousel({ status: 'ongoing', sort: 'latestUploadedChapter' })

  useEffect(() => {
    const fn = e => {
      if (e.detail?.type !== 'manga') return
      setSearchInput(e.detail.title || '')
      setBrowseMode(true)
    }
    window.addEventListener('nt:open-series', fn)
    return () => window.removeEventListener('nt:open-series', fn)
  }, [])

  const SORTS = [
    { id: 'followedCount',         label: lang === 'vi' ? 'Phổ biến'        : 'Most Followed' },
    { id: 'rating',                label: lang === 'vi' ? 'Điểm cao'        : 'Top Rated'     },
    { id: 'latestUploadedChapter', label: lang === 'vi' ? 'Cập nhật mới'    : 'Latest Update' },
    { id: 'createdAt',             label: lang === 'vi' ? 'Mới nhất'        : 'Newest'        },
    { id: 'title',                 label: lang === 'vi' ? 'Tên A-Z'         : 'Title A-Z'     },
  ]
  const STATUS_OPTS = [
    { id: '',          label: lang === 'vi' ? 'Tất cả'          : 'All'       },
    { id: 'ongoing',   label: lang === 'vi' ? 'Đang tiến hành'  : 'Ongoing'   },
    { id: 'completed', label: lang === 'vi' ? 'Hoàn thành'      : 'Completed' },
    { id: 'hiatus',    label: lang === 'vi' ? 'Tạm dừng'        : 'Hiatus'    },
    { id: 'cancelled', label: lang === 'vi' ? 'Đã hủy'          : 'Cancelled' },
  ]
  const DEMO_OPTS = [
    { id: '',        label: lang === 'vi' ? 'Tất cả' : 'All'    },
    { id: 'shounen', label: 'Shounen' },
    { id: 'shoujo',  label: 'Shoujo'  },
    { id: 'seinen',  label: 'Seinen'  },
    { id: 'josei',   label: 'Josei'   },
  ]
  const GENRE_OPTS = [
    { id: '',              label: lang === 'vi' ? 'Tất cả' : 'All'       },
    { id: 'Action',        label: 'Action'       },
    { id: 'Adventure',     label: 'Adventure'    },
    { id: 'Comedy',        label: 'Comedy'       },
    { id: 'Drama',         label: 'Drama'        },
    { id: 'Fantasy',       label: 'Fantasy'      },
    { id: 'Horror',        label: 'Horror'       },
    { id: 'Mystery',       label: 'Mystery'      },
    { id: 'Psychological', label: 'Psychological'},
    { id: 'Romance',       label: 'Romance'      },
    { id: 'Sci-Fi',        label: 'Sci-Fi'       },
    { id: 'Slice of Life', label: 'Slice of Life'},
    { id: 'Sports',        label: 'Sports'       },
    { id: 'Thriller',      label: 'Thriller'     },
  ]

  const clearFilters = () => { setStatus(''); setDemographic(''); setGenre('') }

  // Build legacy MangaCard/Modal shape from normalized series row
  const openManga = (item) => {
    const m = item._raw || item  // _raw kept for backwards compat; normalized has same fields
    setSelected({
      id: m.id,
      attributes: {
        title: { en: m.title || m.title_native, 'ja-ro': m.title_native, ja: m.title_native },
        description: { en: m.description || '' },
        status: m.status,
        publicationDemographic: m.demographic,
        year: m.year,
        lastChapter: m.last_chapter,
        lastVolume: m.last_volume,
        originalLanguage: m.original_language,
        contentRating: m.content_rating,
        tags: (m.genres || []).map(g => ({ attributes: { group: 'genre', name: { en: g } } })),
      },
      relationships: m.author ? [{ type: 'author', attributes: { name: m.author } }] : [],
      _cover_url: m.cover_url,
      _stats: {
        rating: m.score ? String(m.score) : null,
        follows: m.follows,
        chapters: m.chapters,
        volumes: m.volumes,
      },
    })
  }

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/manga" accent={ROSE} searchInput=""
        onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />

      {/* Hero */}
      <div style={{ position: 'relative',
        background: 'linear-gradient(160deg,#0f040a,#180810,#0c0408)',
        padding: isMobile ? '20px 16px 18px' : '32px 20px 28px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 280, background: `radial-gradient(ellipse, ${ROSE}15 0%, transparent 70%)`,
          pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(22px, 3.5vw, 38px)', lineHeight: 1, letterSpacing: 2,
          marginBottom: 8, color: '#f1f5f9', position: 'relative' }}>
          MANGA
        </div>
        {!isBrowsing && (
          <div style={{ fontSize: 13, color: '#4a1020', fontFamily: "'Be Vietnam Pro', sans-serif", position: 'relative' }}>
            {lang === 'vi' ? 'Khám phá và theo dõi manga yêu thích của bạn'
                           : 'Discover and track your favourite manga series'}
          </div>
        )}
        {isBrowsing && totalCount > 0 && !loading && (
          <div style={{ fontSize: 12, color: '#6a1530', position: 'relative' }}>
            {totalCount.toLocaleString()} series
          </div>
        )}
      </div>

      {/* Browse toolbar */}
      {isBrowsing && (
        <div style={{ background: 'rgba(244,63,94,0.02)', borderBottom: '1px solid rgba(244,63,94,0.06)', padding: '10px 20px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Back button row — only when no active search/filter */}
            {!searchInput && !hasActive && (
              <div>
                <button onClick={() => setBrowseMode(false)} style={{
                  background: 'none', border: '1px solid rgba(244,63,94,0.15)',
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
                  placeholder={lang === 'vi' ? 'Tìm tên manga...' : 'Search manga...'}
                  style={{ width: '100%', boxSizing: 'border-box',
                    background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.12)',
                    borderRadius: 10, padding: '8px 32px', color: '#fff', fontSize: 12, outline: 'none',
                    fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = ROSE + '70'; e.target.style.boxShadow = `0 0 0 3px ${ROSE}18` }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(244,63,94,0.12)'; e.target.style.boxShadow = 'none' }}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} style={{ position: 'absolute', right: 9, top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4a1020', cursor: 'pointer', fontSize: 16 }}>×</button>
                )}
              </div>
              {/* Filters */}
              <AdvancedFilter status={status} demographic={demographic} genre={genre}
                onStatus={setStatus} onDemographic={setDemographic} onGenre={setGenre}
                statusOptions={STATUS_OPTS} demographicOptions={DEMO_OPTS} genreOptions={GENRE_OPTS}
                hasActive={hasActive} onClear={clearFilters} accent={ROSE} lang={lang} isMobile={isMobile} />
              {/* Spacer pushes sort right */}
              <div style={{ flex: 1 }} />
              {/* Sort */}
              <SortDropdown value={sort} options={SORTS} onChange={setSort} accent={ROSE} />
            </div>

          </div>
        </div>
      )}

      <main className="page-main">
        {!isBrowsing && (
          <>
            {/* Discovery search */}
            <div style={{ maxWidth: 520, margin: '0 auto 28px', padding: '0 20px' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  opacity: 0.2, pointerEvents: 'none' }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={searchInput}
                  onChange={e => { setSearchInput(e.target.value); if (e.target.value) setBrowseMode(true) }}
                  placeholder={lang === 'vi' ? 'Tìm tên manga...' : 'Search manga...'}
                  style={{ width: '100%', boxSizing: 'border-box',
                    background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.1)',
                    borderRadius: 12, padding: '11px 36px 11px 42px',
                    color: '#fff', fontSize: 13, outline: 'none',
                    fontFamily: "'Be Vietnam Pro', sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = ROSE + '70'; e.target.style.boxShadow = `0 0 0 3px ${ROSE}18` }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(244,63,94,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <Carousel
              title={lang === 'vi' ? 'Phổ biến nhất' : 'Most Popular'}
              TitleIcon={BookOpenIcon}
              items={popular} loading={lp}
              onSelect={item => { window.location.hash = mangaUrl(item) }} accent={ROSE} isMobile={isMobile} />

            <Carousel
              title={lang === 'vi' ? 'Mới cập nhật' : 'Most Recent'}
              TitleIcon={RefreshCwIcon}
              items={recent} loading={lr}
              onSelect={item => { window.location.hash = mangaUrl(item) }} accent={ROSE} isMobile={isMobile} />

            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <button onClick={() => setBrowseMode(true)} style={{
                padding: '12px 32px', background: `linear-gradient(135deg,${ROSE},#BE185D)`,
                border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 8px 24px ${ROSE}44` }}>
                {lang === 'vi' ? 'Xem thêm' : 'More'}
              </button>
            </div>
          </>
        )}

        {isBrowsing && (
          <>
            {error && <ErrorBox msg={error} onRetry={retry} color={ROSE} />}
            {loading && !error && <SkeletonGrid />}
            {!loading && !error && manga.length > 0 && (
              <>
                <CardGrid>
                  {manga.map((m, i) => (
                    <MangaCard key={m.id} manga={m} rank={i + 1} stats={stats} onClick={m => { window.location.hash = mangaUrl(m) }} />
                  ))}
                </CardGrid>
                {hasNext && <LoadMoreBtn onLoad={loadMore} loading={loadingMore} color={ROSE} />}
              </>
            )}
            {!loading && !error && manga.length === 0 && (
              <EmptyState icon="📚" msg={lang === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'} />
            )}
          </>
        )}
      </main>

      <PageFooter color={ROSE} src="MangaDex" />
    </div>
  )
}
