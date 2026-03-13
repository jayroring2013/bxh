import React, { useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { AppHeader } from '../components/Shared.jsx'
import { useToast } from '../context/ToastContext.jsx'
// ── Inline SVG icon system (no lucide-react dependency) ────────
const ICONS = {
  LayoutDashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  BookOpen:    <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  Tv2:         <><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></>,
  BookMarked:  <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><polyline points="10 2 10 10 13 7 16 10 16 2"/></>,
  Vote:        <><path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7z"/><path d="M22 19H2"/></>,
  Users:       <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  Star:        <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  Megaphone:   <><path d="m3 11 19-9-9 19-2-8-8-2z"/></>,
  Settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  ChevronRight:<><polyline points="9 18 15 12 9 6"/></>,
  Plus:        <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  Pencil:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  Trash2:      <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
  X:           <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  Check:       <><polyline points="20 6 9 17 4 12"/></>,
  RefreshCw:   <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
  Search:      <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  ExternalLink:<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  Eye:         <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  EyeOff:      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  AlertTriangle:<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  Shield:      <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  Layers:      <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  Link2:       <><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  History:     <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></>,
  Clock:       <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  Filter:      <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  ChevronDown: <><polyline points="6 9 12 15 18 9"/></>,
}

function Icon({ name, size = 16, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {ICONS[name]}
    </svg>
  )
}

// Shim component references so the rest of the code works unchanged
const LayoutDashboard = (p) => <Icon name="LayoutDashboard" {...p} />
const BookOpen        = (p) => <Icon name="BookOpen"        {...p} />
const Tv2             = (p) => <Icon name="Tv2"             {...p} />
const BookMarked      = (p) => <Icon name="BookMarked"      {...p} />
const Vote            = (p) => <Icon name="Vote"            {...p} />
const Users           = (p) => <Icon name="Users"           {...p} />
const Star            = (p) => <Icon name="Star"            {...p} />
const Megaphone       = (p) => <Icon name="Megaphone"       {...p} />
const Settings        = (p) => <Icon name="Settings"        {...p} />
const ChevronRight    = (p) => <Icon name="ChevronRight"    {...p} />
const Plus            = (p) => <Icon name="Plus"            {...p} />
const Pencil          = (p) => <Icon name="Pencil"          {...p} />
const Trash2          = (p) => <Icon name="Trash2"          {...p} />
const X               = (p) => <Icon name="X"               {...p} />
const Check           = (p) => <Icon name="Check"           {...p} />
const RefreshCw       = (p) => <Icon name="RefreshCw"       {...p} />
const Search          = (p) => <Icon name="Search"          {...p} />
const ExternalLink    = (p) => <Icon name="ExternalLink"    {...p} />
const Eye             = (p) => <Icon name="Eye"             {...p} />
const EyeOff          = (p) => <Icon name="EyeOff"          {...p} />
const AlertTriangle   = (p) => <Icon name="AlertTriangle"   {...p} />
const Shield          = (p) => <Icon name="Shield"          {...p} />
const Layers          = (p) => <Icon name="Layers"          {...p} />
const Link2           = (p) => <Icon name="Link2"           {...p} />
const History         = (p) => <Icon name="History"         {...p} />
const Clock           = (p) => <Icon name="Clock"           {...p} />
const Filter          = (p) => <Icon name="Filter"          {...p} />
const ChevronDown     = (p) => <Icon name="ChevronDown"     {...p} />

// ── Colors ────────────────────────────────────────────────────
const PURPLE = '#8B5CF6'
const CYAN   = '#06B6D4'
const ROSE   = '#F43F5E'
const GOLD   = '#F59E0B'
const GREEN  = '#4ADE80'
const SLATE  = '#94A3B8'

// ── Theme-aware styles hook ─────────────────────────────────
function useAdminStyles() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  
  return {
    isLight,
    bg: isLight ? '#F1F5F9' : '#080D1A',
    bgSurface: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
    bgSurface2: isLight ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.02)',
    border: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)',
    borderLight: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    textBright: isLight ? '#0F172A' : '#f1f5f9',
    textPrimary: isLight ? '#1E293B' : '#e2e8f0',
    textSecondary: isLight ? '#64748B' : '#94A3B8',
    textMuted: isLight ? '#94A3B8' : '#64748B',
    textGhost: isLight ? '#94A3B8' : '#374151',
    inputBg: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
    inputBorder: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)',
    sidebarBg: isLight ? 'rgba(241,245,249,0.98)' : 'rgba(15,23,42,0.95)',
    headerBg: isLight ? 'rgba(241,245,249,0.98)' : 'rgba(15,23,42,0.98)',
  }
}

// ── API helper ────────────────────────────────────────────────
const api = async (token, path, method = 'GET', body = null) => {
  const headers = {
    apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  if (method === 'POST') headers.Prefer = 'return=representation'
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204 || method === 'DELETE') return null
  const text = await res.text()
  if (!res.ok) throw new Error(text || `${res.status}`)
  return text ? JSON.parse(text) : null
}

// ── Shared input/button styles (theme-aware, will be created per-component) ─────────────────────────────────
// These will be defined inside each component that uses them
const btn = (color = PURPLE, outline = false) => ({
  background: outline ? 'transparent' : `${color}20`,
  border: `1px solid ${color}${outline ? '60' : '40'}`,
  color, borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
  fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 700,
  transition: 'all 0.15s', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 6,
})

// ─────────────────────────────────────────────────────────────
// Sidebar nav config
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',      icon: LayoutDashboard, label: 'Overview',     color: PURPLE },
  { id: 'series',        icon: Layers,          label: 'Content',      color: CYAN,
    sub: [
      { id: 'series_anime', icon: Tv2,       label: 'Anime',   color: CYAN   },
      { id: 'series_manga', icon: BookMarked,label: 'Manga',   color: ROSE   },
      { id: 'series_novel', icon: BookOpen,  label: 'Novels',  color: PURPLE },
    ]
  },
  { id: 'links',         icon: Link2,           label: 'Links',        color: GOLD   },
  { id: 'featured',      icon: Star,            label: 'Featured',     color: GOLD   },
  { id: 'announcements', icon: Megaphone,       label: 'Announcements',color: CYAN   },
  { id: 'votes',         icon: Vote,            label: 'Voting',       color: PURPLE },
  { id: 'users',         icon: Users,           label: 'Users',        color: GREEN  },
  { id: 'history',       icon: History,         label: 'History',      color: SLATE  },
  { id: 'settings',      icon: Settings,        label: 'Settings',     color: SLATE  },
]

// ─────────────────────────────────────────────────────────────
// Card + Section primitives
// ─────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  const s = useAdminStyles()
  return (
    <div style={{
      background: s.bgSurface, borderRadius: 14,
      border: `1px solid ${s.border}`,
      ...style,
    }}>{children}</div>
  )
}

function SectionHeader({ title, icon: Icon, color = SLATE, action }) {
  const s = useAdminStyles()
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 18px', borderBottom: `1px solid ${s.borderLight}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={15} color={color} />}
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: 1,
          color: s.textSecondary, textTransform: 'uppercase',
        }}>{title}</span>
      </div>
      {action}
    </div>
  )
}

function Section({ title, icon, color, children, action, style = {} }) {
  return (
    <Card style={{ marginBottom: 18, ...style }}>
      <SectionHeader title={title} icon={icon} color={color} action={action} />
      <div style={{ padding: 18 }}>{children}</div>
    </Card>
  )
}

