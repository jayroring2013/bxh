import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

/* ─────────────────────────────────────────────────────────────────
   Light mode overrides — every value is taken directly from the
   dark-mode colours in styles.css and swapped to a light equivalent.
   Applied as a single injected <style> block; no extra .css file needed.
───────────────────────────────────────────────────────────────── */
const LIGHT_CSS = `
  /* ── Base ── */
  html[data-theme="light"] body {
    background: #F1F5F9;
    color: #0F172A;
  }

  html[data-theme="light"] input::placeholder { color: #94A3B8; }

  /* ── Scrollbar ── */
  html[data-theme="light"] ::-webkit-scrollbar-track { background: #E2E8F0; }
  html[data-theme="light"] ::-webkit-scrollbar-thumb { background: #8B5CF6; }

  /* ── Skeleton ── */
  html[data-theme="light"] .skeleton-card { background: #DDE3EC; }
  html[data-theme="light"] .skeleton-card__inner {
    background: linear-gradient(90deg, #DDE3EC 25%, #EEF2F7 50%, #DDE3EC 75%);
    background-size: 200% 100%;
  }

  /* ── Novel card ── */
  html[data-theme="light"] .novel-card { background: #CBD5E1; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
  html[data-theme="light"] .novel-card:hover { box-shadow: 0 24px 60px rgba(139,92,246,0.22), 0 8px 20px rgba(0,0,0,0.15); }
  html[data-theme="light"] .novel-card__placeholder { background: linear-gradient(135deg, #C7D2DC, #DDE3EC); }
  html[data-theme="light"] .novel-card__gradient { background: linear-gradient(to top, rgba(15,23,42,0.82) 35%, transparent 65%); }
  html[data-theme="light"] .novel-card:hover .novel-card__gradient { background: linear-gradient(to top, rgba(15,23,42,0.93) 45%, rgba(15,23,42,0.08) 100%); }
  html[data-theme="light"] .novel-card__title-orig { color: #64748B; }
  html[data-theme="light"] .novel-card__meta-label { color: #94A3B8; }
  html[data-theme="light"] .novel-card__meta-value { color: #CBD5E1; }
  html[data-theme="light"] .novel-card__desc { color: #CBD5E1; }

  /* ── Anime card ── */
  html[data-theme="light"] .anime-card { background: #CBD5E1; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
  html[data-theme="light"] .anime-card:hover { box-shadow: 0 24px 60px rgba(6,182,212,0.22), 0 8px 20px rgba(0,0,0,0.15); }
  html[data-theme="light"] .anime-card__placeholder { background: linear-gradient(135deg, #B8CCD8, #CBD5E1); }
  html[data-theme="light"] .anime-card__gradient { background: linear-gradient(to top, rgba(15,23,42,0.82) 35%, transparent 65%); }
  html[data-theme="light"] .anime-card:hover .anime-card__gradient { background: linear-gradient(to top, rgba(15,23,42,0.93) 45%, rgba(15,23,42,0.08) 100%); }

  /* ── Manga card ── */
  html[data-theme="light"] .manga-card:hover { box-shadow: 0 24px 60px rgba(244,63,94,0.2), 0 8px 20px rgba(0,0,0,0.15); }

  /* ── App header ── */
  html[data-theme="light"] .app-header {
    background: rgba(241,245,249,0.96);
    border-bottom-color: rgba(0,0,0,0.08);
  }
  html[data-theme="light"] .app-header__logo-text { color: #0F172A; }
  html[data-theme="light"] .app-header__nav { background: rgba(0,0,0,0.05); }
  html[data-theme="light"] .nav-tab { color: #64748B; }
  html[data-theme="light"] .nav-tab:hover:not(.nav-tab--active) {
    color: #1E293B;
    background: rgba(0,0,0,0.07);
  }
  html[data-theme="light"] .nav-tab--active { color: #fff; }
  html[data-theme="light"] .app-header__search input {
    background: rgba(0,0,0,0.05);
    border-color: rgba(0,0,0,0.1);
    color: #0F172A;
  }
  html[data-theme="light"] .app-header__search-clear { color: #94A3B8; }

  /* ── Sort bar ── */
  html[data-theme="light"] .app-header__sorts { background: rgba(0,0,0,0.05); }
  html[data-theme="light"] .sort-btn { color: #64748B; }
  html[data-theme="light"] .sort-btn:hover:not(.sort-btn--active) {
    color: #1E293B;
    background: rgba(0,0,0,0.07);
  }
  html[data-theme="light"] .sort-btn--active { color: #fff; }

  /* ── Sort sub-bar (inline-styled div below header) ── */
  html[data-theme="light"] div[style*="rgba(0,0,0,0.3)"] {
    background: rgba(0,0,0,0.04) !important;
    border-bottom-color: rgba(0,0,0,0.08) !important;
  }

  /* ── Hero banner ── */
  html[data-theme="light"] .hero-banner {
    background: linear-gradient(160deg, #E8ECF2, #EEF2F7, #F1F5F9);
  }
  html[data-theme="light"] .hero-banner__title    { color: #0F172A; }
  html[data-theme="light"] .hero-banner__tagline  { color: #475569; }
  html[data-theme="light"] .hero-banner__sub      { color: #64748B; }

  /* ── Filter bar ── */
  html[data-theme="light"] .filter-bar {
    background: rgba(0,0,0,0.03);
    border-bottom-color: rgba(0,0,0,0.07);
  }
  html[data-theme="light"] .filter-row__label { color: #64748B; }

  /* ── Pills ── */
  html[data-theme="light"] .pill {
    background: rgba(0,0,0,0.04);
    border-color: rgba(0,0,0,0.1);
    color: #475569;
  }
  html[data-theme="light"] .pill:hover { background: rgba(0,0,0,0.08); color: #1E293B; }

  /* ── Empty state ── */
  html[data-theme="light"] .empty-state       { color: #94A3B8; }
  html[data-theme="light"] .empty-state__title { color: #475569; }
  html[data-theme="light"] .empty-state__sub   { color: #94A3B8; }

  /* ── Error box ── */
  html[data-theme="light"] .error-box {
    background: rgba(239,68,68,0.07);
    border-color: rgba(239,68,68,0.2);
  }
  html[data-theme="light"] .error-box__msg { color: #64748B; }

  /* ── Footer ── */
  html[data-theme="light"] .page-footer {
    border-top-color: rgba(0,0,0,0.08);
    color: #64748B;
  }

  /* ── Modal overlay ── */
  html[data-theme="light"] .nt-overlay { background: rgba(15,23,42,0.6); }

  /* ── Modal shell ── */
  html[data-theme="light"] .nt-modal { background: #fff; }
  html[data-theme="light"] .modal-close {
    background: rgba(0,0,0,0.08);
    color: #1E293B;
  }
  html[data-theme="light"] .modal-cover         { background: #DDE3EC; }
  html[data-theme="light"] .modal-cover__fade   {
    background: linear-gradient(to right, transparent 50%, #fff 100%) !important;
  }
  html[data-theme="light"] .modal-banner__fade  {
    background: linear-gradient(to bottom, transparent 30%, #fff 100%);
  }
  html[data-theme="light"] .modal-title         { color: #0F172A; }
  html[data-theme="light"] .modal-title-orig    { color: #64748B; }
  html[data-theme="light"] .modal-title-sub     { color: #64748B; }
  html[data-theme="light"] .modal-author        { color: #475569; }
  html[data-theme="light"] .modal-stat__label   { color: #64748B; }
  html[data-theme="light"] .modal-desc          { color: #334155; }
  html[data-theme="light"] .modal-section-label { color: #64748B; }
  html[data-theme="light"] .modal-vol-chip {
    background: rgba(139,92,246,0.08);
    border-color: rgba(139,92,246,0.2);
  }
  html[data-theme="light"] .modal-vol-more {
    background: rgba(0,0,0,0.04);
    border-color: rgba(0,0,0,0.1);
    color: #64748B;
  }
  html[data-theme="light"] .modal-publisher-chip {
    background: rgba(139,92,246,0.08);
    border-color: rgba(139,92,246,0.2);
  }

  /* ── Date chips ── */
  html[data-theme="light"] .date-chip {
    background: rgba(0,0,0,0.04);
    border-color: rgba(0,0,0,0.09);
  }
  html[data-theme="light"] .date-chip__label { color: #64748B; }
  html[data-theme="light"] .date-chip__value { color: #475569; }

  /* ── Airing badge ── */
  html[data-theme="light"] .airing-badge { background: rgba(6,182,212,0.08); }
`

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('lidex_theme') || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('lidex_theme', theme) } catch {}
  }, [theme])

  // Inject the light-mode CSS once on mount
  useEffect(() => {
    const id = 'lidex-theme-style'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = LIGHT_CSS
      document.head.appendChild(style)
    }
  }, [])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
