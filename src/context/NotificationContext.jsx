import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { SCHEDULE_MOCK } from '../mockData.js'

const NotifContext = createContext()
export const useNotifications = () => useContext(NotifContext)

// How many hours ahead to warn
const WARN_HOURS = 24

function getMessages(item, lang) {
  const typeLabel = {
    anime: { vi: 'anime', en: 'anime' },
    manga: { vi: 'manga', en: 'manga' },
    novel: { vi: 'light novel', en: 'light novel' },
  }[item.type] || { vi: 'series', en: 'series' }

  const epLabel = item.episode ? (lang === 'vi' ? `tập ${item.episode}` : `episode ${item.episode}`)
    : item.chapter ? (lang === 'vi' ? `chương ${item.chapter}` : `chapter ${item.chapter}`)
    : item.volume  ? (lang === 'vi' ? `tập ${item.volume}` : `volume ${item.volume}`)
    : null

  const releaseTime = new Date(item.airsAt).toLocaleTimeString(
    lang === 'vi' ? 'vi-VN' : 'en-US',
    { hour: '2-digit', minute: '2-digit' }
  )

  const isToday = new Date(item.airsAt).toDateString() === new Date().toDateString()
  const timeLabel = isToday
    ? (lang === 'vi' ? `hôm nay lúc ${releaseTime}` : `today at ${releaseTime}`)
    : (lang === 'vi' ? `vào lúc ${releaseTime}` : `at ${releaseTime}`)

  if (lang === 'vi') {
    return epLabel
      ? `${item.title} — ${typeLabel.vi} ${epLabel} sẽ phát hành ${timeLabel}!`
      : `${item.title} — ${typeLabel.vi} mới sẽ phát hành ${timeLabel}!`
  } else {
    return epLabel
      ? `${item.title} — ${typeLabel.en} ${epLabel} releases ${timeLabel}!`
      : `${item.title} — new ${typeLabel.en} releases ${timeLabel}!`
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])   // { id, item, messageVi, messageEn, read, createdAt }
  const [userItems,     setUserItems]     = useState([])   // user's list items from Supabase
  const [token,         setToken]         = useState(null)

  // Called by AuthContext when user logs in/out
  const setUserToken = useCallback((t) => setToken(t), [])

  // Listen for auth events from AuthContext
  useEffect(() => {
    const fn = e => setToken(e.detail?.token || null)
    window.addEventListener('nt:auth', fn)
    return () => window.removeEventListener('nt:auth', fn)
  }, [])

  // Fetch user's list from Supabase
  useEffect(() => {
    if (!token) { setUserItems([]); return }
    fetch(`${SUPABASE_URL}/rest/v1/user_lists?select=item_id,item_type,title`, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${token}`,
      }
    })
      .then(r => r.json())
      .then(data => setUserItems(Array.isArray(data) ? data : []))
      .catch(() => setUserItems([]))
  }, [token])

  // Match user's list against upcoming schedule
  useEffect(() => {
    if (!userItems.length) { setNotifications([]); return }

    const now      = new Date()
    const warnMs   = WARN_HOURS * 60 * 60 * 1000
    const upcoming = SCHEDULE_MOCK.filter(item => {
      const t = new Date(item.airsAt)
      return t > now && (t - now) <= warnMs
    })

    // Check which upcoming items match user's followed series
    const matched = upcoming.filter(schedItem =>
      userItems.some(u =>
        u.item_type === schedItem.type &&
        (u.item_id === String(schedItem.id) ||
         u.title?.toLowerCase() === schedItem.title?.toLowerCase())
      )
    )

    const notifs = matched.map(item => ({
      id:        item.id,
      item,
      messageVi: getMessages(item, 'vi'),
      messageEn: getMessages(item, 'en'),
      read:      false,
      createdAt: new Date().toISOString(),
    }))

    setNotifications(notifs)
  }, [userItems])

  const markRead    = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
  const markAllRead = ()   => setNotifications(n => n.map(x => ({ ...x, read: true })))
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, setUserToken }}>
      {children}
    </NotifContext.Provider>
  )
}
