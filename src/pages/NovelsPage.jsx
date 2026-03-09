import React, { useState, useEffect, useRef } from 'react'
import { PURPLE } from '../constants.js'
import { useSeriesNovels, useNovelGenres, useDebounce } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner, Pills, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { NovelCard }  from '../components/NovelCard.jsx'
import { NovelModal } from '../components/NovelModal.jsx'

// ── Horizontal carousel ───────────────────────────────────────────
function Carousel({ title, items, loading, onSelect, accent }) {
  const ref = useRef(null)
  const scroll = dir => {
    ref.current?.scrollBy({ left: dir * 680, behavior: 'smooth' })
  }
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, padding: '0 20px' }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20,
          fontWeight: 700, letterSpacing: 1, color: '#f1f5f9', margin: 0 }}>
          {title}
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['←', '→'].map((arrow, i) => (
            <button key={arrow} onClick={() => scroll(i === 0 ? -1 : 1)} style={{
              width: 30, height: 30, borderRadius: 8, border: `1px solid rgba(255,255,255,0.1)`,
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
              <div key={i} style={{
                width: 140, flexShrink: 0, aspectRatio: '2/3', borderRadius: 14,
                background: 'linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
              }} />
            ))
          : items.map((s, i) => (
              <div key={s.id} onClick={() => onSelect(s)} style={{
                width: 140, flexShrink: 0, aspectRatio: '2/3', borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
                background: '#0f172a',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = `0 16px 40px ${accent}44` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
              >
                {/* Rank badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 8, zIndex: 3,
                  width: 24, height: 24, borderRadius: 7,
                  background: i < 3 ? `linear-gradient(135deg,${['#FFD700','#C0C0C0','#CD7F32'][i]},${['#FFA500','#A8A8A8','#A0522D'][i]})` : 'rgba(0,0,0,0.65)',
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

                {/* Gradient + title overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 8px 8px',
                }}>
                  <div style={{
                    fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 11, fontWeight: 600,
                    color: '#f1f5f9', lineHeight: 1.3,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{s.title}</div>
                  {s.publisher && (
                    <div style={{ fontSize: 9, color: '#64748B', marginTop: 2, fontWeight: 600,
                      letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.publisher}</div>
                  )}
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
  const [sortOpen,    setSortOpen]    = useState(false)
  const sortRef = useRef(null)

  const search  = useDebounce(searchInput)
  const genres  = useNovelGenres()

  // Popular carousel: top by score
  const { series: popular, loading: loadingPop } =
    useSeriesNovels({ search: '', sort: 'score_desc', status: 'all', genre: 'all', limit: 18 })

  // Recent carousel: newest added
  const { series: recent, loading: loadingRec } =
    useSeriesNovels({ search: '', sort: 'newest', status: 'all', genre: 'all', limit: 18 })

  // Browse grid (only active when in browseMode or searching/filtering)
  const isBrowsing = browseMode || !!search || status !== 'all' || genre !== 'all'
  const { series, loading, loadingMore, error, hasMore, totalCount, loadMore, retry } =
    useSeriesNovels({ search, sort, status, genre })

  // Close sort dropdown on outside click
  useEffect(() => {
    const fn = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Open browse mode + set search from event
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
    { id: 'title_asc',   label: lang === 'vi' ? 'Tên A-Z'   : 'Title A-Z'    },
    { id: 'title_desc',  label: lang === 'vi' ? 'Tên Z-A'   : 'Title Z-A'    },
    { id: 'score_desc',  label: lang === 'vi' ? 'Điểm cao'  : 'Top Rated'    },
    { id: 'newest',      label: lang === 'vi' ? 'Mới thêm'  : 'Newest Added' },
  ]

  const NOVEL_STATUSES = [
    { id: 'all',       label: lang === 'vi' ? 'Tất cả'         : 'All'       },
    { id: 'ongoing',   label: lang === 'vi' ? 'Đang tiến hành' : 'Ongoing'   },
    { id: 'completed', label: lang === 'vi' ? 'Hoàn thành'     : 'Completed' },
    { id: 'hiatus',    label: lang === 'vi' ? 'Tạm dừng'       : 'Hiatus'    },
    { id: 'cancelled', label: lang === 'vi' ? 'Đã hủy'         : 'Cancelled' },
  ]

  const currentSortLabel = NOVEL_SORTS.find(s => s.id === sort)?.label || NOVEL_SORTS[0].label

  const heroTitle = isBrowsing && search
    ? (lang === 'vi' ? `Kết quả: "${search}"` : `Results: "${search}"`)
    : lang === 'vi' ? 'Light Novel' : 'Light Novels'

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput={searchInput}
        onSearch={v => { setSearchInput(v); if (v) setBrowseMode(true) }}
        sorts={[]} activeSort="" onSort={() => {}} hideSorts />

      <HeroBanner title={heroTitle}
        sub={isBrowsing && !loading && totalCount > 0 ? `${totalCount} series` : null}
        accent={PURPLE} src="NovelTrend"
        tagline={!isBrowsing ? (lang === 'vi'
          ? 'Khám phá và theo dõi light novel yêu thích của bạn'
          : 'Discover and track your favourite light novels') : null} />

      {/* Filter bar — only shown in browse mode */}
      {isBrowsing && (
        <div className="filter-bar">
          <div className="filter-bar__inner">
            <div className="filter-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Pills items={NOVEL_STATUSES} active={status} onSelect={setStatus} accent={PURPLE} solid />

              {/* Sort dropdown */}
              <div ref={sortRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button onClick={() => setSortOpen(o => !o)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                  color: '#f1f5f9', fontSize: 12, fontWeight: 600,
                  fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
                }}>
                  {currentSortLabel}
                  <span style={{ color: '#64748B', fontSize: 10 }}>▾</span>
                </button>
                {sortOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
                    background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: 6, minWidth: 160,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                  }}>
                    {NOVEL_SORTS.map(s => (
                      <button key={s.id} onClick={() => { setSort(s.id); setSortOpen(false) }} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: sort === s.id ? `${PURPLE}22` : 'transparent',
                        color: sort === s.id ? '#C4B5FD' : '#94A3B8',
                        fontSize: 13, fontWeight: sort === s.id ? 700 : 500,
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                      }}>{s.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {genres.length > 0 && (
              <div className="filter-row">
                <Pills
                  items={[{ id: 'all', label: lang === 'vi' ? 'Tất cả thể loại' : 'All Genres' },
                          ...genres.map(g => ({ id: g.id, label: g.name }))]}
                  active={genre} onSelect={setGenre} accent={PURPLE} solid={false} />
              </div>
            )}
          </div>
        </div>
      )}

      <main className="page-main">
        {/* ── Discovery mode: two carousels ── */}
        {!isBrowsing && (
          <>
            <Carousel
              title={lang === 'vi' ? '🏆 Phổ biến nhất' : '🏆 Most Popular'}
              items={popular} loading={loadingPop}
              onSelect={setSelected} accent={PURPLE} />

            <Carousel
              title={lang === 'vi' ? '🆕 Mới thêm gần đây' : '🆕 Recently Added'}
              items={recent} loading={loadingRec}
              onSelect={setSelected} accent={PURPLE} />

            {/* Browse more button */}
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <button onClick={() => setBrowseMode(true)} style={{
                padding: '12px 32px',
                background: `linear-gradient(135deg, ${PURPLE}, #6366F1)`,
                border: 'none', borderRadius: 14, cursor: 'pointer',
                color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 8px 24px ${PURPLE}44`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${PURPLE}66` }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 8px 24px ${PURPLE}44` }}
              >
                {lang === 'vi' ? '📚 Tìm thêm light novel' : '📚 Browse all novels'}
              </button>
            </div>
          </>
        )}

        {/* ── Browse mode: full grid ── */}
        {isBrowsing && (
          <>
            {/* Back to discovery */}
            {!search && status === 'all' && genre === 'all' && (
              <button onClick={() => setBrowseMode(false)} style={{
                background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
                marginBottom: 16, padding: 0, display: 'flex', alignItems: 'center', gap: 5,
              }}>← {lang === 'vi' ? 'Quay lại' : 'Back'}</button>
            )}

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
