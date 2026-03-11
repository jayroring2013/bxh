import React, { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { AuthModal } from './AuthModal.jsx'
import { NotificationBell } from './NotificationBell.jsx'

/* ── Skeleton ──────────────────────────────────────────────── */
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-card__inner" />
  </div>
)

export const SkeletonGrid = () => (
  <div className="card-grid">
    {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
)

/* ── Card grid ─────────────────────────────────────────────── */
export const CardGrid = ({ children }) => (
  <div className="card-grid">{children}</div>
)

/* ── Rank badge ────────────────────────────────────────────── */
export const RankBadge = ({ rank }) => {
  const bg =
      rank === 1 ? 'linear-gradient(135deg,#FFD700,#FFA500)'
    : rank === 2 ? 'linear-gradient(135deg,#C0C0C0,#A8A8A8)'
    : rank === 3 ? 'linear-gradient(135deg,#CD7F32,#A0522D)'
    : 'rgba(0,0,0,0.65)'
  return (
    <div className="rank-badge" style={{
      background: bg,
      color:  rank <= 3 ? '#000' : '#fff',
      border: rank <= 3 ? '1.5px solid rgba(255,255,255,0.35)' : 'none',
    }}>#{rank}</div>
  )
}

/* ── Empty state ───────────────────────────────────────────── */
export const EmptyState = ({ icon, msg }) => {
  const { t } = useLang()
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__title">{msg}</div>
      <div className="empty-state__sub">{t('empty_sub')}</div>
    </div>
  )
}

/* ── Error box ─────────────────────────────────────────────── */
export const ErrorBox = ({ msg, onRetry, color }) => {
  const { t } = useLang()
  return (
    <div className="error-box">
      <div className="error-box__title">{t('error_load')}</div>
      <div className="error-box__msg">{msg}</div>
      <button className="error-box__btn" onClick={onRetry} style={{ background: color }}>
        {t('error_retry')}
      </button>
    </div>
  )
}

/* ── Load more ─────────────────────────────────────────────── */
export const LoadMoreBtn = ({ onLoad, loading, color }) => {
  const { t } = useLang()
  return (
    <div className="load-more">
      <button className="load-more__btn" onClick={onLoad} disabled={loading}
        style={{ border: `1px solid ${color}60`, color }}>
        {loading
          ? <><span className="spinner" style={{ borderColor: color, borderTopColor: 'transparent' }} /> {t('loading')}</>
          : t('load_more')
        }
      </button>
    </div>
  )
}

/* ── Page footer ───────────────────────────────────────────── */
export const PageFooter = ({ color, src }) => {
  const { t } = useLang()
  return (
    <footer className="page-footer">
      <span className="page-footer__brand" style={{ color }}>LIDEX</span>
      {` · ${t('footer_powered')} ${src} · `}{new Date().getFullYear()}
    </footer>
  )
}

/* ── Filter pills ──────────────────────────────────────────── */
export const Pills = ({ items, active, onSelect, accent, solid }) => (
  <div className="pills">
    {items.map(item => {
      const on = active === item.id
      return (
        <button key={item.id} className="pill" onClick={() => onSelect(item.id)}
          style={on ? {
            background: solid ? accent : `${accent}30`,
            border:     `1px solid ${accent}${solid ? '' : '80'}`,
            color:      solid ? '#fff' : accent,
          } : {}}>
          {item.label}
        </button>
      )
    })}
  </div>
)

