import React, { useState, useEffect, useRef } from 'react'
import { PURPLE } from '../constants.js'
import { useSeriesNovels, useNovelGenres, useNovelPublishers, useDebounce } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { NovelCard }  from '../components/NovelCard.jsx'
import { NovelModal } from '../components/NovelModal.jsx'

// ── Small reusable dropdown ───────────────────────────────────────
function FilterDropdown({ label, value, options, onChange, accent }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const active = value && value !== 'all'
  const currentLabel = options.find(o => o.id === value)?.label || label

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: active ? `${accent}22` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? accent + '60' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, padding: '7px 13px', cursor: 'pointer',
        color: active ? '#C4B5FD' : '#94A3B8', fontSize: 12, fontWeight: 600,
        fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}>
        {currentLabel}
        <span style={{ opacity: 0.5, fontSize: 10 }}>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: '#13131f', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: 5, minWidth: 180, maxHeight: 280, overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent',
        }}>
          {options.map(opt => (
            <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false) }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: value === opt.id ? `${accent}25` : 'transparent',
              color: value === opt.id ? '#C4B5FD' : '#94A3B8',
              fontSize: 12, fontWeight: value === opt.id ? 700 : 400,
              fontFamily: "'Be Vietnam Pro', sans-serif",
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => { if (value !== opt.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (value !== opt.id) e.currentTarget.style.background = 'transparent' }}
            >
              {value === opt.id && <span style={{ marginRight: 6, fontSize: 10 }}>✓</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Horizontal carousel ───────────────────────────────────────────
function Carousel({ title, items, loading, onSelect, accent }) {
  const ref = useRef(null)
  const scroll = dir => ref.current?.scrollBy({ left: dir * 680, behavior: 'smooth' })

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, padding: '0 20px' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20,
          fontWeight: 700, letterSpacing: 1, color: '#f1f5f9', margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={arrow} onClick={() => scroll(i === 0 ? -1 : 1)} style={{
              width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#64748B', cursor: 'pointer',
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
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ width: 140, flexShrink: 0, aspectRatio: '2/3',
                borderRadius: 14, background: 'linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))
          : items.map((s, i) => (
              <div key={s.id} onClick={() => onSelect(s)} style={{
                width: 140, flexShrink: 0, aspectRatio: '2/3', borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                background: '#0f172a', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
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
                      justifyContent: 'center', fontSize: 32 }}>📖</div>
                }
                <div style={{ position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}>
                  <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 11, fontWeight: 600,
                    color: '#f1f5f9', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.title}
                  </div>
                  {s.publisher && <div style={{ fontSize: 9, color: '#64748B', marginTop: 2,
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
  const [selected,    setSelected]    = useState(null)
  const [browseMode,  setBrowseMode]  = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [sort,        setSort]        = useState('title_asc')
  const [status,      setStatus]      = useState('all')
  const [genre,       setGenre]       = useState('all')
  const [publisher,   setPublisher]   = useState('all')

  const search     = useDebounce(searchInput)
  const genres     = useNovelGenres()
  const publishers = useNovelPublishers()

  const { series: popular, loading: loadingPop } =
    useSeriesNovels({ search: '', sort: 'score_desc', status: 'all', genre: 'all', limit: 18 })
  const { series: recent, loading: loadingRec } =
    useSeriesNovels({ search: '', sort: 'newest', status: 'all', genre: 'all', limit: 18 })

  const isBrowsing = browseMode || !!search || status !== 'all' || genre !== 'all' || publisher !== 'all'
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

  const NOVEL_SORTS = [
    { id: 'title_asc',  label: lang === 'vi' ? 'Tên A-Z'  : 'Title A-Z'    },
    { id: 'title_desc', label: lang === 'vi' ? 'Tên Z-A'  : 'Title Z-A'    },
    { id: 'score_desc', label: lang === 'vi' ? 'Điểm cao' : 'Top Rated'    },
    { id: 'newest',     label: lang === 'vi' ? 'Mới thêm' : 'Newest Added' },
  ]
  const STATUS_OPTIONS = [
    { id: 'all',       label: lang === 'vi' ? 'Tất cả trạng thái' : 'All statuses'  },
    { id: 'ongoing',   label: lang === 'vi' ? 'Đang tiến hành'    : 'Ongoing'       },
    { id: 'completed', label: lang === 'vi' ? 'Hoàn thành'        : 'Completed'     },
    { id: 'hiatus',    label: lang === 'vi' ? 'Tạm dừng'          : 'Hiatus'        },
    { id: 'cancelled', label: lang === 'vi' ? 'Đã hủy'            : 'Cancelled'     },
  ]
  const PUBLISHER_OPTIONS = [
    { id: 'all', label: lang === 'vi' ? 'Tất cả NXB' : 'All publishers' },
    ...publishers.map(p => ({ id: p, label: p })),
  ]
  const GENRE_OPTIONS = [
    { id: 'all', label: lang === 'vi' ? 'Tất cả thể loại' : 'All genres' },
    ...genres.map(g => ({ id: g.id, label: g.name })),
  ]

  const clearFilters = () => { setStatus('all'); setGenre('all'); setPublisher('all'); setSearchInput('') }

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput=""
        onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />

      {/* Hero + inline search */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg,#0f0c29,#080d1a,#0a0a0f)',
        padding: '28px 20px 24px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 280, background: `radial-gradient(ellipse, ${PURPLE}20 0%, transparent 70%)`,
          pointerEvents: 'none' }} />

        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(22px, 3.5vw, 38px)', lineHeight: 1, letterSpacing: 2,
          marginBottom: 6, color: '#f1f5f9' }}>
          {lang === 'vi' ? 'Light Novel' : 'Light Novels'}
        </div>

        {!isBrowsing && (
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 18,
            fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {lang === 'vi' ? 'Khám phá và theo dõi light novel yêu thích của bạn' : 'Discover and track your favourite light novels'}
          </div>
        )}

        {isBrowsing && totalCount > 0 && !loading && (
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>{totalCount} series</div>
        )}

        {/* Search bar */}
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}
          onClick={() => setBrowseMode(true)}>
          <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            opacity: 0.35, pointerEvents: 'none' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setBrowseMode(true) }}
            placeholder={lang === 'vi' ? 'Tìm kiếm tên light novel...' : 'Search novel title...'}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: '12px 40px 12px 44px',
              color: '#fff', fontSize: 14, outline: 'none',
              fontFamily: "'Be Vietnam Pro', sans-serif",
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = PURPLE + '80'; e.target.style.boxShadow = `0 0 0 3px ${PURPLE}18` }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18,
            }}>×</button>
          )}
        </div>
      </div>

      {/* Advanced filter bar — shown in browse mode */}
      {isBrowsing && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 20px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex',
            alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>

            {/* Filter dropdowns */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <FilterDropdown
                label={lang === 'vi' ? 'Trạng thái' : 'Status'}
                value={status} options={STATUS_OPTIONS} onChange={setStatus} accent={PURPLE} />
              <FilterDropdown
                label={lang === 'vi' ? 'Nhà xuất bản' : 'Publisher'}
                value={publisher} options={PUBLISHER_OPTIONS} onChange={setPublisher} accent={PURPLE} />
              <FilterDropdown
                label={lang === 'vi' ? 'Thể loại' : 'Genre'}
                value={genre} options={GENRE_OPTIONS} onChange={setGenre} accent={PURPLE} />

              {/* Clear filters */}
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{
                  background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
                  color: '#F87171', fontSize: 11, fontWeight: 600, padding: '7px 11px',
                  cursor: 'pointer', fontFamily: "'Be Vietnam Pro', sans-serif",
                }}>✕ {lang === 'vi' ? 'Xóa bộ lọc' : 'Clear'}</button>
              )}
            </div>

            {/* Sort + back */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <FilterDropdown
                label={lang === 'vi' ? 'Sắp xếp' : 'Sort'}
                value={sort} options={NOVEL_SORTS} onChange={setSort} accent={PURPLE} />
              {!searchInput && !hasActiveFilters && (
                <button onClick={() => setBrowseMode(false)} style={{
                  background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
                  padding: '7px 4px', display: 'flex', alignItems: 'center', gap: 4,
                }}>← {lang === 'vi' ? 'Quay lại' : 'Back'}</button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="page-main">
        {/* Discovery carousels */}
        {!isBrowsing && (
          <>
            <Carousel title={lang === 'vi' ? '🏆 Phổ biến nhất' : '🏆 Most Popular'}
              items={popular} loading={loadingPop} onSelect={setSelected} accent={PURPLE} />
            <Carousel title={lang === 'vi' ? '🆕 Mới thêm gần đây' : '🆕 Recently Added'}
              items={recent} loading={loadingRec} onSelect={setSelected} accent={PURPLE} />
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <button onClick={() => setBrowseMode(true)} style={{
                padding: '12px 32px',
                background: `linear-gradient(135deg, ${PURPLE}, #6366F1)`,
                border: 'none', borderRadius: 14, cursor: 'pointer',
                color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 8px 24px ${PURPLE}44`,
              }}>
                {lang === 'vi' ? '📚 Tìm thêm light novel' : '📚 Browse all novels'}
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
                    <NovelCard key={s.id} series={s} rank={i + 1} onClick={setSelected} />
                  ))}
                </CardGrid>
                {hasMore && <LoadMoreBtn onLoad={loadMore} loading={loadingMore} color={PURPLE} />}
              </>
            )}
            {!loading && !error && series.length === 0 && (
              <EmptyState icon="📖"
                msg={lang === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'} />
            )}
          </>
        )}
      </main>

      <PageFooter color={PURPLE} src="NovelTrend" />
      {selected && <NovelModal series={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
