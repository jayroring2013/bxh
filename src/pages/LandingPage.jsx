import React, { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { AuthModal } from '../components/AuthModal.jsx'
import { PURPLE, CYAN, ROSE } from '../constants.js'

// ── Inline SVG icons (Lucide-style) ──────────────────────────────
const BookIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const TvIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>
  </svg>
)
const BookOpenIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const VoteIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)
const GlobeIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const UserIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

const TABS = [
  { path:'#/novels',  Icon:BookIcon,     color:PURPLE,     titleKey:'nav_novels', descKey:'land_novels_desc', grad:'linear-gradient(135deg,#2a1f10,#1a1410)', sample:['Overlord','Sword Art Online','Re:Zero','Mushoku Tensei','Konosuba'] },
  { path:'#/anime',   Icon:TvIcon,       color:CYAN,       titleKey:'nav_anime',  descKey:'land_anime_desc',  grad:'linear-gradient(135deg,#0c1a2e,#1a1410)', sample:['Fullmetal Alchemist','Attack on Titan','Demon Slayer','One Piece','Naruto'] },
  { path:'#/manga',   Icon:BookOpenIcon, color:ROSE,       titleKey:'nav_manga',  descKey:'land_manga_desc',  grad:'linear-gradient(135deg,#1a0a0f,#1a1410)', sample:['One Piece','Berserk','Vagabond','Vinland Saga','JoJo'] },
  { path:'#/vote',    Icon:VoteIcon,     color:'#F59E0B',  titleKey:'nav_vote',   descKey:'land_vote_desc',   grad:'linear-gradient(135deg,#1a1200,#1a1410)', sample:['Vote monthly','See rankings','Track trends','Support favourites','Compete'] },
]

function TabCard({ tab, t, isMobile, isLight }) {
  const [hovered, setHovered] = useState(false)
  const { Icon } = tab

  return (
    <a href={tab.path} style={{ textDecoration:'none', display:'flex' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        flex:1, display:'flex',
        flexDirection: isMobile ? 'row' : 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: isMobile ? 14 : 0,
        background: isLight ? (hovered ? `${tab.color}10` : 'rgba(0,0,0,0.03)') : tab.grad,
        border:`1px solid ${hovered ? tab.color+'60' : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,248,240,0.06)')}`,
        borderRadius:16, padding: isMobile ? '16px 18px' : '28px 24px', cursor:'pointer',
        transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.2s',
        transform: hovered && !isMobile ? 'translateY(-6px) scale(1.02)' : 'none',
        boxShadow: hovered ? `0 16px 48px ${tab.color}28, 0 4px 16px rgba(0,0,0,0.12)` : (isLight ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.25)'),
      }}>
        <div style={{
          width: isMobile?44:52, height: isMobile?44:52, borderRadius:12, flexShrink:0,
          background:`${tab.color}20`, border:`1px solid ${tab.color}40`,
          display:'flex', alignItems:'center', justifyContent:'center',
          marginBottom: isMobile ? 0 : 18,
        }}>
          <Icon size={isMobile?20:24} color={tab.color} />
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile?17:22, fontWeight:700,
            color: isLight ? '#0F172A' : '#fff', letterSpacing:0.8, marginBottom: isMobile?3:6 }}>
            {t(tab.titleKey)}
          </div>
          <div style={{ color: isLight ? '#64748B' : '#7a6045', fontSize: isMobile?12:13, lineHeight:1.6, marginBottom: isMobile?0:18, flex: isMobile?0:1 }}>
            {t(tab.descKey)}
          </div>
          {!isMobile && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:20, flexShrink:0 }}>
              {tab.sample.map(s => (
                <span key={s} style={{ background:`${tab.color}12`, border:`1px solid ${tab.color}25`, color:tab.color, fontSize:10, padding:'2px 8px', borderRadius:20, opacity:0.8 }}>{s}</span>
              ))}
            </div>
          )}
          {!isMobile && (
            <div style={{ color:tab.color, fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6, opacity: hovered?1:0.45, transition:'opacity 0.2s', flexShrink:0 }}>
              {t('land_enter')} →
            </div>
          )}
        </div>

        {isMobile && <div style={{ color:tab.color, opacity:0.6, fontSize:20, flexShrink:0, lineHeight:1 }}>›</div>}
      </div>
    </a>
  )
}

