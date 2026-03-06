import React, { useState } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { AuthModal } from './AuthModal.jsx'

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
      <span className="page-footer__brand" style={{ color }}>NOVELTREND</span>
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
  const [showUserMenu, setShowUserMenu] = useState(false)

  const TABS = [
    { path: '#/novels', icon: '📖', labelKey: 'nav_novels' },
    { path: '#/anime',  icon: '🎌', labelKey: 'nav_anime'  },
    { path: '#/manga',  icon: '📚', labelKey: 'nav_manga'  },
    { path: '#/vote',     icon: '🗳️', labelKey: 'nav_vote'     },
    { path: '#/ranking',  icon: '🏆', labelKey: 'nav_ranking'  },
    { path: '#/schedule', icon: '📅', labelKey: 'nav_schedule' },
    { path: '#/list',     icon: '🔖', labelKey: 'nav_list'     },
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
          <div className="app-header__logo-icon" style={{ background: accent }}>NT</div>
          <span className="app-header__logo-text">
            NOVEL<span style={{ color: accent }}>TREND</span>
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
                {tab.icon}{on ? <span style={{marginLeft:5}}>{t(tab.labelKey)}</span> : null}
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

        {/* Language toggle */}
        <button onClick={toggleLang} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', padding: '6px 12px', borderRadius: 9, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "'Be Vietnam Pro', sans-serif",
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          🌐 {lang === 'vi' ? 'EN' : 'VI'}
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
                  display: 'block', padding: '8px 12px', color: '#fff', textDecoration: 'none',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                }}>🔖 {lang === 'vi' ? 'Danh sách của tôi' : 'My List'}</a>
                <button onClick={() => { signOut(); setShowUserMenu(false) }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                  background: 'none', border: 'none', color: '#F87171', cursor: 'pointer',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                }}>↩ {lang === 'vi' ? 'Đăng xuất' : 'Sign out'}</button>
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

    {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

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
export function HeroBanner({ title, sub, accent, src }) {
  const { t } = useLang()
  return (
    <div className="hero-banner">
      <div className="hero-banner__glow"
        style={{ background: `radial-gradient(ellipse, ${accent}20 0%, transparent 70%)` }} />
      <div className="hero-banner__title">{title}</div>
      <div className="hero-banner__sub">
        <span>{t('footer_powered')} <span style={{ color: accent }}>{src}</span></span>
        {sub && <><span style={{ color: '#374151' }}>·</span><span style={{ color: '#374151' }}>{sub}</span></>}
      </div>
    </div>
  )
}
