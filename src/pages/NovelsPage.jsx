import React, { useState, useEffect } from 'react'
import { PURPLE } from '../constants.js'
import { useSeriesNovels, useNovelGenres, useDebounce } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner, Pills, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { NovelCard }  from '../components/NovelCard.jsx'
import { NovelModal } from '../components/NovelModal.jsx'

export function NovelsPage() {
  const { t, lang } = useLang()
  const [selected,    setSelected]    = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [sort,        setSort]        = useState('title_asc')
  const [status,      setStatus]      = useState('all')
  const [genre,       setGenre]       = useState('all')

  const search  = useDebounce(searchInput)
  const genres  = useNovelGenres()

  const { series, loading, loadingMore, error, hasMore, totalCount, loadMore, retry } =
    useSeriesNovels({ search, sort, status, genre })

  useEffect(() => {
    const fn = e => {
      if (e.detail?.type !== 'novel') return
      const q = (e.detail.title || '').toLowerCase()
      const match = series.find(s => (s.title || '').toLowerCase().includes(q))
      if (match) setSelected(match)
      else setSearchInput(e.detail.title)
    }
    window.addEventListener('nt:open-series', fn)
    return () => window.removeEventListener('nt:open-series', fn)
  }, [series])

  const NOVEL_SORTS = [
    { id: 'title_asc',   label: lang === 'vi' ? 'Tên A-Z'   : 'Title A-Z'    },
    { id: 'title_desc',  label: lang === 'vi' ? 'Tên Z-A'   : 'Title Z-A'    },
    { id: 'score_desc',  label: lang === 'vi' ? 'Điểm cao'  : 'Top Rated'    },
    { id: 'newest',      label: lang === 'vi' ? 'Mới thêm'  : 'Newest Added' },
  ]

  const NOVEL_STATUSES = [
    { id: 'all',       label: t('status_all')       },
    { id: 'ongoing',   label: t('status_ongoing')   },
    { id: 'completed', label: t('status_completed') },
    { id: 'hiatus',    label: t('status_hiatus')    },
    { id: 'cancelled', label: t('status_cancelled') },
  ]

  const heroTitle = search
    ? (lang === 'vi' ? `Kết quả: "${search}"` : `Results: "${search}"`)
    : genre !== 'all' ? genre
    : lang === 'vi' ? 'Light Novel' : 'Light Novels'

  const tagline = !searchInput && status === 'all' && genre === 'all'
    ? (lang === 'vi'
      ? 'Khám phá và theo dõi light novel yêu thích của bạn'
      : 'Discover and track your favourite light novels')
    : null

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput={searchInput}
        onSearch={setSearchInput} sorts={NOVEL_SORTS} activeSort={sort} onSort={setSort} />

      <HeroBanner title={heroTitle}
        sub={!loading && totalCount > 0 ? `${totalCount} series` : null}
        accent={PURPLE} src="NovelTrend"
        tagline={tagline} />

      <div className="filter-bar">
        <div className="filter-bar__inner">
          <div className="filter-row">
            <Pills items={NOVEL_STATUSES} active={status} onSelect={setStatus} accent={PURPLE} solid />
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

      <main className="page-main">
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
      </main>

      <PageFooter color={PURPLE} src="NovelTrend" />
      {selected && <NovelModal series={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
