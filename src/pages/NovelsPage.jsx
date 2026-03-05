import React, { useState } from 'react'
import { PURPLE } from '../constants.js'
import { useNovels, useDebounce } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner, Pills, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { NovelCard }  from '../components/NovelCard.jsx'
import { NovelModal } from '../components/NovelModal.jsx'

export function NovelsPage({ genres }) {
  const { t } = useLang()
  const [selected,    setSelected]    = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [sort,        setSort]        = useState('Start date desc')
  const [status,      setStatus]      = useState('all')
  const [genre,       setGenre]       = useState('all')

  const search = useDebounce(searchInput)

  const { series, loading, loadingMore, error, hasMore, totalCount, loadMore, retry } =
    useNovels({ search, sort, status, genre })

  const NOVEL_SORTS = [
    { id: 'Start date desc', label: t('sort_newest')   },
    { id: 'Start date asc',  label: t('sort_oldest')   },
    { id: 'Title asc',       label: t('sort_az')       },
    { id: 'Title desc',      label: t('sort_za')       },
    { id: 'Num. books desc', label: t('sort_mostvols') },
    { id: 'Num. books asc',  label: t('sort_fewest')   },
  ]

  const NOVEL_STATUSES = [
    { id: 'all',       label: t('status_all')       },
    { id: 'ongoing',   label: t('status_ongoing')   },
    { id: 'completed', label: t('status_completed') },
    { id: 'hiatus',    label: t('status_hiatus')    },
    { id: 'cancelled', label: t('status_cancelled') },
  ]

  const heroTitle = search
    ? t('hero_results', search)
    : genre !== 'all'
    ? t('hero_genre', genres.find(g => g.id === genre)?.name || '')
    : t('hero_novels')

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput={searchInput}
        onSearch={setSearchInput} sorts={NOVEL_SORTS} activeSort={sort} onSort={setSort} />

      <HeroBanner title={heroTitle}
        sub={!loading && totalCount > 0 ? t('hero_found_novels', totalCount) : null}
        accent={PURPLE} src="RanobeDB" />

      <div className="filter-bar">
        <div className="filter-bar__inner">
          <div className="filter-row">
            <Pills items={NOVEL_STATUSES} active={status} onSelect={setStatus} accent={PURPLE} solid />
          </div>
          <div className="filter-row">
            <Pills items={genres.map(g => ({ id: g.id, label: g.name }))}
              active={genre} onSelect={setGenre} accent={PURPLE} solid={false} />
          </div>
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
        {!loading && !error && series.length === 0 && <EmptyState icon="📖" msg={t('empty_novels')} />}
      </main>

      <PageFooter color={PURPLE} src="RanobeDB" />
      {selected && <NovelModal series={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