export function LandingPage() {
  const { t, lang, toggleLang } = useLang()
  const { user } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
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

  useEffect(() => {
    const handler = e => { setAuthMode(e.detail?.mode || 'login'); setAuthOpen(true) }
    window.addEventListener('nt:open-auth', handler)
    return () => window.removeEventListener('nt:open-auth', handler)
  }, [])

  const openAuth = (mode) => { setAuthMode(mode); setAuthOpen(true) }

  return (
    <div style={{ minHeight:'100vh', background: isLight ? '#F1F5F9' : '#0f0b09', opacity: visible?1:0, transition:'opacity 0.5s ease' }}>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} initialMode={authMode} />}

      {/* ── Header ── */}
      <header style={{ position:'sticky', top:0, zIndex:100, background: isLight ? 'rgba(241,245,249,0.96)' : 'rgba(10,10,15,0.96)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${isLight ? 'rgba(0,0,0,0.08)' : PURPLE+'26'}`, padding:'0 16px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight: isMobile?54:62, gap:12 }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:PURPLE, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, color:'#fff', fontWeight:900, letterSpacing:0.5 }}>Li</div>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile?18:22, letterSpacing:2, color: isLight ? '#0F172A' : '#fff', fontWeight:700 }}>
              Li<span style={{ color:PURPLE }}>Dex</span>
            </span>
          </div>

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Language */}
            <button onClick={toggleLang} style={{ display:'flex', alignItems:'center', gap:5, background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,248,240,0.06)', border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)', color: isLight ? '#475569' : '#94A3B8', padding:'6px 10px', borderRadius:10, cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:"'Be Vietnam Pro',sans-serif" }}>
              <GlobeIcon />{lang==='vi'?'EN':'VI'}
            </button>

            {/* Auth buttons — 3 states: logged in / mobile guest / desktop guest */}
            {user ? (
              <a href="#/novels" style={{ display:'inline-flex', alignItems:'center', gap:6, background:`${PURPLE}22`, border:`1px solid ${PURPLE}55`, color:'#C4B5FD', padding:'7px 16px', borderRadius:10, textDecoration:'none', fontSize:13, fontWeight:700, fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                {lang==='vi' ? 'Vào app →' : 'Enter app →'}
              </a>
            ) : isMobile ? (
              /* Mobile: single button that opens login modal (user can switch to register inside) */
              <button onClick={() => openAuth('login')} style={{ display:'flex', alignItems:'center', gap:6, background:PURPLE, border:'none', color:'#fff', padding:'7px 14px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:"'Be Vietnam Pro',sans-serif", boxShadow:`0 4px 14px ${PURPLE}50` }}>
                <UserIcon size={14} />
                {lang==='vi' ? 'Đăng nhập' : 'Sign in'}
              </button>
            ) : (
              /* Desktop: separate Sign in + Sign up */
              <>
                <button onClick={() => openAuth('login')} style={{ background:'none', border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.12)', color: isLight ? '#1E293B' : '#94A3B8', padding:'7px 16px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:"'Be Vietnam Pro',sans-serif", transition:'border-color 0.15s,color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor= isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'; e.currentTarget.style.color= isLight ? '#0F172A' : '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor= isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'; e.currentTarget.style.color= isLight ? '#1E293B' : '#94A3B8' }}>
                  {lang==='vi' ? 'Đăng nhập' : 'Sign in'}
                </button>
                <button onClick={() => openAuth('register')} style={{ background:PURPLE, border:'none', color:'#fff', padding:'7px 18px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:"'Be Vietnam Pro',sans-serif", boxShadow:`0 4px 16px ${PURPLE}50`, transition:'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  {lang==='vi' ? 'Đăng ký' : 'Sign up'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ position:'relative', overflow:'hidden',
        background: isLight
          ? 'linear-gradient(160deg,#EEF2F7,#F1F5F9)'
          : 'linear-gradient(160deg,#140f08,#110d0a,#0f0b09)',
        padding: isMobile?'52px 20px 44px':'80px 24px 64px', textAlign:'center' }}>
        <div style={{ position:'absolute', top:-100, left:'20%', width:500, height:320, background:`radial-gradient(ellipse, ${PURPLE}16 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-50, right:'15%', width:400, height:260, background:`radial-gradient(ellipse, ${CYAN}10 0%, transparent 70%)`, pointerEvents:'none' }} />

        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile?11:13, color:PURPLE, letterSpacing:5, marginBottom:14, textTransform:'uppercase' }}>LiDex</div>

        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile?'clamp(32px,10vw,48px)':'clamp(40px,7vw,80px)', lineHeight:1.05, letterSpacing: isMobile?1:2, margin:'0 0 16px', color: isLight ? '#0F172A' : '#fff' }}>
          {t('land_tagline')}
        </h1>

        <p style={{ color: isLight ? '#64748B' : '#7a6045', fontSize: isMobile?14:'clamp(14px,2vw,17px)', margin:'0 auto 36px', maxWidth:460, lineHeight:1.7, padding:'0 8px' }}>
          {t('land_sub')}
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <a href="#/novels" style={{ display:'inline-flex', alignItems:'center', gap:8, background:PURPLE, color:'#fff', padding: isMobile?'12px 28px':'14px 36px', borderRadius:14, fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile?16:18, letterSpacing:1, textDecoration:'none', boxShadow:`0 8px 28px ${PURPLE}50` }}>
            {t('land_enter')} →
          </a>
          {!user && (
            <button onClick={() => openAuth('register')} style={{ display:'inline-flex', alignItems:'center', gap:8,
              background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,248,240,0.06)',
              border: isLight ? '1px solid rgba(0,0,0,0.14)' : '1px solid rgba(255,255,255,0.12)',
              color: isLight ? '#1E293B' : '#94A3B8',
              padding: isMobile?'12px 24px':'14px 32px', borderRadius:14, cursor:'pointer',
              fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile?16:18, letterSpacing:1 }}>
              {lang==='vi' ? 'Tạo tài khoản' : 'Create account'}
            </button>
          )}
        </div>
      </div>

      {/* ── Section cards ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding: isMobile?'28px 14px 48px':'48px 24px 64px' }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:3, color: isLight ? '#64748B' : '#3d2e1e', textTransform:'uppercase', marginBottom: isMobile?16:24 }}>
          {lang==='vi' ? 'Khám phá' : 'Explore'}
        </div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(auto-fit,minmax(220px,1fr))', gap: isMobile?10:20, alignItems:'stretch' }}>
          {TABS.map(tab => <TabCard key={tab.path} tab={tab} t={t} isMobile={isMobile} isLight={isLight} />)}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,248,240,0.05)', padding: isMobile?'16px':'20px 24px', textAlign:'center', color: isLight ? '#64748B' : '#3d2e1e', fontSize:11 }}>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", color:PURPLE, fontSize:13, letterSpacing:2 }}>LIDEX</span>
        {` · ${t('footer_powered')} RanobeDB, AniList & MangaDex · `}{new Date().getFullYear()}
      </footer>
    </div>
  )
}
