import React, { useState, useEffect } from 'react'
import { RANOBE } from './constants.js'
import { useHash } from './hooks.js'
import { LangProvider }    from './context/LangContext.jsx'
import { ThemeProvider }   from './context/ThemeContext.jsx'
import { ThemeToggle }     from './components/Shared.jsx'
import { AuthProvider }    from './context/AuthContext.jsx'
import { ToastProvider }   from './context/ToastContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ErrorBoundary }   from './components/ErrorBoundary.jsx'
import { LandingPage }     from './pages/LandingPage.jsx'
import { NovelsPage }      from './pages/NovelsPage.jsx'
import { AnimePage }       from './pages/AnimePage.jsx'
import { MangaPage }       from './pages/MangaPage.jsx'
import { VotePage }        from './pages/VotePage.jsx'
import { MyListPage }      from './pages/MyListPage.jsx'
import { SchedulePage }    from './pages/SchedulePage.jsx'
import { RankingPage }     from './pages/RankingPage.jsx'
import { AdminPage }      from './pages/AdminPage.jsx'
import { SeriesDetailPage } from './pages/SeriesDetailPage.jsx'
import { VolumeDetailPage } from './pages/VolumeDetailPage.jsx'
import { AnimeDetailPage } from './pages/AnimeDetailPage.jsx'
import { MangaDetailPage } from './pages/MangaDetailPage.jsx'
import { parseSeriesId, parseVolumeNumber, parseAnimeId, parseMangaId } from './hooks.js'

function Router() {
  const hash   = useHash()
  const [genres, setGenres] = useState([{ id: 'all', name: 'All Genres' }])

  useEffect(() => {
    fetch(`${RANOBE}/tags?limit=100`)
      .then(r  => r.json())
      .then(d  => setGenres([
        { id: 'all', name: 'All Genres' },
        ...(d.tags || []).filter(t => t.ttype === 'genre'),
      ]))
      .catch(() => {})
  }, [])

  const wrap = (Page, props = {}) => (
    <ErrorBoundary key={hash}>
      <Page {...props} />
    </ErrorBoundary>
  )

  if (hash === '#/' || hash === '')   return wrap(LandingPage)

  // Series + volume detail pages
  if (hash.startsWith('#/novel/')) {
    const sid = parseSeriesId(hash)
    const vnum = parseVolumeNumber(hash)
    if (sid && vnum != null) return wrap(VolumeDetailPage, { seriesId: sid, volumeNumber: vnum })
    if (sid)                  return wrap(SeriesDetailPage, { seriesId: sid })
  }

  if (hash.startsWith('#/novels'))    return wrap(NovelsPage)

  if (hash.startsWith('#/anime/')) {
    const aid = parseAnimeId(hash)
    if (aid) return wrap(AnimeDetailPage, { animeId: aid })
  }
  if (hash.startsWith('#/anime'))     return wrap(AnimePage)
  if (hash.startsWith('#/manga/')) {
    const mid = parseMangaId(hash)
    if (mid) return wrap(MangaDetailPage, { mangaId: mid })
  }
  if (hash.startsWith('#/manga'))     return wrap(MangaPage)
  if (hash.startsWith('#/vote'))      return wrap(VotePage)
  if (hash.startsWith('#/list'))      return wrap(MyListPage)
  if (hash.startsWith('#/schedule'))   return wrap(SchedulePage)
  if (hash.startsWith('#/ranking'))    return wrap(RankingPage)
  if (hash.startsWith('#/admin'))      return wrap(AdminPage)
  return wrap(LandingPage)
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <NotificationProvider>
            <ToastProvider>
              <Router />
              <ThemeToggle />
            </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
