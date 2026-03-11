import React, { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { AuthModal } from '../components/AuthModal.jsx'
import { PURPLE, CYAN, ROSE } from '../constants.js'

const TABS = [
  {
    path:    '#/novels',
    icon:    '📖',
    color:   PURPLE,
    titleKey:'nav_novels',
    descKey: 'land_novels_desc',
    grad:    'linear-gradient(135deg,#2a1f10,#1a1410)',
    sample:  ['Overlord','Sword Art Online','Re:Zero','Mushoku Tensei','Konosuba'],
  },
  {
    path:    '#/anime',
    icon:    '🎌',
    color:   CYAN,
    titleKey:'nav_anime',
    descKey: 'land_anime_desc',
    grad:    'linear-gradient(135deg,#0c1a2e,#1a1410)',
    sample:  ['Fullmetal Alchemist','Attack on Titan','Demon Slayer','One Piece','Naruto'],
  },
  {
    path:    '#/manga',
    icon:    '📚',
    color:   ROSE,
    titleKey:'nav_manga',
    descKey: 'land_manga_desc',
    grad:    'linear-gradient(135deg,#1a0a0f,#1a1410)',
    sample:  ['One Piece','Berserk','Vagabond','Vinland Saga','JoJo'],
  },
  {
    path:    '#/vote',
    icon:    '🗳️',
    color:   '#F59E0B',
    titleKey:'nav_vote',
    descKey: 'land_vote_desc',
    grad:    'linear-gradient(135deg,#1a1200,#1a1410)',
    sample:  ['Vote monthly','See rankings','Track trends','Support favourites','Compete'],
  },
]

function TabCard({ tab, t, isMobile }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={tab.path}
      style={{ textDecoration: 'none', display: 'flex' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: isMobile ? 14 : 0,
        background:  tab.grad,
        border:      `1px solid ${hovered ? tab.color + '60' : 'rgba(255,248,240,0.06)'}`,
        borderRadius: 16,
        padding:     isMobile ? '16px 18px' : '28px 24px',
        cursor:      'pointer',
        transition:  'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.2s',
        transform:   hovered && !isMobile ? 'translateY(-6px) scale(1.02)' : 'none',
        boxShadow:   hovered ? `0 16px 48px ${tab.color}28, 0 4px 16px rgba(0,0,0,0.4)` : '0 2px 12px rgba(0,0,0,0.25)',
      }}>
        {/* Icon */}
        <div style={{
          width: isMobile ? 44 : 52, height: isMobile ? 44 : 52,
          borderRadius: 12, flexShrink: 0,
          background: `${tab.color}20`, border: `1px solid ${tab.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMobile ? 22 : 26,
          marginBottom: isMobile ? 0 : 16,
        }}>
          {tab.icon}
        </div>

        {/* Text group */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: isMobile ? 18 : 22,
            fontWeight: 700,
            color: '#fff', letterSpacing: 1,
            marginBottom: isMobile ? 4 : 6,
          }}>
            {t(tab.titleKey)}
          </div>

          <div style={{
            color: '#7a6045', fontSize: isMobile ? 12 : 13,
            lineHeight: 1.6,
            marginBottom: isMobile ? 0 : 18,
            flex: isMobile ? 0 : 1,
          }}>
            {t(tab.descKey)}
          </div>

          {/* Sample titles — hidden on mobile to keep rows compact */}
          {!isMobile && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 20, flexShrink: 0 }}>
              {tab.sample.map(s => (
                <span key={s} style={{
                  background: `${tab.color}12`,
                  border:     `1px solid ${tab.color}25`,
                  color:      tab.color,
                  fontSize:   10, padding: '2px 8px', borderRadius: 20,
                  opacity: 0.8,
                }}>{s}</span>
              ))}
            </div>
          )}

          {/* Arrow */}
          {!isMobile && (
            <div style={{
              color: tab.color, fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: hovered ? 1 : 0.45, transition: 'opacity 0.2s', flexShrink: 0,
            }}>
              {t('land_enter')} →
            </div>
          )}
        </div>

        {/* Mobile arrow */}
        {isMobile && (
          <div style={{ color: tab.color, opacity: 0.6, fontSize: 18, flexShrink: 0 }}>›</div>
        )}
      </div>
    </a>
  )
}

export function LandingPage() {
  const { t, lang, toggleLang } = useLang()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    const onResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize) }
  }, [])

  // Listen for nt:open-auth events from other components
  useEffect(() => {
    const handler = e => { setAuthMode(e.detail?.mode || 'login'); setAuthOpen(true) }
    window.addEventListener('nt:open-auth', handler)
    return () => window.removeEventListener('nt:open-auth', handler)
  }, [])

  const openAuth = (mode) => { setAuthMode(mode); setAuthOpen(true) }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0b09',
      opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease',
    }}>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} initialMode={authMode} />}

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${PURPLE}26`,
        padding: '0 16px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          minHeight: isMobile ? 54 : 62, gap: 12,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: PURPLE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: '#fff', fontWeight: 800,
            }}>NT</div>
            {!isMobile && (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: 2, color: '#fff' }}>
                NOVEL<span style={{ color: PURPLE }}>TREND</span>
              </span>
            )}
          </div>

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Language */}
            <button onClick={toggleLang} style={{
              background: 'rgba(255,248,240,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8', padding: isMobile ? '6px 10px' : '6px 14px',
              borderRadius: 10, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {lang === 'vi' ? 'EN' : 'VI'}
            </button>

            {user ? (
              /* Already logged in — go to app */
              <a href="#/novels" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: `${PURPLE}20`, border: `1px solid ${PURPLE}50`,
                color: '#C4B5FD', padding: isMobile ? '7px 12px' : '7px 16px',
                borderRadius: 10, textDecoration: 'none',
                fontSize: 13, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>
                {isMobile ? '→' : (lang === 'vi' ? 'Vào app →' : 'Enter app →')}
              </a>
            ) : (<>
              <button onClick={() => openAuth('login')} style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                color: '#94A3B8', padding: isMobile ? '7px 12px' : '7px 16px',
                borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
                transition: 'border-color 0.15s, color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#94A3B8' }}
              >
                {lang === 'vi' ? 'Đăng nhập' : 'Sign in'}
              </button>
              <button onClick={() => openAuth('register')} style={{
                background: PURPLE, border: 'none',
                color: '#fff', padding: isMobile ? '7px 12px' : '7px 18px',
                borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                boxShadow: `0 4px 16px ${PURPLE}50`, transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {lang === 'vi' ? 'Đăng ký' : 'Sign up'}
              </button>
            </>)}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg,#140f08,#110d0a,#0f0b09)',
        padding: isMobile ? '52px 20px 44px' : '80px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', top: -100, left: '20%', width: 500, height: 320,
          background: `radial-gradient(ellipse, ${PURPLE}16 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -50, right: '15%', width: 400, height: 260,
          background: `radial-gradient(ellipse, ${CYAN}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isMobile ? 11 : 14, color: PURPLE,
          letterSpacing: 4, marginBottom: 14, textTransform: 'uppercase',
        }}>
          NovelTrend
        </div>

        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isMobile ? 'clamp(32px,10vw,48px)' : 'clamp(40px,7vw,80px)',
          lineHeight: 1.05, letterSpacing: isMobile ? 1 : 2,
          margin: '0 0 16px', color: '#fff',
        }}>
          {t('land_tagline')}
        </h1>

        <p style={{
          color: '#7a6045', fontSize: isMobile ? 14 : 'clamp(14px,2vw,18px)',
          margin: '0 auto 32px', maxWidth: 480, lineHeight: 1.7,
          padding: '0 8px',
        }}>
          {t('land_sub')}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#/novels" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: PURPLE, color: '#fff',
            padding: isMobile ? '12px 28px' : '14px 36px',
            borderRadius: 14,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: isMobile ? 16 : 18, letterSpacing: 1,
            textDecoration: 'none', boxShadow: `0 8px 28px ${PURPLE}50`,
          }}>
            {t('land_enter')} →
          </a>
          {!user && (
            <button onClick={() => openAuth('register')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,248,240,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#94A3B8',
              padding: isMobile ? '12px 24px' : '14px 32px',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: isMobile ? 16 : 18, letterSpacing: 1,
            }}>
              {lang === 'vi' ? 'Tạo tài khoản' : 'Create account'}
            </button>
          )}
        </div>
      </div>

      {/* ── Section cards ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '28px 14px 48px' : '48px 24px 64px' }}>
        {/* Section label */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11, letterSpacing: 3, color: '#3d2e1e',
          textTransform: 'uppercase', marginBottom: isMobile ? 16 : 24,
        }}>
          {lang === 'vi' ? 'Khám phá' : 'Explore'}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: isMobile ? 10 : 20,
          alignItems: 'stretch',
        }}>
          {TABS.map((tab, i) => (
            <TabCard key={tab.path} tab={tab} t={t} isMobile={isMobile} />
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,248,240,0.05)',
        padding: isMobile ? '16px 16px' : '20px 24px',
        textAlign: 'center', color: '#3d2e1e', fontSize: 11,
      }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: PURPLE, fontSize: 13, letterSpacing: 2 }}>NOVELTREND</span>
        {` · ${t('footer_powered')} RanobeDB, AniList & MangaDex · `}{new Date().getFullYear()}
      </footer>
    </div>
  )
}


