import React, { useState, useEffect } from 'react'
import { RANOBE } from './constants.js'
import { useHash } from './hooks.js'
import { LangProvider } from './context/LangContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { NovelsPage }  from './pages/NovelsPage.jsx'
import { AnimePage }   from './pages/AnimePage.jsx'
import { MangaPage }   from './pages/MangaPage.jsx'
import { VotePage }    from './pages/VotePage.jsx'
import { MyListPage }  from './pages/MyListPage.jsx'

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

  if (hash === '#/' || hash === '')        return <LandingPage />
  if (hash.startsWith('#/novels'))         return <NovelsPage genres={genres} />
  if (hash.startsWith('#/anime'))          return <AnimePage />
  if (hash.startsWith('#/manga'))          return <MangaPage />
  if (hash.startsWith('#/vote'))           return <VotePage />
  if (hash.startsWith('#/list'))           return <MyListPage />
  return <LandingPage />
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <ToastProvider>
        <Router />
        </ToastProvider>
      </AuthProvider>
    </LangProvider>
  )
}
