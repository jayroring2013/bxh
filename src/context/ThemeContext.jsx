import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

/* ─────────────────────────────────────────────────────────────────
   Light mode overrides.
   Strategy:
   1. CSS custom properties on :root / html[data-theme] so inline
      JS that reads getComputedStyle can pick them up.
   2. Class-based overrides for every class defined in styles.css.
   3. Pattern overrides for the most common hardcoded inline colours
      used across all pages (body bg, card surfaces, muted text).

   Dark values used in this app (from styles.css + page inline styles):
     Backgrounds : #0f0b09  #0a0f1e  #1a1a2e  #130d08  #0d1117
                   #12121e  #1a1410  #0f0f1a  #130a1c  #110d0a
     Text muted  : #374151  #475569  #4B5563  #64748B
     Text warm   : #6b4f35  #4a3828  #2e2016  (VotePage sidebar)
     Surfaces    : rgba(255,255,255,0.02/0.03/0.04/0.05/0.06/0.07/0.08)
     Borders     : rgba(255,255,255,0.05/0.06/0.07/0.08/0.09)
───────────────────────────────────────────────────────────────── */
const LIGHT_CSS = `

/* ══════════════════════════════════════════════════════════════
   CSS CUSTOM PROPERTIES
   Components that read var(--...) will auto-respond to theme.
══════════════════════════════════════════════════════════════ */
html[data-theme="dark"] {
  --bg-page:        #0f0b09;
  --bg-surface-1:   rgba(255,255,255,0.04);
  --bg-surface-2:   rgba(255,255,255,0.02);
  --bg-surface-3:   rgba(255,255,255,0.06);
  --bg-surface-4:   rgba(255,255,255,0.08);
  --border-soft:    rgba(255,255,255,0.06);
  --border-medium:  rgba(255,255,255,0.09);
  --text-bright:    #f1f5f9;
  --text-primary:   #e2e8f0;
  --text-secondary: #94A3B8;
  --text-muted:     #64748B;
  --text-faint:     #475569;
  --text-ghost:     #374151;
  --text-warm:      #6b4f35;
  --text-warm-dim:  #4a3828;
  --text-warm-dark: #2e2016;
  --input-bg:       rgba(255,255,255,0.05);
  --input-border:   rgba(255,255,255,0.08);
  --color-scheme:   dark;
}

html[data-theme="light"] {
  --bg-page:        #F1F5F9;
  --bg-surface-1:   rgba(0,0,0,0.03);
  --bg-surface-2:   rgba(0,0,0,0.015);
  --bg-surface-3:   rgba(0,0,0,0.05);
  --bg-surface-4:   rgba(0,0,0,0.07);
  --border-soft:    rgba(0,0,0,0.08);
  --border-medium:  rgba(0,0,0,0.11);
  --text-bright:    #0F172A;
  --text-primary:   #1E293B;
  --text-secondary: #475569;
  --text-muted:     #64748B;
  --text-faint:     #64748B;
  --text-ghost:     #94A3B8;
  --text-warm:      #78716C;
  --text-warm-dim:  #92837C;
  --text-warm-dark: #A89490;
  --input-bg:       rgba(0,0,0,0.04);
  --input-border:   rgba(0,0,0,0.1);
  --color-scheme:   light;
}


/* ══════════════════════════════════════════════════════════════
   BASE
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] body {
  background: #F1F5F9;
  color: #0F172A;
}

/* Override inline style="background:#0f0b09" on page root divs
   (VotePage, and any other page that sets it inline) */
html[data-theme="light"] div[style*="background:#0f0b09"],
html[data-theme="light"] div[style*="background: #0f0b09"],
html[data-theme="light"] div[style*="background:'#0f0b09"] {
  background: #F1F5F9 !important;
}

/* Override near-white text used in ranking rows (spans, not card titles) */
html[data-theme="light"] span[style*="color: #f1f5f9"],
html[data-theme="light"] span[style*="color: '#f1f5f9'"],
html[data-theme="light"] span[style*="color: rgb(241, 245, 249)"],
html[data-theme="light"] a[style*="color: #f1f5f9"],
html[data-theme="light"] a[style*="color: rgb(241, 245, 249)"] {
  color: #0F172A !important;
}
html[data-theme="light"] span[style*="color: #e2e8f0"],
html[data-theme="light"] span[style*="color: '#e2e8f0'"],
html[data-theme="light"] span[style*="color: rgb(226, 232, 240)"],
html[data-theme="light"] a[style*="color: #e2e8f0"],
html[data-theme="light"] a[style*="color: rgb(226, 232, 240)"] {
  color: #1E293B !important;
}
/* Row backgrounds in ranking list */
html[data-theme="light"] div[style*="background: rgba(255,255,255,0.02)"],
html[data-theme="light"] div[style*="background:rgba(255,255,255,0.02)"] {
  background: rgba(0,0,0,0.02) !important;
}
html[data-theme="light"] div[style*="border: 1px solid rgba(255,255,255,0.05)"],
html[data-theme="light"] div[style*="borderColor: rgba(255,255,255,0.05)"] {
  border-color: rgba(0,0,0,0.06) !important;
}
/* Landing page ghost/secondary buttons */
html[data-theme="light"] button[style*="background:'rgba(255,248,240,0.06)'"],
html[data-theme="light"] button[style*="background: rgba(255,248,240,0.06)"] {
  background: rgba(0,0,0,0.05) !important;
  border-color: rgba(0,0,0,0.12) !important;
  color: #1E293B !important;
}
html[data-theme="light"] button[style*="background:rgba(255,248,240,0.06)"] {
  background: rgba(0,0,0,0.05) !important;
  border-color: rgba(0,0,0,0.12) !important;
  color: #1E293B !important;
}
/* Ghost "Sign in" button on landing page */
html[data-theme="light"] button[style*="border:'1px solid rgba(255,255,255,0.12)'"],
html[data-theme="light"] button[style*="border: 1px solid rgba(255,255,255,0.12)"] {
  background: rgba(0,0,0,0.03) !important;
  border-color: rgba(0,0,0,0.12) !important;
  color: #1E293B !important;
}

html[data-theme="light"] input::placeholder { color: #94A3B8; }

/* date inputs */
html[data-theme="light"] input[type="date"] {
  color-scheme: light;
  background: rgba(0,0,0,0.04) !important;
  border-color: rgba(6,182,212,0.3) !important;
  color: #06B6D4 !important;
}


/* ══════════════════════════════════════════════════════════════
   SCROLLBAR
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] ::-webkit-scrollbar-track { background: #E2E8F0; }
html[data-theme="light"] ::-webkit-scrollbar-thumb { background: #8B5CF6; }


/* ══════════════════════════════════════════════════════════════
   SKELETON
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .skeleton-card { background: #DDE3EC; }
html[data-theme="light"] .skeleton-card__inner {
  background: linear-gradient(90deg, #DDE3EC 25%, #EEF2F7 50%, #DDE3EC 75%);
  background-size: 200% 100%;
}
/* Ranking page skeleton loaders (inline gradient) */
html[data-theme="light"] div[style*="linear-gradient(90deg,#1f2937"],
html[data-theme="light"] div[style*="linear-gradient(90deg,#1e1410"] {
  background: linear-gradient(90deg, #DDE3EC 25%, #EEF2F7 50%, #DDE3EC 75%) !important;
  background-size: 200% 100% !important;
}


/* ══════════════════════════════════════════════════════════════
   CARDS (novel / anime / manga)
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .novel-card,
html[data-theme="light"] .anime-card {
  background: #CBD5E1;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
html[data-theme="light"] .novel-card:hover { box-shadow: 0 24px 60px rgba(139,92,246,0.18), 0 8px 20px rgba(0,0,0,0.1); }
html[data-theme="light"] .anime-card:hover { box-shadow: 0 24px 60px rgba(6,182,212,0.18), 0 8px 20px rgba(0,0,0,0.1); }
html[data-theme="light"] .manga-card:hover { box-shadow: 0 24px 60px rgba(244,63,94,0.18), 0 8px 20px rgba(0,0,0,0.1); }

html[data-theme="light"] .novel-card__placeholder { background: linear-gradient(135deg, #C7D2DC, #DDE3EC); }
html[data-theme="light"] .anime-card__placeholder { background: linear-gradient(135deg, #B8CCD8, #CBD5E1); }

html[data-theme="light"] .novel-card__gradient,
html[data-theme="light"] .anime-card__gradient {
  background: linear-gradient(to top, rgba(15,23,42,0.80) 35%, transparent 65%);
}
html[data-theme="light"] .novel-card:hover .novel-card__gradient,
html[data-theme="light"] .anime-card:hover .anime-card__gradient {
  background: linear-gradient(to top, rgba(15,23,42,0.90) 45%, rgba(15,23,42,0.05) 100%);
}
html[data-theme="light"] .novel-card__title-orig { color: #64748B; }
html[data-theme="light"] .novel-card__meta-label { color: #94A3B8; }
html[data-theme="light"] .novel-card__meta-value { color: #CBD5E1; }
html[data-theme="light"] .novel-card__desc       { color: #CBD5E1; }


/* ══════════════════════════════════════════════════════════════
   APP HEADER
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .app-header {
  background: rgba(241,245,249,0.96) !important;
  border-bottom-color: rgba(0,0,0,0.08);
}
html[data-theme="light"] .app-header__logo-text { color: #0F172A; }
html[data-theme="light"] .app-header__nav       { background: rgba(0,0,0,0.05); }
html[data-theme="light"] .nav-tab               { color: #64748B; }
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


/* ══════════════════════════════════════════════════════════════
   SORT BAR
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .app-header__sorts     { background: rgba(0,0,0,0.05); }
html[data-theme="light"] .sort-btn              { color: #64748B; }
html[data-theme="light"] .sort-btn:hover:not(.sort-btn--active) {
  color: #1E293B;
  background: rgba(0,0,0,0.07);
}
html[data-theme="light"] .sort-btn--active { color: #fff; }

/* inline sort sub-bar (rgba(0,0,0,0.3) in Shared.jsx) */
html[data-theme="light"] div[style*="rgba(0,0,0,0.3)"] {
  background: rgba(0,0,0,0.04) !important;
  border-bottom-color: rgba(0,0,0,0.08) !important;
}


/* ══════════════════════════════════════════════════════════════
   HERO BANNER
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .hero-banner {
  background: linear-gradient(160deg, #E8ECF2, #EEF2F7, #F1F5F9);
}
html[data-theme="light"] .hero-banner__title   { color: #0F172A; }
html[data-theme="light"] .hero-banner__tagline { color: #475569; }
html[data-theme="light"] .hero-banner__sub     { color: #64748B; }


/* ══════════════════════════════════════════════════════════════
   FILTER BAR + PILLS
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .filter-bar {
  background: rgba(0,0,0,0.03);
  border-bottom-color: rgba(0,0,0,0.07);
}
html[data-theme="light"] .filter-row__label { color: #64748B; }

html[data-theme="light"] .pill {
  background: rgba(0,0,0,0.04);
  border-color: rgba(0,0,0,0.1);
  color: #475569;
}
html[data-theme="light"] .pill:hover { background: rgba(0,0,0,0.08); color: #1E293B; }


/* ══════════════════════════════════════════════════════════════
   EMPTY STATE / ERROR / LOAD MORE / FOOTER
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .empty-state        { color: #94A3B8; }
html[data-theme="light"] .empty-state__title { color: #475569; }
html[data-theme="light"] .empty-state__sub   { color: #94A3B8; }

html[data-theme="light"] .error-box {
  background: rgba(239,68,68,0.07);
  border-color: rgba(239,68,68,0.2);
}
html[data-theme="light"] .error-box__msg { color: #64748B; }

html[data-theme="light"] .page-footer {
  border-top-color: rgba(0,0,0,0.08);
  color: #64748B;
}


/* ══════════════════════════════════════════════════════════════
   MODALS (nt-overlay / nt-modal and internals)
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] .nt-overlay   { background: rgba(15,23,42,0.55); }
html[data-theme="light"] .nt-modal     { background: #fff; }

html[data-theme="light"] .modal-close  { background: rgba(0,0,0,0.08); color: #1E293B; }
html[data-theme="light"] .modal-cover  { background: #DDE3EC; }
html[data-theme="light"] .modal-cover__fade {
  background: linear-gradient(to right, transparent 50%, #fff 100%) !important;
}
html[data-theme="light"] .modal-banner__fade {
  background: linear-gradient(to bottom, transparent 30%, #fff 100%);
}
html[data-theme="light"] .modal-title         { color: #0F172A; }
html[data-theme="light"] .modal-title-orig    { color: #64748B; }
html[data-theme="light"] .modal-title-sub     { color: #64748B; }
html[data-theme="light"] .modal-author        { color: #475569; }
html[data-theme="light"] .modal-stat__label   { color: #64748B; }
html[data-theme="light"] .modal-desc          { color: #334155; }
html[data-theme="light"] .modal-section-label { color: #64748B; }
html[data-theme="light"] .modal-vol-chip      { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.2); }
html[data-theme="light"] .modal-vol-more      { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); color: #64748B; }
html[data-theme="light"] .modal-publisher-chip{ background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.2); }

html[data-theme="light"] .date-chip        { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.09); }
html[data-theme="light"] .date-chip__label { color: #64748B; }
html[data-theme="light"] .date-chip__value { color: #475569; }

html[data-theme="light"] .airing-badge { background: rgba(6,182,212,0.08); }

/* Inline modal backgrounds (ModalShell / NovelDetailModal use linear-gradient) */
html[data-theme="light"] div[style*="linear-gradient(145deg,#0a0f1e"],
html[data-theme="light"] div[style*="linear-gradient(145deg,#0f0f1a"],
html[data-theme="light"] div[style*="linear-gradient(145deg,#0d1117"],
html[data-theme="light"] div[style*="linear-gradient(145deg,#130d08"] {
  background: #fff !important;
}
/* modal-cover__fade hardcoded in some pages */
html[data-theme="light"] div[style*="linear-gradient(to right, transparent 50%, #0a0f1e"] {
  background: linear-gradient(to right, transparent 50%, #fff 100%) !important;
}
html[data-theme="light"] div[style*="linear-gradient(to bottom, transparent 30%, #0a0f1e"] {
  background: linear-gradient(to bottom, transparent 30%, #fff 100%) !important;
}


/* ══════════════════════════════════════════════════════════════
   INLINE SURFACE COLOURS (rgba white-on-dark → black-on-light)
   These catch the most common card/row surfaces used in
   RankingPage, MyListPage, SchedulePage, VotePage, etc.
══════════════════════════════════════════════════════════════ */

/* Generic row / card surfaces */
html[data-theme="light"] div[style*="background: 'rgba(255,255,255,0.02)"],
html[data-theme="light"] div[style*="background:'rgba(255,255,255,0.02)"],
html[data-theme="light"] div[style*="background: rgba(255,255,255,0.02)"] {
  background: rgba(0,0,0,0.025) !important;
}
html[data-theme="light"] div[style*="background: rgba(255,248,240,0.02)"],
html[data-theme="light"] div[style*="background:'rgba(255,248,240,0.02)"],
html[data-theme="light"] div[style*="background:'rgba(255,248,240,0.04)"],
html[data-theme="light"] div[style*="background: rgba(255,248,240,0.04)"] {
  background: rgba(0,0,0,0.025) !important;
}

/* Ranking rows top-3 warm gradients are fine on light — keep them */

/* Ranking non-top3 rank badge */
html[data-theme="light"] div[style*="background: rgba(255,255,255,0.04)"] {
  background: rgba(0,0,0,0.05) !important;
}
html[data-theme="light"] div[style*="background:'rgba(255,255,255,0.04)"] {
  background: rgba(0,0,0,0.05) !important;
}
html[data-theme="light"] div[style*="background: rgba(255,255,255,0.05)"] {
  background: rgba(0,0,0,0.04) !important;
}
html[data-theme="light"] div[style*="background: rgba(255,255,255,0.06)"] {
  background: rgba(0,0,0,0.05) !important;
}
html[data-theme="light"] div[style*="background: rgba(255,255,255,0.07)"] {
  background: rgba(0,0,0,0.06) !important;
}
html[data-theme="light"] div[style*="background: rgba(255,255,255,0.08)"] {
  background: rgba(0,0,0,0.07) !important;
}


/* ══════════════════════════════════════════════════════════════
   INLINE BORDER COLOURS
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] div[style*="border: '1px solid rgba(255,255,255,0.05)"],
html[data-theme="light"] div[style*="border: 1px solid rgba(255,255,255,0.05)"],
html[data-theme="light"] div[style*="border-color: rgba(255,255,255,0.05)"],
html[data-theme="light"] div[style*="borderColor: 'rgba(255,255,255,0.05)"] {
  border-color: rgba(0,0,0,0.08) !important;
}
html[data-theme="light"] div[style*="border: '1px solid rgba(255,255,255,0.06)"],
html[data-theme="light"] div[style*="border: 1px solid rgba(255,255,255,0.06)"] {
  border-color: rgba(0,0,0,0.09) !important;
}
html[data-theme="light"] div[style*="border-bottom: '1px solid rgba(255,255,255,0.07)"],
html[data-theme="light"] div[style*="border-bottom: 1px solid rgba(255,255,255,0.07)"] {
  border-bottom-color: rgba(0,0,0,0.08) !important;
}


/* ══════════════════════════════════════════════════════════════
   INLINE TEXT: #374151 (ghost/invisible on light bg)
   This is used heavily as "barely-there" text across all pages.
   On light mode it needs to become proper muted text.
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] span[style*="color: '#374151'"],
html[data-theme="light"] span[style*="color: #374151"],
html[data-theme="light"] div[style*="color: '#374151'"],
html[data-theme="light"] div[style*="color: #374151"],
html[data-theme="light"] p[style*="color: '#374151'"],
html[data-theme="light"] p[style*="color: #374151"] {
  color: #94A3B8 !important;
}

/* #1F2937 — nearly invisible on light */
html[data-theme="light"] div[style*="color: '#1F2937'"],
html[data-theme="light"] div[style*="color: #1F2937"],
html[data-theme="light"] span[style*="color: '#1F2937'"],
html[data-theme="light"] span[style*="color: #1F2937"] {
  color: #94A3B8 !important;
}

/* Warm dark text used in VotePage (sidebar info, category desc) */
html[data-theme="light"] div[style*="color: '#6b4f35'"],
html[data-theme="light"] div[style*="color:'#6b4f35'"],
html[data-theme="light"] p[style*="color: '#6b4f35'"],
html[data-theme="light"] p[style*="color:'#6b4f35'"],
html[data-theme="light"] span[style*="color: '#6b4f35'"],
html[data-theme="light"] span[style*="color:'#6b4f35'"] {
  color: #64748B !important;
}
html[data-theme="light"] div[style*="color: '#4a3828'"],
html[data-theme="light"] div[style*="color:'#4a3828'"],
html[data-theme="light"] span[style*="color: '#4a3828'"],
html[data-theme="light"] span[style*="color:'#4a3828'"] {
  color: #78716C !important;
}
html[data-theme="light"] div[style*="color: '#2e2016'"],
html[data-theme="light"] div[style*="color:'#2e2016'"],
html[data-theme="light"] span[style*="color: '#2e2016'"],
html[data-theme="light"] span[style*="color:'#2e2016'"] {
  color: #92837C !important;
}
html[data-theme="light"] div[style*="color: '#4B5563'"],
html[data-theme="light"] div[style*="color:'#4B5563'"],
html[data-theme="light"] span[style*="color: '#4B5563'"],
html[data-theme="light"] span[style*="color:'#4B5563'"] {
  color: #94A3B8 !important;
}

/* Title/body text: #f1f5f9 / #e2e8f0 / #cbd5e1 on dark cards
   These are used on covers and stay white — but on non-card
   contexts (headers, section titles) they look fine on light too
   as they're rendered over the card's dark gradient overlay.
   Do NOT override these globally — they're intentionally white-on-dark. */


/* ══════════════════════════════════════════════════════════════
   VOTE PAGE — inline dark backgrounds
══════════════════════════════════════════════════════════════ */

/* Main page wrapper with minHeight + background */
html[data-theme="light"] div[style*="minHeight:'100vh'"][style*="background:'#0f0b09'"],
html[data-theme="light"] div[style*="min-height: 100vh"][style*="background: '#0f0b09'"],
html[data-theme="light"] div[style*="background: '#0f0b09'"] {
  background: #F1F5F9 !important;
}

/* Vote page hero section */
html[data-theme="light"] div[style*="linear-gradient(160deg,#130a1c"],
html[data-theme="light"] div[style*="linear-gradient(160deg, #130a1c"] {
  background: linear-gradient(160deg, #E8ECF2 0%, #F1F5F9 60%) !important;
}

/* Vote page mobile sticky tabs bar */
html[data-theme="light"] div[style*="background:'rgba(15,11,9,0.97)'"],
html[data-theme="light"] div[style*="background: rgba(15,11,9,0.97)"] {
  background: rgba(241,245,249,0.97) !important;
  backdrop-filter: blur(12px);
}

/* Vote page sidebar (desktop) */
html[data-theme="light"] aside[style*="background:'#0f0b09'"],
html[data-theme="light"] aside[style*="background: '#0f0b09'"],
html[data-theme="light"] aside[style*="background:#0f0b09"] {
  background: #F1F5F9 !important;
  border-right-color: rgba(0,0,0,0.08) !important;
}

/* Vote card surfaces */
html[data-theme="light"] div[style*="background:'rgba(255,248,240,0.02)'"],
html[data-theme="light"] div[style*="background: rgba(255,248,240,0.06)"] {
  background: rgba(0,0,0,0.02) !important;
}
html[data-theme="light"] div[style*="background:'#130d08'"],
html[data-theme="light"] div[style*="background: '#130d08'"],
html[data-theme="light"] div[style*="background:#130d08"] {
  background: #CBD5E1 !important;
}

/* Vote card search input */
html[data-theme="light"] input[style*="background:'rgba(255,248,240,0.04)'"],
html[data-theme="light"] input[style*="background: rgba(255,248,240,0.04)"] {
  background: rgba(0,0,0,0.04) !important;
  color: #0F172A !important;
}

/* Vote page section dividers */
html[data-theme="light"] div[style*="border-bottom:'1px solid rgba(255,248,240,0.07)'"],
html[data-theme="light"] div[style*="border-bottom: 1px solid rgba(255,248,240,0.07)"],
html[data-theme="light"] div[style*="borderBottom:'1px solid rgba(255,248,240,0.07)'"] {
  border-bottom-color: rgba(0,0,0,0.08) !important;
}
html[data-theme="light"] div[style*="border-top:'1px solid rgba(255,248,240,0.06)'"],
html[data-theme="light"] div[style*="borderTop:'1px solid rgba(255,248,240,0.06)'"] {
  border-top-color: rgba(0,0,0,0.07) !important;
}


/* ══════════════════════════════════════════════════════════════
   RANKING PAGE — SVG chart circles (dark stroke for dot outline)
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] circle[stroke="#0a0f1e"] { stroke: #fff; }
html[data-theme="light"] line[stroke="rgba(255,255,255,0.05)"] {
  stroke: rgba(0,0,0,0.07);
}
html[data-theme="light"] text[fill="#374151"] { fill: #94A3B8; }

/* Ranking page nav buttons */
html[data-theme="light"] button[style*="background: 'rgba(255,255,255,0.04)'"],
html[data-theme="light"] button[style*="background: rgba(255,255,255,0.04)"] {
  background: rgba(0,0,0,0.05) !important;
  border-color: rgba(0,0,0,0.1) !important;
  color: #475569 !important;
}


/* ══════════════════════════════════════════════════════════════
   SCHEDULE PAGE
══════════════════════════════════════════════════════════════ */

/* Schedule detail modal dark bg */
html[data-theme="light"] div[style*="linear-gradient(145deg,#0d1117,#1a1a2e)"],
html[data-theme="light"] div[style*="linear-gradient(145deg, #0d1117"] {
  background: #fff !important;
}

/* Schedule item rows */
html[data-theme="light"] div[style*="background: rgba(139,92,246,0.2)"] {
  background: rgba(139,92,246,0.12) !important;
}

/* Date mode pill buttons (default state) */
html[data-theme="light"] button[style*="background: 'rgba(255,255,255,0.04)'"],
html[data-theme="light"] button[style*="background: rgba(255,255,255,0.03)"] {
  background: rgba(0,0,0,0.04) !important;
  border-color: rgba(0,0,0,0.09) !important;
}


/* ══════════════════════════════════════════════════════════════
   MY LIST PAGE
══════════════════════════════════════════════════════════════ */

/* Edit entry modal dark gradient */
html[data-theme="light"] div[style*="linear-gradient(145deg,#0f0f1a,#1a1a2e)"] {
  background: #fff !important;
  border-color: rgba(139,92,246,0.25) !important;
}

/* Entry card row */
html[data-theme="light"] div[style*="background: 'rgba(255,255,255,0.02)'"] {
  background: rgba(0,0,0,0.02) !important;
}

/* Review quote text */
html[data-theme="light"] div[style*="color: '#475569'"] { color: #64748B !important; }


/* ══════════════════════════════════════════════════════════════
   ADMIN PAGE — inline surfaces
   (AdminPage uses its own inline style system, just fix the
    page-level containers in case they hardcode dark colours)
══════════════════════════════════════════════════════════════ */
html[data-theme="light"] div[style*="background: '#0f0b09'"],
html[data-theme="light"] div[style*="background:'#0f0b09'"],
html[data-theme="light"] div[style*="background: #0f0b09"] {
  background: #F1F5F9 !important;
}

/* ══════════════════════════════════════════════════════════════
   SUPPLEMENTAL — sort sub-bar & page footer
══════════════════════════════════════════════════════════════ */
/* Sort sub-bar below header */
html[data-theme="light"] div[style*="background: rgba(0,0,0,0.3)"] {
  background: rgba(0,0,0,0.04) !important;
  border-bottom-color: rgba(0,0,0,0.06) !important;
}
/* Sort buttons in sub-bar */
html[data-theme="light"] .sort-btn {
  color: #475569 !important;
  border-color: rgba(0,0,0,0.1) !important;
  background: rgba(0,0,0,0.04) !important;
}
/* Page footer text */
html[data-theme="light"] footer.page-footer {
  color: #64748B !important;
  border-top-color: rgba(0,0,0,0.06) !important;
}
/* Hero banner sub separator dot */
html[data-theme="light"] .hero-banner__sub span[style*="color: '#374151'"] {
  color: #94A3B8 !important;
}
/* Skeleton shimmer in light mode */
html[data-theme="light"] div[style*="linear-gradient(90deg,#1a1a2e"],
html[data-theme="light"] div[style*="linear-gradient(90deg,#060d1a"],
html[data-theme="light"] div[style*="linear-gradient(90deg,#1f2937"] {
  background: linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%) !important;
  background-size: 200% 100% !important;
}

/* ══════════════════════════════════════════════════════════════
   DETAIL PAGES (AnimeDetailPage, MangaDetailPage, SeriesDetailPage)
   Detail pages use many inline styles, so we target specific patterns
   that appear in these pages
   ══════════════════════════════════════════════════════════════ */

/* Detail page hero background */
html[data-theme="light"] div[style*="background:'#040810'"],
html[data-theme="light"] div[style*="background: '#040810'"],
html[data-theme="light"] div[style*="background:#040810"] {
  background: #F1F5F9 !important;
}

/* Detail page sidebar (desktop) */
html[data-theme="light"] aside[style*="background:'#0f0b09'"],
html[data-theme="light"] aside[style*="background: '#0f0b09'"] {
  background: #fff !important;
  border-right-color: rgba(0,0,0,0.08) !important;
}

/* Detail page section tabs */
html[data-theme="light"] button[style*="color: '#a08060'"] {
  color: #64748B !important;
}

/* Detail page content text colors */
html[data-theme="light"] h1[style*="color: '#f1f5f9'"],
html[data-theme="light"] div[style*="color: '#e2e8f0'"],
html[data-theme="light"] div[style*="color:'#e2e8f0'"],
html[data-theme="light"] span[style*="color: '#e2e8f0'"],
html[data-theme="light"] span[style*="color:'#e2e8f0'"] {
  color: #1E293B !important;
}

/* Detail page secondary text */
html[data-theme="light"] div[style*="color: '#4a8090'"],
html[data-theme="light"] div[style*="color: '#2a6070'"],
html[data-theme="light"] div[style*="color: '#6a9aaa'"],
html[data-theme="light"] div[style*="color:'#4a8090'"],
html[data-theme="light"] div[style*="color:'#2a6070'"],
html[data-theme="light"] div[style*="color:'#6a9aaa'"] {
  color: #64748B !important;
}

/* Detail page stat chips */
html[data-theme="light"] div[style*="background:'rgba(100,200,255,0.04)'"],
html[data-theme="light"] div[style*="background: rgba(100,200,255,0.04)"] {
  background: rgba(0,0,0,0.03) !important;
  border-color: rgba(0,0,0,0.08) !important;
}

/* Detail page genre tags */
html[data-theme="light"] span[style*="color:'#67E8F9'"],
html[data-theme="light"] span[style*="color: '#67E8F9'"] {
  color: #0891B2 !important;
}

/* Detail page table rows */
html[data-theme="light"] tr[style*="border-bottom"],
html[data-theme="light"] td[style*="color: '#2a6070'"],
html[data-theme="light"] td[style*="color:'#2a6070'"],
html[data-theme="light"] td[style*="color: '#8ac8d8'"],
html[data-theme="light"] td[style*="color:'#8ac8d8'"] {
  color: #475569 !important;
  border-bottom-color: rgba(0,0,0,0.06) !important;
}

/* Detail page section titles */
html[data-theme="light"] h2[style*="color:'#f1f5f9'"],
html[data-theme="light"] h2[style*="color: '#f1f5f9'"],
html[data-theme="light"] h3[style*="color: '#f1f5f9'"],
html[data-theme="light"] h3[style*="color:'#f1f5f9'"] {
  color: #0F172A !important;
}

/* Detail page mini cards */
html[data-theme="light"] div[style*="background:'#050c18'"],
html[data-theme="light"] div[style*="background: '#050c18'"] {
  background: #E2E8F0 !important;
}

/* Detail page placeholder */
html[data-theme="light"] p[style*="color:'#2a6070'"],
html[data-theme="light"] p[style*="color: '#2a6070'"] {
  color: #64748B !important;
}

/* Detail page action buttons */
html[data-theme="light"] a[style*="color:'#67E8F9'"],
html[data-theme="light"] a[style*="color: '#67E8F9'"] {
  color: #0891B2 !important;
}
`

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('lidex_theme') || 'dark' } catch { return 'dark' }
  })

  // Apply data-theme to <html> on every change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('lidex_theme', theme) } catch {}
  }, [theme])

  // Inject once on mount
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
