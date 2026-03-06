import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'

const AuthContext = createContext()

// ── Token storage (more secure than plain localStorage key) ──
const TOKEN_KEY   = 'nt_auth_token'
const REFRESH_KEY = 'nt_auth_refresh'
const EXPIRY_KEY  = 'nt_auth_expiry'

const store = {
  save(access, refresh, expiresIn) {
    const expiry = Date.now() + (expiresIn - 60) * 1000  // refresh 60s early
    localStorage.setItem(TOKEN_KEY,   access)
    localStorage.setItem(REFRESH_KEY, refresh)
    localStorage.setItem(EXPIRY_KEY,  String(expiry))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(EXPIRY_KEY)
  },
  get() {
    return {
      token:     localStorage.getItem(TOKEN_KEY),
      refresh:   localStorage.getItem(REFRESH_KEY),
      expiry:    parseInt(localStorage.getItem(EXPIRY_KEY) || '0'),
    }
  },
}

// ── Supabase Auth REST calls ──────────────────────────────────
const authFetch = async (path, body, token = null) => {
  const headers = {
    apikey:         SUPABASE_ANON,
    'Content-Type': 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res  = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method:  'POST',
    headers,
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(
    data.msg || data.error_description || data.message || `Auth error ${res.status}`
  )
  return data
}

const getUser = async (token) => {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

const refreshToken = async (refresh) => {
  return authFetch('/token?grant_type=refresh_token', { refresh_token: refresh })
}

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)
  const refreshTimer = useRef(null)

  const applySession = (data) => {
    store.save(data.access_token, data.refresh_token, data.expires_in || 3600)
    setToken(data.access_token)
    window.dispatchEvent(new CustomEvent('nt:auth', { detail: { token: data.access_token } }))
    setUser(data.user)
    scheduleRefresh(data.expires_in || 3600)
  }

  const clearSession = () => {
    store.clear()
    setToken(null)
    setUser(null)
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
  }

  const scheduleRefresh = (expiresIn) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    const delay = Math.max((expiresIn - 120) * 1000, 5000) // refresh 2min early
    refreshTimer.current = setTimeout(async () => {
      const { refresh } = store.get()
      if (!refresh) return
      try {
        const data = await refreshToken(refresh)
        applySession(data)
      } catch {
        clearSession()
      }
    }, delay)
  }

  // On mount: restore session from storage + handle OAuth redirect
  useEffect(() => {
    const init = async () => {
      // Handle OAuth redirect hash
      const hash = window.location.hash
      if (hash.includes('access_token=')) {
        const params   = new URLSearchParams(hash.replace(/^#\/?/, '').replace(/^.*\?/, ''))
        const fragment = new URLSearchParams(hash.slice(hash.indexOf('#') + 1))
        const access   = fragment.get('access_token')
        const refresh  = fragment.get('refresh_token')
        const expires  = parseInt(fragment.get('expires_in') || '3600')
        if (access) {
          const userData = await getUser(access)
          if (userData) {
            store.save(access, refresh, expires)
            setToken(access)
            setUser(userData)
            scheduleRefresh(expires)
            window.location.hash = '#/'
            setLoading(false)
            return
          }
        }
      }

      // Restore from storage
      const { token: savedToken, refresh, expiry } = store.get()
      if (savedToken) {
        if (Date.now() < expiry) {
          // Token still valid
          const userData = await getUser(savedToken)
          if (userData) {
            setToken(savedToken)
            setUser(userData)
            window.dispatchEvent(new CustomEvent('nt:auth', { detail: { token: savedToken } }))
            const remaining = Math.max(Math.floor((expiry - Date.now()) / 1000), 0)
            scheduleRefresh(remaining)
            setLoading(false)
            return
          }
        }
        // Token expired — try refresh
        if (refresh) {
          try {
            const data = await refreshToken(refresh)
            applySession(data)
            setLoading(false)
            return
          } catch {
            store.clear()
          }
        }
      }
      setLoading(false)
    }
    init()
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current) }
  }, [])

  const signUp = async (email, password) => {
    const data = await authFetch('/signup', { email, password })
    if (data.access_token) applySession(data)
    return data
  }

  const signIn = async (email, password) => {
    const data = await authFetch('/token?grant_type=password', { email, password })
    applySession(data)
    return data
  }

  const signInWithGoogle = () => {
    // Always redirect back to the app root — handles GitHub Pages /bxh/ subpath
    const base = window.location.origin + window.location.pathname.replace(/\/$/, '')
    // Ensure we land on the app, not a subpage
    const appRoot = base.endsWith('/bxh') ? base + '/' : base + '/'
    window.location.href =
      `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(appRoot)}`
  }

  const signOut = async () => {
    try {
      if (token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method:  'POST',
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
        })
      }
    } catch {}
    clearSession()
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      signUp, signIn, signOut, signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