const TABS = [
  {
    path:    '#/novels',
    icon:    '📖',
    color:   PURPLE,
    titleKey:'nav_novels',
    descKey: 'land_novels_desc',
    grad:    'linear-gradient(135deg,#2a1f10,#1a1410)',
    sample:  ['Overlord','Sword Art Online','Re:Zero','Mushoku Tensei','Konosuba'],
  },
  {
    path:    '#/anime',
    icon:    '🎌',
    color:   CYAN,
    titleKey:'nav_anime',
    descKey: 'land_anime_desc',
    grad:    'linear-gradient(135deg,#0c1a2e,#1a1410)',
    sample:  ['Fullmetal Alchemist','Attack on Titan','Demon Slayer','One Piece','Naruto'],
  },
  {
    path:    '#/manga',
    icon:    '📚',
    color:   ROSE,
    titleKey:'nav_manga',
    descKey: 'land_manga_desc',
    grad:    'linear-gradient(135deg,#1a0a0f,#1a1410)',
    sample:  ['One Piece','Berserk','Vagabond','Vinland Saga','JoJo'],
  },
  {
    path:    '#/vote',
    icon:    '🗳️',
    color:   '#F59E0B',
    titleKey:'nav_vote',
    descKey: 'land_vote_desc',
    grad:    'linear-gradient(135deg,#1a1200,#1a1410)',
    sample:  ['Vote monthly','See rankings','Track trends','Support favourites','Compete'],
  },
]
