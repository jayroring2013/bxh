import React, { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { PURPLE, CYAN, ROSE } from '../constants.js'

const TABS = [
  {
    path:    '#/novels',
    icon:    '📖',
    color:   PURPLE,
    titleKey:'nav_novels',
    descKey: 'land_novels_desc',
    grad:    'linear-gradient(135deg,#1e1b4b,#0f172a)',
    sample:  ['Overlord','Sword Art Online','Re:Zero','Mushoku Tensei','Konosuba'],
  },
  {
    path:    '#/anime',
    icon:    '🎌',
    color:   CYAN,
    titleKey:'nav_anime',
    descKey: 'land_anime_desc',
    grad:    'linear-gradient(135deg,#0c1a2e,#0f172a)',
    sample:  ['Fullmetal Alchemist','Attack on Titan','Demon Slayer','One Piece','Naruto'],
  },
  {
    path:    '#/manga',
    icon:    '📚',
    color:   ROSE,
    titleKey:'nav_manga',
    descKey: 'land_manga_desc',
    grad:    'linear-gradient(135deg,#1a0a0f,#0f172a)',
    sample:  ['One Piece','Berserk','Vagabond','Vinland Saga','JoJo'],
  },
  {
    path:    '#/vote',
    icon:    '🗳️',
    color:   '#F59E0B',
    titleKey:'nav_vote',
    descKey: 'land_vote_desc',
    grad:    'linear-gradient(135deg,#1a1200,#0f172a)',
    sample:  ['Vote monthly','See rankings','Track trends','Support favourites','Compete'],
  },
]

function TabCard({ tab, t, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={tab.path}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background:  tab.grad,
        border:      `1px solid ${hovered ? tab.color + '60' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 20,
        padding:     '28px 24px',
        cursor:      'pointer',
        transition:  'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.3s',
        transform:   hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow:   hovered ? `0 20px 60px ${tab.color}30, 0 8px 20px rgba(0,0,0,0.5)` : '0 4px 20px rgba(0,0,0,0.3)',
        animationDelay: `${index * 0.1}s`,
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `${tab.color}20`, border: `1px solid ${tab.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 16,
        }}>
          {tab.icon}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: 22,
          color: '#fff', letterSpacing: 1, marginBottom: 6,
        }}>
          {t(tab.titleKey)}
        </div>

        {/* Description */}
        <div style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
          {t(tab.descKey)}
        </div>

        {/* Sample titles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
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

        {/* Arrow */}
        <div style={{
          marginTop: 20, color: tab.color, fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
          opacity: hovered ? 1 : 0.5, transition: 'opacity 0.2s',
        }}>
          {t('land_enter')} →
        </div>
      </div>
    </a>
  )
}

export function LandingPage() {
  const { t, lang, toggleLang } = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${PURPLE}26`,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', minHeight: 62 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: PURPLE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: '#fff' }}>NT</div>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: 2 }}>
              NOVEL<span style={{ color: PURPLE }}>TREND</span>
            </span>
          </div>
          {/* Language toggle */}
          <button onClick={toggleLang} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', padding: '6px 14px', borderRadius: 10, cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🌐 {lang === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg,#0f0c29,#080d1a,#0a0a0f)',
        padding: '80px 24px 60px', textAlign: 'center',
      }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -100, left: '25%', width: 500, height: 300,
          background: `radial-gradient(ellipse, ${PURPLE}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -50, right: '20%', width: 400, height: 250,
          background: `radial-gradient(ellipse, ${CYAN}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ fontFamily: "'Bebas Neue', cursive",
          fontSize: 'clamp(14px,2vw,18px)', color: PURPLE,
          letterSpacing: 4, marginBottom: 16 }}>
          NOVELTREND
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 'clamp(36px,7vw,80px)',
          lineHeight: 1, letterSpacing: 2,
          marginBottom: 20, color: '#fff',
        }}>
          {t('land_tagline')}
        </h1>

        <p style={{ color: '#64748B', fontSize: 'clamp(14px,2vw,18px)',
          marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
          {t('land_sub')}
        </p>

        <a href="#/novels" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: PURPLE, color: '#fff',
          padding: '14px 36px', borderRadius: 14,
          fontFamily: "'Bebas Neue', cursive", fontSize: 18, letterSpacing: 1,
          textDecoration: 'none', boxShadow: `0 8px 32px ${PURPLE}50`,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          {t('land_enter')} →
        </a>
      </div>

      {/* Tab cards */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 64px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 20,
        }}>
          {TABS.map((tab, i) => (
            <TabCard key={tab.path} tab={tab} t={t} index={i} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 24px', textAlign: 'center', color: '#374151', fontSize: 12,
      }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", color: PURPLE,
          fontSize: 14, letterSpacing: 2 }}>NOVELTREND</span>
        {` · ${t('footer_powered')} RanobeDB, AniList & MangaDex · `}{new Date().getFullYear()}
      </footer>
    </div>
  )
}
