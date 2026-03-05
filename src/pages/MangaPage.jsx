import React, { useState } from 'react'
import { ROSE } from '../constants.js'
import { useManga, useMangaTags, useDebounce } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner, Pills, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { MangaCard }  from '../components/MangaCard.jsx'
import { MangaModal } from '../components/MangaModal.jsx'

export function MangaPage() {
  const { t } = useLang()
  const [selected,    setSelected]    = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [sort,        setSort]        = useState('followedCount')
  const [status,      setStatus]      = useState('')
  const [demographic, setDemographic] = useState('')
  const [tag,         setTag]         = useState('')

  const search = useDebounce(searchInput)
  const tags   = useMangaTags()

  const { manga, stats, loading, loadingMore, error, hasNext, totalCount, loadMore, retry } =
    useManga({ search, sort, status, demographic, tag })

  const MANGA_SORTS = [
    { id: 'followedCount',         label: t('sort_popular')   },
    { id: 'rating',                label: t('sort_toprated')  },
    { id: 'latestUploadedChapter', label: t('sort_latest')    },
    { id: 'createdAt',             label: t('sort_newest')    },
    { id: 'title',                 label: t('sort_az')        },
    { id: 'relevance',             label: t('sort_relevance') },
  ]

  const MANGA_STATUSES = [
    { id: '',          label: t('status_all')       },
    { id: 'ongoing',   label: t('status_ongoing')   },
    { id: 'completed', label: t('status_completed') },
    { id: 'hiatus',    label: t('status_hiatus')    },
    { id: 'cancelled', label: t('status_cancelled') },
  ]

  const MANGA_DEMOGRAPHICS = [
    { id: '',        label: t('filter_all') },
    { id: 'shounen', label: 'Shounen' },
    { id: 'shoujo',  label: 'Shoujo'  },
    { id: 'seinen',  label: 'Seinen'  },
    { id: 'josei',   label: 'Josei'   },
  ]

  const heroTitle = search
    ? t('hero_results', search)
    : demographic ? `${demographic.toUpperCase()} MANGA`
    : status === 'ongoing' ? t('hero_ongoing')
    : t('hero_manga')

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/manga" accent={ROSE} searchInput={searchInput}
        onSearch={setSearchInput} sorts={MANGA_SORTS} activeSort={sort} onSort={setSort} />

      <HeroBanner title={heroTitle}
        sub={!loading && totalCount > 0 ? t('hero_found_manga', totalCount) : null}
        accent={ROSE} src="MangaDex" />

      <div className="filter-bar">
        <div className="filter-bar__inner">
          <div className="filter-row" style={{ alignItems: 'center' }}>
            <span className="filter-row__label">{t('filter_status')}</span>
            <Pills items={MANGA_STATUSES} active={status} onSelect={setStatus} accent={ROSE} solid />
            <span className="filter-row__label" style={{ marginLeft: 6 }}>{t('filter_demographic')}</span>
            <Pills items={MANGA_DEMOGRAPHICS} active={demographic} onSelect={setDemographic} accent={ROSE} solid={false} />
          </div>
          <div className="filter-row">
            <Pills items={tags} active={tag} onSelect={setTag} accent={ROSE} solid={false} />
          </div>
        </div>
      </div>

      <main className="page-main">
        {error && <ErrorBox msg={error} onRetry={retry} color={ROSE} />}
        {loading && !error && <SkeletonGrid />}
        {!loading && !error && manga.length > 0 && (
          <>
            <CardGrid>
              {manga.map((m, i) => (
                <MangaCard key={m.id} manga={m} rank={i + 1} stats={stats} onClick={setSelected} />
              ))}
            </CardGrid>
            {hasNext && <LoadMoreBtn onLoad={loadMore} loading={loadingMore} color={ROSE} />}
          </>
        )}
        {!loading && !error && manga.length === 0 && <EmptyState icon="📚" msg={t('empty_manga')} />}
      </main>

      <PageFooter color={ROSE} src="MangaDex" />
      {selected && <MangaModal manga={selected} stats={stats} onClose={() => setSelected(null)} />}
    </div>
  )
}
