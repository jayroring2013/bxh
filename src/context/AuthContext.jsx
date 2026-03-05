import React, { createContext, useContext, useState, useEffect } from 'react'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'

const AuthContext = createContext()

// Lightweight Supabase Auth client
const sbAuth = {
  async getSession() {
    const token = localStorage.getItem('sb_access_token')
    if (!token) return null
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { localStorage.removeItem('sb_access_token'); return null }
    return { user: await res.json(), token }
  },

  async signUp(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || data.error_description || 'Sign up failed')
    if (data.access_token) localStorage.setItem('sb_access_token', data.access_token)
    return data
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || data.error_description || 'Sign in failed')
    localStorage.setItem('sb_access_token', data.access_token)
    return data
  },

  async signInWithGoogle() {
    const redirectTo = window.location.origin + window.location.pathname
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`
  },

  async signOut() {
    const token = localStorage.getItem('sb_access_token')
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    localStorage.removeItem('sb_access_token')
  },
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Handle OAuth redirect (token in URL hash)
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace(/^#\/?/, ''))
      const t = params.get('access_token')
      if (t) {
        localStorage.setItem('sb_access_token', t)
        // Clean URL
        window.location.hash = '#/'
      }
    }
  }, [])

  useEffect(() => {
    sbAuth.getSession().then(session => {
      if (session) { setUser(session.user); setToken(session.token) }
      setLoading(false)
    })
  }, [])

  const signUp = async (email, password) => {
    const data = await sbAuth.signUp(email, password)
    if (data.user) { setUser(data.user); setToken(data.access_token) }
    return data
  }

  const signIn = async (email, password) => {
    const data = await sbAuth.signIn(email, password)
    setUser(data.user); setToken(data.access_token)
    return data
  }

  const signOut = async () => {
    await sbAuth.signOut()
    setUser(null); setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut, signInWithGoogle: sbAuth.signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
