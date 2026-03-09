import React, { useState, useEffect } from 'react'
import { CYAN } from '../constants.js'
import { useAnime, useDebounce } from '../hooks.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner, Pills, SkeletonGrid, CardGrid, EmptyState, ErrorBox, LoadMoreBtn, PageFooter } from '../components/Shared.jsx'
import { AnimeCard }  from '../components/AnimeCard.jsx'
import { AnimeModal } from '../components/AnimeModal.jsx'

export function AnimePage() {
  const { t, lang } = useLang()
  const [selected,    setSelected]    = useState(null)

  useEffect(() => {
    const fn = e => {
      if (e.detail?.type !== 'anime') return
      const q = (e.detail.title || '').toLowerCase()
      const match = anime.find(a =>
        (a.title_english || a.title_romaji || '').toLowerCase().includes(q)
      )
      if (match) setSelected(match)
      else setSearchInput(e.detail.title)
    }
    window.addEventListener('nt:open-series', fn)
    return () => window.removeEventListener('nt:open-series', fn)
  }, [anime])
  const [searchInput, setSearchInput] = useState('')
  const [sort,        setSort]        = useState('POPULARITY_DESC')
  const [status,      setStatus]      = useState('')
  const [format,      setFormat]      = useState('')
  const [genre,       setGenre]       = useState('All')

  const search = useDebounce(searchInput)

  const { anime, loading, loadingMore, error, page, hasNext, totalCount, loadMore, retry } =
    useAnime({ search, sort, status, format, genre })

  const ANIME_SORTS = [
    { id: 'POPULARITY_DESC', label: t('sort_popular')   },
    { id: 'SCORE_DESC',      label: t('sort_toprated')  },
    { id: 'TRENDING_DESC',   label: t('sort_trending')  },
    { id: 'START_DATE_DESC', label: t('sort_newest')    },
    { id: 'START_DATE',      label: t('sort_oldest')    },
    { id: 'TITLE_ROMAJI',    label: t('sort_az')        },
    { id: 'FAVOURITES_DESC', label: t('sort_faved')     },
  ]

  const ANIME_STATUSES = [
    { id: '',                 label: t('status_all')       },
    { id: 'RELEASING',        label: t('status_airing')    },
    { id: 'FINISHED',         label: t('status_finished')  },
    { id: 'NOT_YET_RELEASED', label: t('status_upcoming')  },
    { id: 'CANCELLED',        label: t('status_cancelled') },
  ]

  const ANIME_FORMATS = [
    { id: '',        label: t('filter_all') },
    { id: 'TV',      label: 'TV'      },
    { id: 'MOVIE',   label: 'Movie'   },
    { id: 'OVA',     label: 'OVA'     },
    { id: 'ONA',     label: 'ONA'     },
    { id: 'SPECIAL', label: 'Special' },
  ]

  const ANIME_GENRES = ['All','Action','Adventure','Comedy','Drama','Fantasy','Horror',
    'Mecha','Mystery','Psychological','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller']

  const heroTitle = search
    ? t('hero_results', search)
    : genre !== 'All' ? `${genre.toUpperCase()} ANIME`
    : status === 'RELEASING' ? t('hero_airing')
    : t('hero_anime')

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/anime" accent={CYAN} searchInput=""
        onSearch={() => {}} hideSearch sorts={ANIME_SORTS} activeSort={sort} onSort={setSort} />

      <HeroBanner title={heroTitle}
        sub={!loading && totalCount > 0 ? t('hero_found_anime', totalCount) : null}
        accent={CYAN} src="AniList"
        tagline={!searchInput && status === 'all' ? (lang === 'vi' ? 'Khám phá và theo dõi anime yêu thích của bạn' : 'Discover and track your favourite anime series') : null}
        searchInput={searchInput}
        onSearch={setSearchInput}
        searchPlaceholder={lang === 'vi' ? 'Tìm kiếm anime...' : 'Search anime...'} />

      <div className="filter-bar">
        <div className="filter-bar__inner">
          <div className="filter-row" style={{ alignItems: 'center' }}>
            <span className="filter-row__label">{t('filter_status')}</span>
            <Pills items={ANIME_STATUSES} active={status} onSelect={setStatus} accent={CYAN} solid />
            <span className="filter-row__label" style={{ marginLeft: 6 }}>{t('filter_format')}</span>
            <Pills items={ANIME_FORMATS} active={format} onSelect={setFormat} accent={CYAN} solid={false} />
          </div>
          <div className="filter-row">
            <Pills items={ANIME_GENRES.map(g => ({ id: g, label: g }))}
              active={genre} onSelect={setGenre} accent={CYAN} solid={false} />
          </div>
        </div>
      </div>

      <main className="page-main">
        {error && <ErrorBox msg={error} onRetry={retry} color={CYAN} />}
        {loading && !error && <SkeletonGrid />}
        {!loading && !error && anime.length > 0 && (
          <>
            <CardGrid>
              {anime.map((a, i) => (
                <AnimeCard key={a.id} anime={a} rank={i + 1 + (page - 1) * 24} onClick={setSelected} />
              ))}
            </CardGrid>
            {hasNext && <LoadMoreBtn onLoad={loadMore} loading={loadingMore} color={CYAN} />}
          </>
        )}
        {!loading && !error && anime.length === 0 && <EmptyState icon="🎌" msg={t('empty_anime')} />}
      </main>

      <PageFooter color={CYAN} src="AniList" />
      {selected && <AnimeModal anime={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