// Stat chip for overview
function StatChip({ label, value, icon: Icon, color }) {
  const s = useAdminStyles()
  return (
    <div style={{
      background: `${color}0d`, border: `1px solid ${color}25`,
      borderRadius: 12, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</div>
        <div style={{ fontSize: 11, color: s.textMuted, fontWeight: 600, letterSpacing: 0.5 }}>{label}</div>
      </div>
    </div>
  )
}

// Tag input
function TagInput({ value = [], onChange, placeholder }) {
  const s = useAdminStyles()
  const [input, setInput] = useState('')
  const tags = Array.isArray(value) ? value : []
  const add = () => {
    const v = input.trim()
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput('') }
  }
  const inpStyle = { ...inp, background: s.inputBg, border: `1px solid ${s.inputBorder}`, color: s.textBright, flex: 1 }
  const btnStyle = { ...btn(PURPLE), background: outline ? 'transparent' : `${PURPLE}20`, border: `${PURPLE}${outline ? '60' : '40'}`, color: PURPLE, padding: '8px 14px', cursor: 'pointer', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {tags.map(t => (
          <span key={t} style={{
            background: s.bgSurface2, borderRadius: 20,
            padding: '2px 10px', fontSize: 11, color: s.textSecondary,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))}
              style={{ background: 'none', border: 'none', color: s.textMuted, cursor: 'pointer', fontSize: 12, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder || 'Add tag…'} style={inpStyle} />
        <button style={btnStyle} onClick={add}><Plus size={13} /></button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────────────────────
function OverviewTab({ token }) {
  const s = useAdminStyles()
  const [counts, setCounts] = useState({ anime: 0, manga: 0, novels: 0, votes: 0, featured: 0, announcements: 0 })
  const [userStats, setUserStats] = useState({ total: 0, active: 0, newSignups: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const countTable = async (table, extra = '') => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${extra}&limit=1`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, Prefer: 'count=exact' },
      })
      return parseInt(res.headers.get('content-range')?.split('/')?.[1] || 0)
    }
    Promise.all([
      countTable('series', 'item_type=eq.anime'),
      countTable('series', 'item_type=eq.manga'),
      countTable('series', 'item_type=eq.novel'),
      countTable('novel_votes'),
      countTable('featured_items', 'active=eq.true'),
      countTable('site_announcements', 'active=eq.true'),
    ]).then(([anime, manga, novels, votes, featured, announcements]) => {
      setCounts({ anime, manga, novels, votes, featured, announcements })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const [currentRes, historyRes] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_stats`, {
            headers: { 
              apikey: SUPABASE_ANON, 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }),
          fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_history`, {
            headers: { 
              apikey: SUPABASE_ANON, 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          })
        ])
        
        console.log('get_user_stats response:', currentRes.status, currentRes.ok)
        if (currentRes.ok) {
          const data = await currentRes.json()
          console.log('get_user_stats data:', data)
          if (data && Array.isArray(data) && data.length > 0) {
            setUserStats({
              total: data[0].total_users || 0,
              active: data[0].active_users || 0,
              newSignups: data[0].new_signups || 0
            })
          } else if (data && data.total_users !== undefined) {
            setUserStats({
              total: data.total_users || 0,
              active: data.active_users || 0,
              newSignups: data.new_signups || 0
            })
          }
        } else {
          const err = await currentRes.text()
          console.log('get_user_stats error:', err)
        }
        
        if (historyRes.ok) {
          const historyData = await historyRes.json()
          console.log('get_user_history data:', historyData)
          if (Array.isArray(historyData)) {
            // Reverse so oldest (day 29) is on left, newest (day 0) is on right
            setUserHistory([...historyData].reverse())
          }
        }
      } catch (e) {
        console.error('Failed to fetch user stats:', e)
      }
    }
    if (token) fetchUserStats()
  }, [token])

  const [userHistory, setUserHistory] = useState([])
  const maxUserVal = Math.max(userStats.total, userStats.active, userStats.newSignups, 1)
  const maxHistoryVal = Math.max(...userHistory.map(d => Math.max(d.signups || 0, d.cumulative_total || 0)), 1)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: s.textBright, margin: '0 0 4px' }}>
          Dashboard Overview
        </h2>
        <p style={{ color: s.textMuted, fontSize: 13, margin: 0 }}>
          Summary of your LiDex database content.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatChip label="Anime"         value={loading ? '…' : counts.anime}         icon={Tv2}           color={CYAN}   />
        <StatChip label="Manga"         value={loading ? '…' : counts.manga}         icon={BookMarked}    color={ROSE}   />
        <StatChip label="Novels"        value={loading ? '…' : counts.novels}        icon={BookOpen}      color={PURPLE} />
        <StatChip label="Vote Entries"  value={loading ? '…' : counts.votes}         icon={Vote}          color={GOLD}   />
        <StatChip label="Live Features" value={loading ? '…' : counts.featured}      icon={Star}          color={GOLD}   />
        <StatChip label="Announcements" value={loading ? '…' : counts.announcements} icon={Megaphone}     color={GREEN}  />
      </div>

      <Card style={{ marginBottom: 18 }}>
        <SectionHeader title="User Statistics" icon={Users} color={GREEN} />
        <div style={{ padding: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
            {[
              { label: 'Total Users', value: userStats.total, color: PURPLE },
              { label: 'Active (2h)', value: userStats.active, color: GREEN },
              { label: 'New (1 day)', value: userStats.newSignups, color: CYAN },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, fontFamily: "'Barlow Condensed', sans-serif" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: s.textMuted, fontWeight: 600, letterSpacing: 0.5 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          
          {userHistory.length > 0 ? (
            <div>
              <div style={{ fontSize: 11, color: s.textMuted, marginBottom: 12, fontWeight: 600 }}>LAST 30 DAYS</div>
              <div style={{ position: 'relative', height: 140, marginBottom: 8, marginLeft: 35 }}>
                {/* Y-axis labels */}
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 8 }}>
                  <span style={{ fontSize: 9, color: s.textMuted }}>{maxHistoryVal}</span>
                  <span style={{ fontSize: 9, color: s.textMuted }}>{Math.round(maxHistoryVal / 2)}</span>
                  <span style={{ fontSize: 9, color: s.textMuted }}>0</span>
                </div>
                <svg width="100%" height="140" viewBox="0 0 560 140" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="560" y2="10" stroke={s.isLight ? '#000' : '#fff'} strokeOpacity="0.05" />
                  <line x1="0" y1="75" x2="560" y2="75" stroke={s.isLight ? '#000' : '#fff'} strokeOpacity="0.05" />
                  <line x1="0" y1="140" x2="560" y2="140" stroke={s.isLight ? '#000' : '#fff'} strokeOpacity="0.05" />
                  {userHistory.map((d, i) => {
                    const x = (i / Math.max(userHistory.length - 1, 1)) * 560
                    const signupsY = 140 - ((d.signups || 0) / Math.max(maxHistoryVal, 1)) * 130 - 5
                    const totalY = 140 - ((d.cumulative_total || 0) / Math.max(maxHistoryVal, 1)) * 130 - 5
                    return (
                      <g key={i}>
                        <circle cx={x} cy={signupsY} r="3" fill={CYAN} />
                        <circle cx={x} cy={totalY} r="3" fill={PURPLE} />
                        {i < userHistory.length - 1 && (
                          <>
                            <line 
                              x1={x} y1={signupsY} 
                              x2={(userHistory[i+1].day_index / Math.max(userHistory.length - 1, 1)) * 560} 
                              y2={140 - ((userHistory[i+1].signups || 0) / Math.max(maxHistoryVal, 1)) * 130 - 5} 
                              stroke={CYAN} strokeWidth="2" 
                            />
                            <line 
                              x1={x} y1={totalY} 
                              x2={(userHistory[i+1].day_index / Math.max(userHistory.length - 1, 1)) * 560} 
                              y2={140 - ((userHistory[i+1].cumulative_total || 0) / Math.max(maxHistoryVal, 1)) * 130 - 5} 
                              stroke={PURPLE} strokeWidth="2" 
                            />
                          </>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
              {/* X-axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: 35, paddingRight: 10 }}>
                <span style={{ fontSize: 9, color: s.textMuted }}>
                  {new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: 9, color: s.textMuted }}>
                  {new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span style={{ fontSize: 9, color: s.textMuted }}>
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: CYAN }} />
                  <span style={{ fontSize: 10, color: s.textMuted }}>New Signups</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PURPLE }} />
                  <span style={{ fontSize: 10, color: s.textMuted }}>Total Users</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: s.textMuted, fontSize: 12 }}>
              {userStats.total === 0 ? 'No user data available yet' : 'Loading chart data...'}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Quick Navigation" icon={ChevronRight} />
        <div style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Manage Anime',         hash: 'series_anime', color: CYAN   },
            { label: 'Manage Manga',         hash: 'series_manga', color: ROSE   },
            { label: 'Manage Novels',        hash: 'series_novel', color: PURPLE },
            { label: 'Edit Links',           hash: 'links',        color: GOLD   },
            { label: 'Featured Items',       hash: 'featured',     color: GOLD   },
            { label: 'Announcements',        hash: 'announcements',color: CYAN   },
            { label: 'Vote Manager',         hash: 'votes',        color: PURPLE },
            { label: 'User Management',      hash: 'users',        color: GREEN  },
          ].map(item => {
            const btnStyle = {
              background: 'transparent', border: `1px solid ${item.color}60`,
              color: item.color, borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
              fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 700,
              transition: 'all 0.15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
              textDecoration: 'none',
            }
            return <a key={item.hash} href={`#admin-${item.hash}`} style={btnStyle}>{item.label}</a>
          })}
        </div>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Series search picker (unified series table)
// ─────────────────────────────────────────────────────────────
async function searchSeries(token, type, q) {
  const get = async (url) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${url}`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }
    })
    const text = await r.text()
    try { return JSON.parse(text) } catch { return [] }
  }
  const enc = encodeURIComponent(q)
  const rows = await get(`series?item_type=eq.${type}&or=(title.ilike.%25${enc}%25)&select=id,title,cover_url,item_type&limit=10`)
  return (rows || []).map(r => ({ id: String(r.id), title: r.title, cover: r.cover_url, type: r.item_type }))
}

function SeriesPicker({ token, onPick, defaultType }) {
  const s = useAdminStyles()
  const [query,   setQuery]   = useState('')
  const [type,    setType]    = useState(defaultType || 'novel')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const TYPE_COLOR = { novel: PURPLE, anime: CYAN, manga: ROSE }
  const inpStyle = { background: s.inputBg, border: `1px solid ${s.inputBorder}`, color: s.textBright, borderRadius: 8, padding: '9px 12px', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s' }

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      const data = await searchSeries(token, type, query.trim())
      if (!cancelled) { setResults(data); setLoading(false) }
    }, 300)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query, type, token])

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['novel','anime','manga'].map(t => (
          <button key={t} onClick={() => { setType(t); setResults([]) }} style={{
            background: type !== t ? 'transparent' : `${TYPE_COLOR[t]}20`,
            border: `1px solid ${TYPE_COLOR[t]}${type !== t ? '60' : '40'}`,
            color: TYPE_COLOR[t], borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 11, fontWeight: 700,
            transition: 'all 0.15s', textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <Search size={14} color={s.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${type} by title…`}
          style={{ ...inpStyle, paddingLeft: 32 }} autoFocus />
      </div>
      {loading && <div style={{ color: s.textMuted, fontSize: 12, padding: '8px 0' }}>Searching…</div>}
      {results.length > 0 && (
        <div style={{ marginTop: 8, border: `1px solid ${s.border}`, borderRadius: 10, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
          {results.map(r => (
            <div key={r.id} onClick={() => onPick(r)} style={{
              display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px',
              cursor: 'pointer', borderBottom: `1px solid ${s.borderLight}`,
              background: s.bgSurface2, transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = s.bgSurface}
              onMouseLeave={e => e.currentTarget.style.background = s.bgSurface2}>
              {r.cover && <img src={r.cover} style={{ width: 28, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: s.textBright, fontFamily: "'Barlow Condensed', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                <div style={{ fontSize: 10, color: s.textMuted }}>ID: {r.id}</div>
              </div>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700, background: `${TYPE_COLOR[r.type]}20`, color: TYPE_COLOR[r.type], textTransform: 'uppercase' }}>{r.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Series Manager — unified series table, item_type aware
// ─────────────────────────────────────────────────────────────

// Status values matching actual DB + constants.js
const ANIME_STATUSES  = ['FINISHED','RELEASING','NOT_YET_RELEASED','CANCELLED']
const MANGA_STATUSES  = ['ongoing','completed','hiatus','cancelled']
const NOVEL_STATUSES  = ['ongoing','completed','hiatus','cancelled']  // matches constants.js
const ANIME_FORMATS   = ['TV','TV_SHORT','MOVIE','SPECIAL','OVA','ONA','MUSIC','ONE_SHOT']
const ANIME_SEASONS   = ['WINTER','SPRING','SUMMER','FALL']
const MANGA_DEMOGRAPHICS = ['shounen','shoujo','seinen','josei']

const TYPE_COLOR = { novel: PURPLE, anime: CYAN, manga: ROSE }

function SeriesTab({ token, toast, type }) {
  const s = useAdminStyles()
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({})
  const [delConfirm, setDelConfirm] = useState(null)

  const color = TYPE_COLOR[type]
  const F = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inpStyle = { background: s.inputBg, border: `1px solid ${s.inputBorder}`, color: s.textBright, borderRadius: 8, padding: '9px 12px', fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s' }
  const btnStyle = (c, outline) => ({
    background: outline ? 'transparent' : `${c}20`,
    border: `1px solid ${c}${outline ? '60' : '40'}`,
    color: c, borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
    fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 700,
    transition: 'all 0.15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
  })

  const load = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const enc = encodeURIComponent(q)
      const filter = q ? `&title=ilike.%25${enc}%25` : ''
      // For anime/manga also join meta tables for extra fields
      const select = type === 'anime' ? '*,anime_meta(*)' : type === 'manga' ? '*,manga_meta(*)' : '*'
      const url = `series?item_type=eq.${type}${filter}&order=score.desc.nullslast,title.asc&limit=40&select=${select}`
      const data = await api(token, url)
      setItems(Array.isArray(data) ? data : [])
    } catch(e) { toast(`Load failed: ${e.message}`, false) }
    finally { setLoading(false) }
  }, [token, type])

  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search, load])

  const openNew = () => {
    if (type === 'anime') {
      setForm({ title: '', title_native: '', cover_url: '', banner_url: '', description: '',
        genres: [], status: 'FINISHED', score: '', external_id: '',
        anime_meta: { format: 'TV', episodes: '', duration: '', season: '', season_year: '', studio: '', site_url: '' } })
    } else if (type === 'manga') {
      setForm({ title: '', title_native: '', cover_url: '', description: '',
        genres: [], status: 'ongoing', score: '', external_id: '',
        manga_meta: { author: '', year: '', chapters: '', volumes: '', demographic: '', last_chapter: '' } })
    } else {
      setForm({ title: '', title_native: '', cover_url: '', description: '',
        genres: [], status: 'ongoing', score: '', publisher: '', author: '', external_id: '' })
    }
    setEditing('new')
  }

  const openEdit = (row) => {
    setForm({
      ...row,
      genres: row.genres || [],
      anime_meta: row.anime_meta?.[0] || row.anime_meta || {},
      manga_meta: row.manga_meta?.[0] || row.manga_meta || {},
    })
    setEditing(row)
  }

  const save = async () => {
    try {
      // Only send columns that actually exist in the series table
      const SERIES_COLS = ['title', 'title_vi', 'title_native', 'cover_url', 'banner_url',
        'description', 'description_vi', 'status', 'genres', 'tags', 'score',
        'publisher', 'author', 'studio', 'source', 'is_featured', 'external_id', 'item_type']
      const clean = {}
      SERIES_COLS.forEach(k => { if (form[k] !== undefined) clean[k] = form[k] })
      clean.item_type = type

      // Cast numeric fields
      const numFields = ['score', 'external_id']
      numFields.forEach(k => {
        if (clean[k] === '' || clean[k] == null) clean[k] = null
        else if (!isNaN(+clean[k])) clean[k] = +clean[k]
      })

      if (editing === 'new') {
        const rows = await fetch(`${SUPABASE_URL}/rest/v1/series`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(clean),
        }).then(async r => { if (!r.ok) throw new Error(await r.text()); return r.json() })

        // Upsert meta table if applicable
        const newId = rows?.[0]?.id
        if (newId) await saveMeta(newId, form)
        toast(`${type} added ✓`)
      } else {
        await api(token, `series?id=eq.${editing.id}`, 'PATCH', clean)
        await saveMeta(editing.id, form)
        toast('Updated ✓')
      }
      setEditing(null); load(search)
    } catch(e) { toast(`Save failed: ${e.message}`, false) }
  }

  const saveMeta = async (seriesId, f) => {
    if (type === 'anime' && f.anime_meta) {
      const m = { ...f.anime_meta }
      const numMeta = ['episodes', 'duration', 'season_year']
      numMeta.forEach(k => { if (m[k] === '' || m[k] == null) m[k] = null; else if (!isNaN(+m[k])) m[k] = +m[k] })
      await fetch(`${SUPABASE_URL}/rest/v1/anime_meta`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ ...m, series_id: seriesId }),
      })
    }
    if (type === 'manga' && f.manga_meta) {
      const m = { ...f.manga_meta }
      const numMeta = ['year', 'chapters', 'volumes']
      numMeta.forEach(k => { if (m[k] === '' || m[k] == null) m[k] = null; else if (!isNaN(+m[k])) m[k] = +m[k] })
      await fetch(`${SUPABASE_URL}/rest/v1/manga_meta`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ ...m, series_id: seriesId }),
      })
    }
  }

  const del = async (row) => {
    try {
      await api(token, `series?id=eq.${row.id}`, 'DELETE')
      toast('Deleted'); setDelConfirm(null); load(search)
    } catch(e) { toast(e.message, false) }
  }

  const meta = (row) => type === 'anime' ? (row.anime_meta?.[0] || row.anime_meta || {}) : (row.manga_meta?.[0] || row.manga_meta || {})

  return (
    <div>
      <Section
        title={`${type.charAt(0).toUpperCase() + type.slice(1)} Manager`}
        icon={type === 'anime' ? Tv2 : type === 'manga' ? BookMarked : BookOpen}
        color={color}
        action={
          <button style={{ ...btnStyle(GREEN), padding: '7px 12px' }} onClick={openNew}>
            <Plus size={13} /> Add {type}
          </button>
        }
      >
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={14} color={s.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${type} by title…`}
            style={{ ...inpStyle, paddingLeft: 32 }} />
        </div>

        {loading ? (
          <div style={{ color: s.textMuted, textAlign: 'center', padding: 32 }}>
            <RefreshCw size={16} style={{ display: 'inline', marginRight: 8, animation: 'spin 1s linear infinite' }} />Loading…
          </div>
        ) : items.length === 0 ? (
          <div style={{ color: s.textGhost, textAlign: 'center', padding: 32 }}>No results.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(row => (
              <div key={row.id} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                background: s.bgSurface2, borderRadius: 10,
                border: `1px solid ${s.border}`, padding: '8px 12px',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = `${color}30`}
                onMouseLeave={e => e.currentTarget.style.borderColor = s.border}
              >
                {row.cover_url && (
                  <img src={row.cover_url} style={{ width: 28, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: s.textBright, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.title || '(no title)'}
                  </div>
                  <div style={{ fontSize: 10, color: s.textGhost, display: 'flex', gap: 8 }}>
                    <span>ID: {row.id}</span>
                    {row.status && <span style={{ color: s.textMuted }}>{row.status}</span>}
                    {type === 'anime' && meta(row).episodes && <span style={{ color: s.textMuted }}>{meta(row).episodes} eps</span>}
                    {type === 'manga' && meta(row).chapters  && <span style={{ color: s.textMuted }}>{meta(row).chapters} ch</span>}
                    {type === 'novel' && row.external_id     && <span style={{ color: s.textMuted }}>Ext: {row.external_id}</span>}
                  </div>
                </div>
                <button style={{ ...btnStyle(CYAN, true), padding: '6px 10px' }} onClick={() => openEdit(row)}>
                  <Pencil size={12} />
                </button>
                <button style={{ ...btnStyle(ROSE, true), padding: '6px 10px' }} onClick={() => setDelConfirm(row)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Delete confirm */}
      {delConfirm && (
        <Modal onClose={() => setDelConfirm(null)} maxWidth={380}>
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <AlertTriangle size={40} color={ROSE} style={{ marginBottom: 12 }} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, color: s.textBright, marginBottom: 8 }}>Delete Series?</div>
            <div style={{ fontSize: 13, color: s.textMuted, marginBottom: 20 }}>
              "{delConfirm.title}" will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button style={btnStyle(s.textGhost, true)} onClick={() => setDelConfirm(null)}>Cancel</button>
              <button style={{ ...btnStyle(ROSE), padding: '8px 20px' }} onClick={() => del(delConfirm)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit / New modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} maxWidth={640}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: s.textBright }}>
              {editing === 'new' ? `Add ${type}` : `Edit: ${form.title || '…'}`}
            </div>
            <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: s.textMuted, cursor: 'pointer', display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          {/* Common fields for all types */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[
              { k: 'title',        label: 'Title *',           req: true },
              { k: 'title_native', label: 'Native / Alt Title'           },
              { k: 'external_id',  label: type === 'anime' ? 'AniList ID' : type === 'manga' ? 'MangaDex UUID' : 'RanobeDB ID' },
              { k: 'score',        label: 'Score (0–10)'                 },
            ].map(f => (
              <div key={f.k}>
                <label style={{ fontSize: 10, color: f.req ? GREEN : s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>{f.label}</label>
                <input value={form[f.k] || ''} onChange={e => F(f.k, e.target.value)} style={inpStyle} />
              </div>
            ))}
          </div>

          {/* Status */}
          <div style={{ display: 'grid', gridTemplateColumns: type === 'anime' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>Status</label>
              <select value={form.status || ''} onChange={e => F('status', e.target.value)} style={inpStyle}>
                {(type === 'anime' ? ANIME_STATUSES : type === 'manga' ? MANGA_STATUSES : NOVEL_STATUSES)
                  .map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {type === 'anime' && (
              <>
                <div>
                  <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>Format</label>
                  <select value={form.anime_meta?.format || ''} onChange={e => F('anime_meta', { ...form.anime_meta, format: e.target.value })} style={inpStyle}>
                    {ANIME_FORMATS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>Season</label>
                  <select value={form.anime_meta?.season || ''} onChange={e => F('anime_meta', { ...form.anime_meta, season: e.target.value })} style={inpStyle}>
                    <option value="">—</option>
                    {ANIME_SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}
            {type === 'manga' && (
              <div>
                <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>Demographic</label>
                <select value={form.manga_meta?.demographic || ''} onChange={e => F('manga_meta', { ...form.manga_meta, demographic: e.target.value })} style={inpStyle}>
                  <option value="">—</option>
                  {MANGA_DEMOGRAPHICS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Type-specific meta fields */}
          {type === 'anime' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {[
                { k: 'episodes',    label: 'Episodes'         },
                { k: 'duration',    label: 'Ep Duration (min)'},
                { k: 'season_year', label: 'Year'             },
                { k: 'studio',      label: 'Studio'           },
                { k: 'site_url',    label: 'AniList URL'      },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>{f.label}</label>
                  <input value={form.anime_meta?.[f.k] || ''} onChange={e => F('anime_meta', { ...form.anime_meta, [f.k]: e.target.value })} style={inpStyle} />
                </div>
              ))}
            </div>
          )}

          {type === 'manga' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {[
                { k: 'author',       label: 'Author'         },
                { k: 'year',         label: 'Year'           },
                { k: 'chapters',     label: 'Chapters'       },
                { k: 'volumes',      label: 'Volumes'        },
                { k: 'last_chapter', label: 'Latest Chapter' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>{f.label}</label>
                  <input value={form.manga_meta?.[f.k] || ''} onChange={e => F('manga_meta', { ...form.manga_meta, [f.k]: e.target.value })} style={inpStyle} />
                </div>
              ))}
            </div>
          )}

          {type === 'novel' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {[
                { k: 'publisher', label: 'Publisher' },
                { k: 'author',    label: 'Author'    },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>{f.label}</label>
                  <input value={form[f.k] || ''} onChange={e => F(f.k, e.target.value)} style={inpStyle} />
                </div>
              ))}
            </div>
          )}

          {/* Cover URL */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>Cover URL</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={form.cover_url || ''} onChange={e => F('cover_url', e.target.value)} placeholder="https://…" style={{ ...inpStyle, flex: 1 }} />
              {form.cover_url && (
                <img src={form.cover_url} style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 3 }}>Description</label>
            <textarea value={form.description || ''} onChange={e => F('description', e.target.value)} rows={3} style={{ ...inpStyle, resize: 'vertical' }} />
          </div>

          {/* Genres */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: s.textMuted, fontWeight: 700, display: 'block', marginBottom: 6 }}>Genres</label>
            <TagInput value={form.genres} onChange={v => F('genres', v)} placeholder="e.g. Action" />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={btnStyle(s.textMuted, true)} onClick={() => setEditing(null)}>Cancel</button>
            <button style={{ ...btnStyle(GREEN), padding: '8px 20px' }} onClick={save}>
              <Check size={13} /> {editing === 'new' ? `Add ${type}` : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Modal wrapper
// ─────────────────────────────────────────────────────────────
function Modal({ children, onClose, maxWidth = 560 }) {
  const s = useAdminStyles()
  return (
    <div style={{ position: 'fixed', inset: 0, background: s.isLight ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.85)', zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: s.isLight ? '#fff' : '#0F172A', borderRadius: 16, padding: 24,
        width: '100%', maxWidth, maxHeight: '92vh', overflowY: 'auto',
        border: `1px solid ${s.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Links Tab
// ─────────────────────────────────────────────────────────────
const LINK_FIELDS = [
  { key: 'shop',     label: 'Shop',     color: GOLD       },
  { key: 'youtube',  label: 'YouTube',  color: ROSE       },
  { key: 'official', label: 'Official', color: CYAN       },
  { key: 'raw',      label: 'Raw',      color: SLATE      },
  { key: 'anilist',  label: 'AniList',  color: '#02a9ff'  },
  { key: 'mangadex', label: 'MangaDex', color: ROSE       },
]

function LinksTab({ token, toast }) {
  const [links,     setLinks]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState({})
  const [listSearch,setListSearch]= useState('')
  const [showPicker,setShowPicker]= useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { const data = await api(token, 'item_links?order=updated_at.desc&limit=200'); setLinks(Array.isArray(data) ? data : []) }
    catch(e) { toast(e.message, false) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  const pickSeries = (series) => {
    setShowPicker(false)
    setForm({ item_id: series.id, item_type: series.type, title: series.title, cover_url: series.cover || '',
      shop: '', youtube: '', official: '', raw: '', anilist: '', mangadex: '' })
    setEditing('new')
  }

  const save = async () => {
    try {
      const COLS = ['item_id','item_type','title','shop','youtube','official','raw','anilist','mangadex']
      const clean = Object.fromEntries(COLS.map(k => [k, form[k] === '' ? null : (form[k] || null)]))
      if (editing === 'new') {
        await fetch(`${SUPABASE_URL}/rest/v1/item_links`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(clean),
        }).then(async r => { if (!r.ok) throw new Error(await r.text()) })
        toast('Links saved ✓')
      } else {
        await api(token, `item_links?id=eq.${editing.id}`, 'PATCH', clean)
        toast('Links updated ✓')
      }
      setEditing(null); load()
    } catch(e) { toast(`Save failed: ${e.message}`, false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this link entry?')) return
    await api(token, `item_links?id=eq.${id}`, 'DELETE')
    toast('Deleted'); load()
  }

  const filtered = links.filter(l =>
    !listSearch || l.title?.toLowerCase().includes(listSearch.toLowerCase()) || l.item_id?.includes(listSearch)
  )

  return (
    <div>
      <Section title="Series Link Manager" icon={Link2} color={GOLD}
        action={<button style={{ ...btn(GREEN), padding: '7px 12px' }} onClick={() => setShowPicker(true)}><Plus size={13} /> Add Links</button>}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={14} color="#475569" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Filter by title or ID…" style={{ ...inp, paddingLeft: 32 }} />
        </div>
        {loading ? <div style={{ color: '#475569', textAlign: 'center', padding: 32 }}>Loading…</div>
        : filtered.length === 0 ? <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>{listSearch ? 'No matches.' : 'No entries yet.'}</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(row => (
              <div key={row.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px' }}>
                {row.cover_url && <img src={row.cover_url} style={{ width: 28, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: `${TYPE_COLOR[row.item_type]||PURPLE}20`, color: TYPE_COLOR[row.item_type]||PURPLE, fontWeight: 700, textTransform: 'uppercase' }}>{row.item_type}</span>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>ID: {row.item_id}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title || '(no title)'}</div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                    {LINK_FIELDS.filter(f => row[f.key]).map(f => (
                      <span key={f.key} style={{ fontSize: 9, color: f.color, background: `${f.color}15`, border: `1px solid ${f.color}30`, borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>{f.label}</span>
                    ))}
                  </div>
                </div>
                <button style={{ ...btn(CYAN, true), padding: '6px 10px' }} onClick={() => { setForm({...row}); setEditing(row) }}><Pencil size={12} /></button>
                <button style={{ ...btn(ROSE, true), padding: '6px 10px' }} onClick={() => del(row.id)}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {showPicker && (
        <Modal onClose={() => setShowPicker(false)} maxWidth={500}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Search & Select a Series</div>
          <SeriesPicker token={token} onPick={pickSeries} />
          <button style={{ ...btn('#64748B', true), marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => setShowPicker(false)}>Cancel</button>
        </Modal>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} maxWidth={560}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
              {editing === 'new' ? 'Save Links' : 'Edit Links'}
            </div>
            <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
            {form.cover_url && <img src={form.cover_url} style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{form.title}</div>
              <div style={{ fontSize: 11, color: '#475569' }}>{form.item_type} · ID: {form.item_id}</div>
            </div>
          </div>
          {LINK_FIELDS.map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: f.color, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <ExternalLink size={11} /> {f.label} URL
              </label>
              <input value={form[f.key] || ''} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder="https://…" style={inp} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button style={btn('#64748B', true)} onClick={() => setEditing(null)}>Cancel</button>
            <button style={{ ...btn(GREEN), padding: '8px 20px' }} onClick={save}><Check size={13} /> {editing === 'new' ? 'Save Links' : 'Update'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Featured Tab
// ─────────────────────────────────────────────────────────────
function FeaturedTab({ token, toast }) {
  const [items,   setItems]   = useState([])
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const [showPicker, setShowPicker] = useState(false)

  const load = useCallback(async () => {
    const data = await api(token, 'featured_items?order=sort_order.asc')
    setItems(Array.isArray(data) ? data : [])
  }, [token])
  useEffect(() => { load() }, [load])

  const pickSeries = (series) => {
    setShowPicker(false)
    setForm({ item_id: series.id, item_type: series.type, title: series.title, cover_url: series.cover || '', reason: '', sort_order: items.length, active: true })
    setEditing('new')
  }
  const save = async () => {
    try {
      if (editing === 'new') { await api(token, 'featured_items', 'POST', form); toast('Featured item added ✓') }
      else { await api(token, `featured_items?id=eq.${editing.id}`, 'PATCH', form); toast('Updated ✓') }
      setEditing(null); load()
    } catch(e) { toast(e.message, false) }
  }
  const toggle = async (row) => { await api(token, `featured_items?id=eq.${row.id}`, 'PATCH', { active: !row.active }); load() }
  const del = async (id) => { if (!confirm('Remove?')) return; await api(token, `featured_items?id=eq.${id}`, 'DELETE'); load() }

  return (
    <div>
      <Section title="Featured Series" icon={Star} color={GOLD}
        action={<button style={{ ...btn(GOLD), padding: '7px 12px' }} onClick={() => setShowPicker(true)}><Plus size={13} /> Add Featured</button>}>
        {showPicker && (
          <Modal onClose={() => setShowPicker(false)} maxWidth={500}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Search & Select</div>
            <SeriesPicker token={token} onPick={pickSeries} />
            <button style={{ ...btn('#64748B', true), marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => setShowPicker(false)}>Cancel</button>
          </Modal>
        )}
        {items.length === 0 ? <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>No featured items.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(row => (
              <div key={row.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: row.active ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px solid ${row.active ? GOLD+'30' : 'rgba(255,255,255,0.06)'}`, padding: '10px 14px', opacity: row.active ? 1 : 0.5 }}>
                {row.cover_url && <img src={row.cover_url} style={{ width: 32, height: 44, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif" }}>{row.title}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{row.item_type} · {row.reason}</div>
                </div>
                <span style={{ fontSize: 11, color: '#374151' }}>#{row.sort_order}</span>
                <button style={{ ...btn(row.active ? GOLD : GREEN, true), padding: '6px 10px' }} onClick={() => toggle(row)}>
                  {row.active ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                <button style={{ ...btn(CYAN, true), padding: '6px 10px' }} onClick={() => { setForm({...row}); setEditing(row) }}><Pencil size={12} /></button>
                <button style={{ ...btn(ROSE, true), padding: '6px 10px' }} onClick={() => del(row.id)}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {editing && (
        <Modal onClose={() => setEditing(null)} maxWidth={480}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
            {editing === 'new' ? 'Add Featured Item' : 'Edit Featured Item'}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
            {form.cover_url && <img src={form.cover_url} style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: 14, color: '#f1f5f9', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{form.title}</div>
              <div style={{ fontSize: 11, color: '#475569' }}>{form.item_type} · ID: {form.item_id}</div>
            </div>
          </div>
          {[{ key: 'reason', label: 'REASON', ph: "Editor's Pick, Trending…" }, { key: 'sort_order', label: 'SORT ORDER', ph: '0 = first' }].map(f => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input value={form[f.key] || ''} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.ph} style={inp} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <input type="checkbox" checked={form.active !== false} onChange={e => setForm(p => ({...p, active: e.target.checked}))} id="active_chk" />
            <label htmlFor="active_chk" style={{ fontSize: 13, color: '#94A3B8' }}>Active (visible to users)</label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={btn('#64748B', true)} onClick={() => setEditing(null)}>Cancel</button>
            <button style={{ ...btn(GOLD), padding: '8px 20px' }} onClick={save}><Check size={13} /> {editing === 'new' ? 'Add' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Announcements Tab
// ─────────────────────────────────────────────────────────────
function AnnouncementsTab({ token, toast }) {
  const [items,   setItems]   = useState([])
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const TYPE_COLOR = { info: CYAN, warning: GOLD, success: GREEN }

  const load = useCallback(async () => {
    const data = await api(token, 'site_announcements?order=created_at.desc')
    setItems(Array.isArray(data) ? data : [])
  }, [token])
  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      if (editing === 'new') { await api(token, 'site_announcements', 'POST', form); toast('Announcement created ✓') }
      else { await api(token, `site_announcements?id=eq.${editing.id}`, 'PATCH', form); toast('Updated ✓') }
      setEditing(null); load()
    } catch(e) { toast(e.message, false) }
  }
  const toggle = async (row) => { await api(token, `site_announcements?id=eq.${row.id}`, 'PATCH', { active: !row.active }); load() }
  const del = async (id) => { if (!confirm('Delete?')) return; await api(token, `site_announcements?id=eq.${id}`, 'DELETE'); load() }

  return (
    <div>
      <Section title="Announcements" icon={Megaphone} color={CYAN}
        action={
          <button style={{ ...btn(CYAN), padding: '7px 12px' }} onClick={() => { setForm({ message_en: '', message_vi: '', type: 'info', active: true }); setEditing('new') }}>
            <Plus size={13} /> New
          </button>
        }>
        {items.length === 0 ? <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>No announcements.</div>
        : items.map(row => {
          const c = TYPE_COLOR[row.type] || CYAN
          return (
            <div key={row.id} style={{ background: `${c}08`, border: `1px solid ${c}25`, borderRadius: 10, padding: '10px 14px', marginBottom: 8, opacity: row.active ? 1 : 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: c, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{row.type}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>{row.active ? '● LIVE' : '○ Hidden'}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{row.message_en}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{row.message_vi}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button style={{ ...btn(row.active ? GOLD : GREEN, true), padding: '6px 10px' }} onClick={() => toggle(row)}>
                    {row.active ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button style={{ ...btn(CYAN, true), padding: '6px 10px' }} onClick={() => { setForm({...row}); setEditing(row) }}><Pencil size={12} /></button>
                  <button style={{ ...btn(ROSE, true), padding: '6px 10px' }} onClick={() => del(row.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </Section>

      {editing && (
        <Modal onClose={() => setEditing(null)} maxWidth={500}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
            {editing === 'new' ? 'New Announcement' : 'Edit Announcement'}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>TYPE</label>
            <select value={form.type || 'info'} onChange={e => setForm(p => ({...p, type: e.target.value}))} style={inp}>
              <option value="info">ℹ Info</option>
              <option value="warning">⚠ Warning</option>
              <option value="success">✓ Success</option>
            </select>
          </div>
          {[
            { k: 'message_en', label: 'MESSAGE (English)',    ph: 'Enter message in English…' },
            { k: 'message_vi', label: 'MESSAGE (Vietnamese)', ph: 'Nhập nội dung bằng tiếng Việt…' },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>{f.label}</label>
              <textarea value={form[f.k] || ''} onChange={e => setForm(p => ({...p, [f.k]: e.target.value}))} placeholder={f.ph} rows={3} style={{ ...inp, resize: 'vertical' }} />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <input type="checkbox" checked={form.active !== false} onChange={e => setForm(p => ({...p, active: e.target.checked}))} id="ann_active" />
            <label htmlFor="ann_active" style={{ fontSize: 13, color: '#94A3B8' }}>Show immediately (active)</label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={btn('#64748B', true)} onClick={() => setEditing(null)}>Cancel</button>
            <button style={{ ...btn(CYAN), padding: '8px 20px' }} onClick={save}><Check size={13} /> {editing === 'new' ? 'Publish' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Votes Tab
// ─────────────────────────────────────────────────────────────
function VotesTab({ token, toast }) {
  const [votes, setVotes] = useState([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year,  setYear]  = useState(new Date().getFullYear())
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const load = useCallback(async () => {
    const data = await api(token, `novel_votes?month=eq.${month}&year=eq.${year}&order=vote_count.desc`)
    setVotes(Array.isArray(data) ? data : [])
  }, [token, month, year])
  useEffect(() => { load() }, [load])

  const resetVotes = async (id) => {
    if (!confirm('Reset vote count to 0?')) return
    await api(token, `novel_votes?id=eq.${id}`, 'PATCH', { vote_count: 0 })
    toast('Reset ✓'); load()
  }
  const deleteEntry = async (id) => {
    if (!confirm('Delete entry?')) return
    await api(token, `novel_votes?id=eq.${id}`, 'DELETE')
    toast('Deleted'); load()
  }

  return (
    <Section title="Vote Manager" icon={Vote} color={PURPLE}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={month} onChange={e => setMonth(+e.target.value)} style={{ ...inp, width: 'auto' }}>
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)} style={{ ...inp, width: 'auto' }}>
          {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          {votes.length} entries · <span style={{ color: PURPLE, fontWeight: 700 }}>{votes.reduce((s,v) => s + v.vote_count, 0)}</span> total votes
        </div>
      </div>
      {votes.length === 0 ? (
        <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>No votes this period.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {votes.map((row, i) => (
            <div key={row.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', padding: '8px 12px' }}>
              <span style={{ width: 24, color: '#374151', fontSize: 12, fontWeight: 700 }}>#{i+1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: "'Barlow Condensed', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.novel_title}</div>
                <div style={{ fontSize: 10, color: '#374151' }}>ID: {row.novel_id}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: PURPLE, fontFamily: "'Barlow Condensed', sans-serif", minWidth: 32, textAlign: 'right' }}>{row.vote_count}</div>
              <button style={{ ...btn(GOLD, true), padding: '6px 10px' }} onClick={() => resetVotes(row.id)}><RefreshCw size={12} /></button>
              <button style={{ ...btn(ROSE, true), padding: '6px 10px' }} onClick={() => deleteEntry(row.id)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────
// Users Tab
// ─────────────────────────────────────────────────────────────
function UsersTab({ token, toast, currentUserId }) {
  const [admins, setAdmins] = useState([])
  const [newUid, setNewUid] = useState('')

  const load = useCallback(async () => {
    const data = await api(token, 'admin_users?select=user_id,granted_at')
    setAdmins(Array.isArray(data) ? data : [])
  }, [token])
  useEffect(() => { load() }, [load])

  const grantAdmin = async () => {
    if (!newUid.trim()) return
    try {
      await api(token, 'admin_users', 'POST', { user_id: newUid.trim(), granted_by: currentUserId })
      toast('Admin granted ✓'); setNewUid(''); load()
    } catch(e) { toast(e.message, false) }
  }
  const revokeAdmin = async (uid) => {
    if (uid === currentUserId) { toast("Can't revoke yourself", false); return }
    if (!confirm('Revoke admin?')) return
    await api(token, `admin_users?user_id=eq.${uid}`, 'DELETE')
    toast('Admin revoked'); load()
  }

  return (
    <Section title="Admin Users" icon={Users} color={GREEN}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={newUid} onChange={e => setNewUid(e.target.value)} placeholder="User UUID to grant admin…" style={{ ...inp, flex: 1 }} />
        <button style={{ ...btn(GREEN), padding: '8px 14px' }} onClick={grantAdmin}><Shield size={13} /> Grant Admin</button>
      </div>
      <div style={{ fontSize: 11, color: '#374151', marginBottom: 14 }}>
        Find user UUIDs in Supabase Dashboard → Authentication → Users
      </div>
      {admins.map(row => (
        <div key={row.user_id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{row.user_id}</div>
            <div style={{ fontSize: 10, color: '#374151' }}>Granted: {new Date(row.granted_at).toLocaleDateString()}</div>
          </div>
          {row.user_id === currentUserId && <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>YOU</span>}
          <button style={{ ...btn(ROSE, true), padding: '6px 10px' }} onClick={() => revokeAdmin(row.user_id)}><X size={12} /></button>
        </div>
      ))}
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────
// Settings Tab (placeholder)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// History Tab — audit log viewer
// ─────────────────────────────────────────────────────────────

const TABLE_LABELS = {
  series:             'Series',
  anime_meta:         'Anime Meta',
  manga_meta:         'Manga Meta',
  item_links:         'Links',
  featured_items:     'Featured',
  site_announcements: 'Announcements',
  novel_votes:        'Votes',
}

const OP_STYLE = {
  INSERT: { color: GREEN,  bg: `rgba(74,222,128,0.12)`,  label: 'Added'   },
  UPDATE: { color: CYAN,   bg: `rgba(6,182,212,0.12)`,   label: 'Updated' },
  DELETE: { color: ROSE,   bg: `rgba(244,63,94,0.12)`,   label: 'Deleted' },
}

function DiffViewer({ diff }) {
  if (!diff || Object.keys(diff).length === 0) return null
  const keys = Object.keys(diff).filter(k =>
    !['updated_at','created_at'].includes(k)
  )
  if (keys.length === 0) return null

  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {keys.map(k => {
        const { from, to } = diff[k] || {}
        const fromStr = from === null || from === undefined ? '—'
          : typeof from === 'object' ? JSON.stringify(from) : String(from)
        const toStr = to === null || to === undefined ? '—'
          : typeof to === 'object' ? JSON.stringify(to) : String(to)
        // Truncate long values
        const trunc = (s) => s.length > 80 ? s.slice(0, 80) + '…' : s
        return (
          <div key={k} style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 1fr',
            gap: 6, fontSize: 11, padding: '4px 8px',
            background: 'rgba(255,255,255,0.03)', borderRadius: 6,
            alignItems: 'start',
          }}>
            <span style={{ color: SLATE, fontWeight: 700, fontFamily: 'monospace', fontSize: 10 }}>{k}</span>
            <span style={{ color: ROSE, background: 'rgba(244,63,94,0.08)', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {trunc(fromStr)}
            </span>
            <span style={{ color: GREEN, background: 'rgba(74,222,128,0.08)', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {trunc(toStr)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function AuditRow({ entry, expanded, onToggle }) {
  const op   = OP_STYLE[entry.operation] || OP_STYLE.UPDATE
  const time = new Date(entry.created_at)
  const timeStr = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const hasDiff = entry.diff && Object.keys(entry.diff).filter(k => !['updated_at','created_at'].includes(k)).length > 0
  const hasData = entry.operation === 'INSERT' && entry.new_data
  const hasOld  = entry.operation === 'DELETE' && entry.old_data

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.06)', marginBottom: 6,
      transition: 'border-color 0.15s',
    }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', flexWrap: 'wrap' }}>
        {/* Op badge */}
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
          background: op.bg, color: op.color, letterSpacing: 0.8,
          textTransform: 'uppercase', flexShrink: 0,
        }}>{op.label}</span>

        {/* Table badge */}
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: 'rgba(255,255,255,0.06)', color: SLATE,
          letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 0,
        }}>{TABLE_LABELS[entry.table_name] || entry.table_name}</span>

        {/* Title */}
        <span style={{
          flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0',
          fontFamily: "'Barlow Condensed', sans-serif",
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{entry.record_title || entry.record_id || '—'}</span>

        {/* Timestamp */}
        <span style={{ fontSize: 11, color: '#374151', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={11} color="#374151" />
          {timeStr}
        </span>

        {/* Expand button — only when there's something to show */}
        {(hasDiff || hasData || hasOld) && (
          <button onClick={onToggle} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: SLATE,
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
          }}>
            <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            <span style={{ fontSize: 10, fontWeight: 700 }}>
              {hasDiff ? `${Object.keys(entry.diff).filter(k => !['updated_at','created_at'].includes(k)).length} changes` : 'details'}
            </span>
          </button>
        )}
      </div>

      {/* Expanded diff / details */}
      {expanded && (
        <div style={{ padding: '0 14px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Diff header labels */}
          {hasDiff && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 6, padding: '8px 8px 4px', fontSize: 9, fontWeight: 800, color: '#374151', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                <span>Field</span>
                <span style={{ color: ROSE }}>Before</span>
                <span style={{ color: GREEN }}>After</span>
              </div>
              <DiffViewer diff={entry.diff} />
            </>
          )}
          {/* INSERT — show key new fields */}
          {hasData && (() => {
            const d = entry.new_data
            const interesting = ['title','status','item_type','description','publisher','author','genres'].filter(k => d[k] != null)
            return interesting.length > 0 ? (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {interesting.map(k => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, fontSize: 11, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <span style={{ color: SLATE, fontWeight: 700, fontFamily: 'monospace', fontSize: 10 }}>{k}</span>
                    <span style={{ color: GREEN, fontFamily: 'monospace', wordBreak: 'break-all' }}>{typeof d[k] === 'object' ? JSON.stringify(d[k]) : String(d[k])}</span>
                  </div>
                ))}
              </div>
            ) : null
          })()}
          {/* DELETE — show what was lost */}
          {hasOld && (() => {
            const d = entry.old_data
            const interesting = ['title','status','item_type','description','publisher','author'].filter(k => d[k] != null)
            return interesting.length > 0 ? (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {interesting.map(k => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, fontSize: 11, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <span style={{ color: SLATE, fontWeight: 700, fontFamily: 'monospace', fontSize: 10 }}>{k}</span>
                    <span style={{ color: ROSE, fontFamily: 'monospace', wordBreak: 'break-all' }}>{typeof d[k] === 'object' ? JSON.stringify(d[k]) : String(d[k])}</span>
                  </div>
                ))}
              </div>
            ) : null
          })()}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE = 30

function HistoryTab({ token }) {
  const [entries,    setEntries]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(0)
  const [expanded,   setExpanded]   = useState({})

  // Filters
  const [filterOp,    setFilterOp]    = useState('')   // INSERT|UPDATE|DELETE
  const [filterTable, setFilterTable] = useState('')
  const [filterSearch,setFilterSearch]= useState('')

  const load = useCallback(async (pg = 0) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('order',  'created_at.desc')
      params.set('limit',  PAGE_SIZE)
      params.set('offset', pg * PAGE_SIZE)
      params.set('select', 'id,created_at,table_name,operation,record_id,record_title,changed_by,diff,old_data,new_data')

      if (filterOp)    params.set('operation',   `eq.${filterOp}`)
      if (filterTable) params.set('table_name',  `eq.${filterTable}`)
      if (filterSearch.trim()) params.set('record_title', `ilike.%${filterSearch.trim()}%`)

      // Count
      const countParams = new URLSearchParams(params)
      countParams.set('limit', 1); countParams.set('offset', 0)

      const [data, countRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/audit_log?${params}`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/audit_log?${countParams}`, {
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`, Prefer: 'count=exact' },
        }),
      ])

      const t = parseInt(countRes.headers?.get?.('content-range')?.split('/')?.[1] || 0)
      setEntries(Array.isArray(data) ? data : [])
      setTotal(t)
      setPage(pg)
      setExpanded({})
    } catch(e) {
      console.error('Audit log load failed:', e)
    } finally {
      setLoading(false)
    }
  }, [token, filterOp, filterTable, filterSearch])

  useEffect(() => { load(0) }, [filterOp, filterTable, filterSearch])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: '0 0 4px' }}>
          Change History
        </h2>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
          Every add, edit, and delete made across the database — automatically recorded.
        </p>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 18, padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={14} color={SLATE} style={{ flexShrink: 0 }} />

          {/* Search by title */}
          <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 140 }}>
            <Search size={13} color="#475569" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
              placeholder="Search by title…"
              style={{ ...inp, paddingLeft: 28, padding: '7px 10px 7px 28px' }} />
          </div>

          {/* Operation filter */}
          <select value={filterOp} onChange={e => setFilterOp(e.target.value)}
            style={{ ...inp, width: 'auto', padding: '7px 10px', flex: '0 0 auto' }}>
            <option value="">All operations</option>
            <option value="INSERT">Added</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
          </select>

          {/* Table filter */}
          <select value={filterTable} onChange={e => setFilterTable(e.target.value)}
            style={{ ...inp, width: 'auto', padding: '7px 10px', flex: '0 0 auto' }}>
            <option value="">All tables</option>
            {Object.entries(TABLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {/* Clear filters */}
          {(filterOp || filterTable || filterSearch) && (
            <button onClick={() => { setFilterOp(''); setFilterTable(''); setFilterSearch('') }}
              style={{ ...btn(SLATE, true), padding: '6px 12px', fontSize: 11 }}>
              <X size={11} /> Clear
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
            {loading ? '…' : `${total.toLocaleString()} entries`}
          </span>
        </div>
      </Card>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(OP_STYLE).map(([op, s]) => (
          <div key={op} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ color: SLATE }}>{s.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
          <span style={{ color: SLATE }}>· Click a row with a diff button to see what changed</span>
        </div>
      </div>

      {/* Entries */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading audit log…
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#374151', fontSize: 13 }}>
          {filterOp || filterTable || filterSearch ? 'No entries match your filters.' : 'No history yet. Changes will appear here once admins start editing data.'}
        </div>
      ) : (
        <>
          {entries.map(entry => (
            <AuditRow
              key={entry.id}
              entry={entry}
              expanded={!!expanded[entry.id]}
              onToggle={() => setExpanded(p => ({ ...p, [entry.id]: !p[entry.id] }))}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button onClick={() => load(page - 1)} disabled={page === 0}
                style={{ ...btn(SLATE, true), padding: '6px 14px', opacity: page === 0 ? 0.3 : 1 }}>
                ← Prev
              </button>
              <span style={{ fontSize: 12, color: SLATE }}>
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                style={{ ...btn(SLATE, true), padding: '6px 14px', opacity: page >= totalPages - 1 ? 0.3 : 1 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SettingsTab() {
  return (
    <Section title="Settings" icon={Settings} color={SLATE}>
      <div style={{ color: '#374151', textAlign: 'center', padding: 32, fontSize: 13 }}>
        Site settings coming soon.
      </div>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────
// Main AdminPage
// ─────────────────────────────────────────────────────────────
export function AdminPage() {
  const { user, token } = useAuth()
  const { lang }        = useLang()
  const { show: showToast } = useToast()
  const s = useAdminStyles()
  const [isAdmin,    setIsAdmin]    = useState(null)
  const [activeTab,  setActiveTab]  = useState('overview')
  const [sidebarOpen,setSidebarOpen]= useState(true)
  const [expanded,   setExpanded]   = useState({ series: true })
  const [isMobile,   setIsMobile]   = useState(() => window.innerWidth < 900)

  useEffect(() => {
    const fn = () => { const m = window.innerWidth < 900; setIsMobile(m); if (m) setSidebarOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const toast = (msg, ok = true) => showToast(msg, ok)

  useEffect(() => {
    if (!token) { setIsAdmin(false); return }
    fetch(`${SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${user?.id}&select=user_id`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(data => setIsAdmin(Array.isArray(data) && data.length > 0)).catch(() => setIsAdmin(false))
  }, [token, user?.id])

  // ── Auth / permission gates ──
  if (isAdmin === null) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.textMuted, fontFamily: "'Be Vietnam Pro', sans-serif", background: s.bg }}>
      <RefreshCw size={18} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />Checking permissions…
    </div>
  )
  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: s.bg }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: `${PURPLE}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={28} color={PURPLE} /></div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, color: s.textBright }}>Login Required</div>
      <a href="#/" style={{ color: PURPLE, textDecoration: 'none', fontSize: 14 }}>← Go home</a>
    </div>
  )
  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: s.bg }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: `${ROSE}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={28} color={ROSE} /></div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, color: ROSE }}>Access Denied</div>
      <div style={{ color: s.textMuted, fontSize: 14 }}>This account does not have admin privileges.</div>
      <a href="#/" style={{ color: PURPLE, textDecoration: 'none', fontSize: 14 }}>← Go home</a>
    </div>
  )

  const SIDEBAR_W = sidebarOpen ? 220 : 0

  // ── Nav click handler ──
  const navigate = (id, hasSubId) => {
    if (hasSubId) {
      setExpanded(p => ({ ...p, [id]: !p[id] }))
    } else {
      setActiveTab(id)
      if (isMobile) setSidebarOpen(false)
    }
  }

  // ── Resolve which sub-tab is active display id ──
  const displayId = activeTab

  return (
    <div style={{ minHeight: '100vh', background: s.bg, display: 'flex', flexDirection: 'column' }}>
      {/* ── Top bar ── */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', background: s.headerBg,
        borderBottom: `1px solid ${s.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(139,92,246,0.15)'}`,
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        {/* Left: hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            width: 34, height: 34, borderRadius: 8, border: `1px solid ${s.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
            background: s.isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ width: 14, height: 1.5, background: s.textSecondary, borderRadius: 2, display: 'block' }} />
            <span style={{ width: 14, height: 1.5, background: s.textSecondary, borderRadius: 2, display: 'block' }} />
            <span style={{ width: 14, height: 1.5, background: s.textSecondary, borderRadius: 2, display: 'block' }} />
          </button>
          <a href="#/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${PURPLE}, #6366F1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}>Li</div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, color: s.textBright, letterSpacing: 0.5 }}>
              Li<span style={{ color: PURPLE }}>Dex</span>
              <span style={{ fontSize: 11, color: s.textMuted, fontWeight: 600, marginLeft: 8 }}>ADMIN</span>
            </span>
          </a>
        </div>

        {/* Right: user info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: s.textMuted, display: isMobile ? 'none' : 'block' }}>{user.email}</div>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${PURPLE}25`, border: `1px solid ${PURPLE}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} color={PURPLE} />
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: SIDEBAR_W, flexShrink: 0,
          background: s.sidebarBg,
          borderRight: `1px solid ${s.border}`,
          overflowY: 'auto', overflowX: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? 56 : 0,
          bottom: 0,
          zIndex: isMobile ? 80 : 1,
        }}>
          {sidebarOpen && (
            <nav style={{ padding: '12px 10px' }}>
              {NAV_ITEMS.map(item => {
                const hasSub = item.sub && item.sub.length > 0
                const isExpanded = expanded[item.id]
                const isActive = !hasSub && activeTab === item.id
                const subActive = hasSub && item.sub.some(s => s.id === activeTab)
                const Icon = item.icon

                return (
                  <div key={item.id}>
                    <button onClick={() => navigate(item.id, hasSub)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 9, marginBottom: 2,
                      background: isActive || subActive ? `${item.color}15` : 'transparent',
                      border: `1px solid ${isActive || subActive ? item.color + '30' : 'transparent'}`,
                      color: isActive || subActive ? s.textBright : s.textMuted,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { if (!isActive && !subActive) e.currentTarget.style.background = s.isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isActive && !subActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Icon size={15} color={isActive || subActive ? item.color : s.textMuted} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, fontWeight: isActive || subActive ? 700 : 500 }}>{item.label}</span>
                      {hasSub && <ChevronRight size={12} color={s.textMuted} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />}
                      {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, flexShrink: 0 }} />}
                    </button>

                    {/* Sub-items */}
                    {hasSub && isExpanded && (
                      <div style={{ paddingLeft: 14, marginBottom: 4 }}>
                        {item.sub.map(sub => {
                          const SubIcon = sub.icon
                          const subIsActive = activeTab === sub.id
                          return (
                            <button key={sub.id} onClick={() => { setActiveTab(sub.id); if (isMobile) setSidebarOpen(false) }} style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '7px 12px', borderRadius: 8, marginBottom: 2,
                              background: subIsActive ? `${sub.color}15` : 'transparent',
                              border: `1px solid ${subIsActive ? sub.color + '30' : 'transparent'}`,
                              color: subIsActive ? s.textBright : s.textGhost,
                              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                            }}
                              onMouseEnter={e => { if (!subIsActive) e.currentTarget.style.background = s.isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)' }}
                              onMouseLeave={e => { if (!subIsActive) e.currentTarget.style.background = 'transparent' }}
                            >
                              <SubIcon size={13} color={subIsActive ? sub.color : s.textGhost} style={{ flexShrink: 0 }} />
                              <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: subIsActive ? 700 : 500 }}>{sub.label}</span>
                              {subIsActive && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: sub.color }} />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Divider + back to site */}
              <div style={{ borderTop: `1px solid ${s.border}`, marginTop: 12, paddingTop: 12 }}>
                <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, color: s.textGhost, textDecoration: 'none', fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif", transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = s.textMuted}
                  onMouseLeave={e => e.currentTarget.style.color = s.textGhost}
                >
                  <ExternalLink size={14} />
                  Back to site
                </a>
              </div>
            </nav>
          )}
        </div>

        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, top: 56, background: 'rgba(0,0,0,0.6)', zIndex: 79 }} />
        )}

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 14px' : '28px 28px', minWidth: 0 }}>
          {activeTab === 'overview'      && <OverviewTab token={token} />}
          {activeTab === 'series_anime'  && <SeriesTab token={token} toast={toast} type="anime" />}
          {activeTab === 'series_manga'  && <SeriesTab token={token} toast={toast} type="manga" />}
          {activeTab === 'series_novel'  && <SeriesTab token={token} toast={toast} type="novel" />}
          {activeTab === 'links'         && <LinksTab token={token} toast={toast} />}
          {activeTab === 'featured'      && <FeaturedTab token={token} toast={toast} />}
          {activeTab === 'announcements' && <AnnouncementsTab token={token} toast={toast} />}
          {activeTab === 'votes'         && <VotesTab token={token} toast={toast} />}
          {activeTab === 'users'         && <UsersTab token={token} toast={toast} currentUserId={user?.id} />}
          {activeTab === 'history'       && <HistoryTab token={token} />}
          {activeTab === 'settings'      && <SettingsTab />}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${s.isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)'}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${s.isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)'}; }
      `}</style>
    </div>
  )
}
