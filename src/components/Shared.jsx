import React from 'react'
import { useLang } from '../context/LangContext.jsx'

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

  const TABS = [
    { path: '#/novels', icon: '📖', labelKey: 'nav_novels' },
    { path: '#/anime',  icon: '🎌', labelKey: 'nav_anime'  },
    { path: '#/manga',  icon: '📚', labelKey: 'nav_manga'  },
    { path: '#/vote',   icon: '🗳️', labelKey: 'nav_vote'   },
  ]

  // Search placeholder per tab
  const placeholder =
    activeTab === '#/novels' ? t('search_novels')
  : activeTab === '#/anime'  ? t('search_anime')
  : activeTab === '#/manga'  ? t('search_manga')
  : t('search_vote')

  return (
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
            const on = activeTab === tab.path
            return (
              <a key={tab.path} href={tab.path}
                className={`nav-tab${on ? ' nav-tab--active' : ''}`}
                style={on ? { background: accent } : {}}>
                {tab.icon} {t(tab.labelKey)}
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

        {/* Sort pills */}
        {!hideSorts && sorts.length > 0 && (
          <div className="app-header__sorts">
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

        {/* Language toggle */}
        <button onClick={toggleLang} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', padding: '6px 12px', borderRadius: 9, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "'Be Vietnam Pro', sans-serif",
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          🌐 {lang === 'vi' ? 'EN' : 'VI'}
        </button>

      </div>
    </header>
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