/* ── App header ────────────────────────────────────────────── */
export function AppHeader({ activeTab, accent, searchInput, onSearch, sorts, activeSort, onSort, hideSearch, hideSorts }) {
  const { t, lang, toggleLang } = useLang()
  const { user, signOut } = useAuth()
  const [showAuth,    setShowAuth]    = useState(false)
  const [authMode,    setAuthMode]    = useState('login')
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Listen for guest auth prompt from QuickAddButton (and other components)
  useEffect(() => {
    const fn = e => { setAuthMode(e.detail?.mode || 'login'); setShowAuth(true) }
    window.addEventListener('nt:open-auth', fn)
    return () => window.removeEventListener('nt:open-auth', fn)
  }, [])

  // Lucide icon components inline (no extra import needed — inline SVG paths)
  const NavIcon = ({ name, size = 15 }) => {
    const icons = {
      novels:   <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
      anime:    <><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></>,
      manga:    <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
      vote:     <><path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7z"/><path d="M22 19H2"/></>,
      ranking:  <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
      schedule: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
      list:     <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[name]}
      </svg>
    )
  }

  const TABS = [
    { path: '#/novels',   icon: 'novels',   labelKey: 'nav_novels'   },
    { path: '#/anime',    icon: 'anime',    labelKey: 'nav_anime'    },
    { path: '#/manga',    icon: 'manga',    labelKey: 'nav_manga'    },
    { path: '#/vote',     icon: 'vote',     labelKey: 'nav_vote'     },
    { path: '#/ranking',  icon: 'ranking',  labelKey: 'nav_ranking'  },
    { path: '#/schedule', icon: 'schedule', labelKey: 'nav_schedule' },
    { path: '#/list',     icon: 'list',     labelKey: 'nav_list'     },
  ]

  // Search placeholder per tab
  const placeholder =
    activeTab === '#/novels' ? t('search_novels')
  : activeTab === '#/anime'  ? t('search_anime')
  : activeTab === '#/manga'  ? t('search_manga')
  : t('search_vote')

  return (
    <>
    <header className="app-header" style={{ borderBottom: `1px solid ${accent}26` }}>
      <div className="app-header__inner">

        {/* Logo — links back to landing */}
        <a href="#/" className="app-header__logo" style={{ textDecoration: 'none' }}>
          <div className="app-header__logo-icon" style={{ background: accent }}>Li</div>
          <span className="app-header__logo-text">
            Li<span style={{ color: accent }}>Dex</span>
          </span>
        </a>

        {/* Nav tabs */}
        <nav className="app-header__nav">
          {TABS.map(tab => {
            const on = activeTab === tab.path || activeTab.startsWith(tab.path + '/')
            return (
              <a key={tab.path} href={tab.path}
                className={`nav-tab${on ? ' nav-tab--active' : ''}`}
                style={on ? { background: accent } : {}}
                title={t(tab.labelKey)}>
                <NavIcon name={tab.icon} />
                <span className="nav-tab__label">{t(tab.labelKey)}</span>
              </a>
            )
          })}
        </nav>

        {/* Search */}
        {!hideSearch && (
          <div className="app-header__search">
            <svg className="app-header__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={searchInput} onChange={e => onSearch(e.target.value)} placeholder={placeholder} />
            {searchInput && (
              <button className="app-header__search-clear" onClick={() => onSearch('')}>×</button>
            )}
          </div>
        )}

        {/* Sorts moved to sub-bar below — nothing here */}

        {/* Language toggle — margin-left:auto pushes it and everything after to the right */}
        <button onClick={toggleLang} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', padding: '6px 12px', borderRadius: 9, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "'Be Vietnam Pro', sans-serif",
          display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          {lang === 'vi' ? 'EN' : 'VI'}
        </button>

        {/* Notification bell — only when logged in */}
        {user && <NotificationBell />}

        {/* User button */}
        {user ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setShowUserMenu(p => !p)} style={{
              width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
              background: `linear-gradient(135deg, ${accent}, #6366F1)`,
              border: `2px solid ${accent}60`, color: '#fff',
              fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {user.email?.[0]?.toUpperCase() || '?'}
            </button>
            {showUserMenu && (
              <div style={{
                position: 'absolute', top: 42, right: 0, zIndex: 9999,
                background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: 8, minWidth: 180,
                boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
              }}>
                <div style={{ padding: '6px 12px', fontSize: 11, color: '#475569',
                  borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }}>
                  {user.email}
                </div>
                <a href="#/list" onClick={() => setShowUserMenu(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', color: '#CBD5E1', textDecoration: 'none',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  {lang === 'vi' ? 'Danh sách của tôi' : 'My List'}
                </a>
                <a href="#/admin" onClick={() => setShowUserMenu(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', color: '#A78BFA', textDecoration: 'none',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.41 1.41l-1.42 2.46A7.5 7.5 0 0 0 17.5 8l-2.83-.01a7.5 7.5 0 0 0-.85-2.04l1.42-2.46a10 10 0 0 1 1.83.44zM4.93 4.93a10 10 0 0 0-1.41 1.41l1.42 2.46A7.5 7.5 0 0 1 6.5 8l2.83-.01a7.5 7.5 0 0 1 .85-2.04L8.76 3.49a10 10 0 0 0-1.83.44 10 10 0 0 0-2 1z"/></svg>
                  {lang === 'vi' ? 'Quản trị' : 'Admin Panel'}
                </a>
                <button onClick={() => { signOut(); setShowUserMenu(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  background: 'none', border: 'none', color: '#F87171', cursor: 'pointer',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {lang === 'vi' ? 'Đăng xuất' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} style={{
            background: accent, border: 'none', color: '#fff',
            padding: '6px 14px', borderRadius: 9, cursor: 'pointer',
            fontSize: 12, fontWeight: 700, flexShrink: 0,
            fontFamily: "'Be Vietnam Pro', sans-serif",
            boxShadow: `0 4px 14px ${accent}40`,
          }}>
            {lang === 'vi' ? 'Đăng nhập' : 'Sign In'}
          </button>
        )}

      </div>
    </header>

    {showAuth && <AuthModal onClose={() => setShowAuth(false)} initialMode={authMode} />}

    {/* Sub-bar: sort pills below header */}
    {!hideSorts && sorts.length > 0 && (
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '8px 20px',
        display: 'flex', gap: 6, flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {sorts.map(s => (
          <button key={s.id}
            className={`sort-btn${activeSort === s.id ? ' sort-btn--active' : ''}`}
            onClick={() => onSort(s.id)}
            style={activeSort === s.id ? { background: accent } : {}}>
            {s.label}
          </button>
        ))}
      </div>
    )}
    </>
  )
}

/* ── Hero banner ───────────────────────────────────────────── */
export function HeroBanner({ title, sub, accent, src, tagline }) {
  const { t } = useLang()
  return (
    <div className="hero-banner">
      <div className="hero-banner__glow"
        style={{ background: `radial-gradient(ellipse, ${accent}20 0%, transparent 70%)` }} />
      <div className="hero-banner__title">{title}</div>
      {tagline && (
        <div className="hero-banner__tagline">{tagline}</div>
      )}
      <div className="hero-banner__sub">
        <span>{t('footer_powered')} <span style={{ color: accent }}>{src}</span></span>
        {sub && <><span style={{ color: '#374151' }}>·</span><span style={{ color: accent, opacity: 0.7 }}>{sub}</span></>}
      </div>
    </div>
  )
}
