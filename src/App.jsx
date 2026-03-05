import React, { useState, useEffect } from 'react'
import { RANOBE } from './constants.js'
import { useHash } from './hooks.js'
import { LangProvider }    from './context/LangContext.jsx'
import { AuthProvider }    from './context/AuthContext.jsx'
import { ToastProvider }   from './context/ToastContext.jsx'
import { ErrorBoundary }   from './components/ErrorBoundary.jsx'
import { LandingPage }     from './pages/LandingPage.jsx'
import { NovelsPage }      from './pages/NovelsPage.jsx'
import { AnimePage }       from './pages/AnimePage.jsx'
import { MangaPage }       from './pages/MangaPage.jsx'
import { VotePage }        from './pages/VotePage.jsx'
import { MyListPage }      from './pages/MyListPage.jsx'
import { SchedulePage }    from './pages/SchedulePage.jsx'
import { RankingPage }     from './pages/RankingPage.jsx'

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
  if (hash.startsWith('#/novels'))    return wrap(NovelsPage, { genres })
  if (hash.startsWith('#/anime'))     return wrap(AnimePage)
  if (hash.startsWith('#/manga'))     return wrap(MangaPage)
  if (hash.startsWith('#/vote'))      return wrap(VotePage)
  if (hash.startsWith('#/list'))      return wrap(MyListPage)
  if (hash.startsWith('#/schedule'))   return wrap(SchedulePage)
  if (hash.startsWith('#/ranking'))    return wrap(RankingPage)
  return wrap(LandingPage)
}

export default function App() {
  return (
    <ErrorBoundary>
      <LangProvider>
        <AuthProvider>
          <ToastProvider>
            <Router />
          </ToastProvider>
        </AuthProvider>
      </LangProvider>
    </ErrorBoundary>
  )
}
