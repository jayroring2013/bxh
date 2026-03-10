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
              width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(244,63,94,0.1)',
              background: 'rgba(244,63,94,0.05)', color: '#6a2035', cursor: 'pointer',
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
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📚</div>
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
  const { items: popular,   loading: lp } = useMangaCarousel({ sort: 'follows' })
  const { items: ongoing,   loading: lo } = useMangaCarousel({ status: 'ongoing', sort: 'follows' })
  const { items: completed, loading: lc } = useMangaCarousel({ status: 'completed', sort: 'rating' })
  const { items: action,    loading: la } = useMangaCarousel({ genre: 'Action', sort: 'follows' })

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

  // We reconstruct the legacy shape from the normalized item.
  const openManga = (item) => {
    // item from carousel has _raw field with original manga table row
    if (item._raw) {
      const m = item._raw
      setSelected({
        id: m.id,
        attributes: {
          title: { en: m.title_en || m.title_ja_ro, 'ja-ro': m.title_ja_ro, ja: m.title_ja },
          description: { en: m.description_en || '' },
          status: m.status,
          publicationDemographic: m.demographic,
          year: m.year,
          lastChapter: m.last_chapter,
          lastVolume: m.last_volume,
          originalLanguage: m.original_language,
          contentRating: m.content_rating,
          tags: [
            ...(m.genres || []).map(g => ({ attributes: { group: 'genre', name: { en: g } } })),
            ...(m.themes || []).map(t => ({ attributes: { group: 'theme', name: { en: t } } })),
          ],
        },
        relationships: m.author ? [{ type: 'author', attributes: { name: m.author } }] : [],
        _cover_url: m.cover_url,
        _stats: { rating: m.rating ? String(m.rating) : null, follows: m.follows, chapters: m.chapters, volumes: m.volumes },
      })
    } else {
      setSelected(item)
    }
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
            <AdvancedFilter status={status} demographic={demographic} genre={genre}
              onStatus={setStatus} onDemographic={setDemographic} onGenre={setGenre}
              statusOptions={STATUS_OPTS} demographicOptions={DEMO_OPTS} genreOptions={GENRE_OPTS}
              hasActive={hasActive} onClear={clearFilters} accent={ROSE} lang={lang} isMobile={isMobile} />
            {!isMobile && <div style={{ flex: 1 }} />}
            <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'space-between' : 'flex-end', alignItems: 'center' }}>
              <SortDropdown value={sort} options={SORTS} onChange={setSort} accent={ROSE} />
              {!searchInput && !hasActive && (
                <button onClick={() => setBrowseMode(false)} style={{ background: 'none', border: 'none',
                  color: '#4a1020', cursor: 'pointer', fontSize: 12, fontWeight: 600,
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

            <Carousel title={lang === 'vi' ? '📚 Phổ biến nhất' : '📚 Most Followed'}
              items={popular} loading={lp}
              onSelect={item => { window.location.hash = mangaUrl({ id: item.id, title_en: item.title, title_ja_ro: '' }) }} accent={ROSE} isMobile={isMobile} />

            <Carousel title={lang === 'vi' ? '🔥 Đang cập nhật' : '🔥 Ongoing'}
              items={ongoing} loading={lo}
              onSelect={item => { window.location.hash = mangaUrl({ id: item.id, title_en: item.title, title_ja_ro: '' }) }} accent={ROSE} isMobile={isMobile} />

            <Carousel title={lang === 'vi' ? '✅ Đã hoàn thành' : '✅ Completed'}
              items={completed} loading={lc}
              onSelect={item => { window.location.hash = mangaUrl({ id: item.id, title_en: item.title, title_ja_ro: '' }) }} accent={ROSE} isMobile={isMobile} />

            <Carousel title={lang === 'vi' ? '💥 Hành động' : '💥 Action'}
              items={action} loading={la}
              onSelect={item => { window.location.hash = mangaUrl({ id: item.id, title_en: item.title, title_ja_ro: '' }) }} accent={ROSE} isMobile={isMobile} />

            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <button onClick={() => setBrowseMode(true)} style={{
                padding: '12px 32px', background: `linear-gradient(135deg,${ROSE},#BE185D)`,
                border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff',
                fontSize: 14, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 8px 24px ${ROSE}44` }}>
                {lang === 'vi' ? 'Xem tất cả manga' : 'Browse all manga'}
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
                    <MangaCard key={m.id} manga={m} rank={i + 1} stats={stats} onClick={m => { window.location.hash = mangaUrl({ id: m.id, title_en: m.attributes?.title?.en || m.attributes?.title?.['ja-ro'], title_ja_ro: m.attributes?.title?.['ja-ro'] || '' }) }} />
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
