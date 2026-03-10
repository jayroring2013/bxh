import React, { useState, useEffect, useRef } from 'react'
import { RANOBE, PURPLE, CYAN, ROSE } from '../constants.js'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { AppHeader, ErrorBox, PageFooter } from '../components/Shared.jsx'

// ── Colours ───────────────────────────────────────────────────────────────────
const GOLD   = '#F59E0B'
const SILVER = '#94A3B8'
const BRONZE = '#CD7F32'
const rankColor = r => r === 1 ? GOLD : r === 2 ? SILVER : r === 3 ? BRONZE : '#6B7280'
const rankBg    = r =>
  r === 1 ? 'linear-gradient(135deg,#FFD700,#FFA500)' :
  r === 2 ? 'linear-gradient(135deg,#C0C0C0,#A8A8A8)' :
  r === 3 ? 'linear-gradient(135deg,#CD7F32,#A0522D)' :
  'rgba(255,255,255,0.07)'

// ── Categories ────────────────────────────────────────────────────────────────
const CATS = [
  {
    id: 'novel', icon: '📖',
    label:   { vi: 'Light Novel', en: 'Light Novel' },
    desc:    { vi: 'Novel được yêu thích nhất tháng', en: 'Most loved novel of the month' },
    accent:  PURPLE,
  },
  {
    id: 'anime', icon: '📺',
    label:   { vi: 'Anime',       en: 'Anime' },
    desc:    { vi: 'Anime hay nhất đang chiếu',       en: 'Best currently airing anime' },
    accent:  CYAN,
  },
  {
    id: 'manga', icon: '📚',
    label:   { vi: 'Manga',       en: 'Manga' },
    desc:    { vi: 'Manga hay nhất đang phát hành',   en: 'Best currently releasing manga' },
    accent:  ROSE,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON)

async function sbGet(table, qs) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
  })
  const txt = await r.text()
  if (!r.ok) throw new Error(`${r.status}: ${txt}`)
  return JSON.parse(txt)
}

// ── Small components ──────────────────────────────────────────────────────────
function TrendArrow({ current, prev, t }) {
  if (!prev)          return <span style={{ color: CYAN,      fontSize: 11, fontWeight: 700 }}>★ {t('vote_trend_new')}</span>
  if (current < prev) return <span style={{ color: '#4ADE80', fontSize: 13 }}>▲</span>
  if (current > prev) return <span style={{ color: '#F87171', fontSize: 13 }}>▼</span>
  return                     <span style={{ color: '#64748B', fontSize: 11 }}>—</span>
}

function SkeletonGrid({ isMobile }) {
  return (
    <div style={{ display:'grid',
      gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(190px,1fr))',
      gap: isMobile ? 10 : 16 }}>
      {Array.from({ length: isMobile ? 6 : 12 }).map((_, i) => (
        <div key={i} style={{ height: isMobile ? 220 : 300, borderRadius:14,
          background:'linear-gradient(90deg,#1e1410 25%,#2a1f14 50%,#1e1410 75%)',
          backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
      ))}
    </div>
  )
}

// ── VoteCard ──────────────────────────────────────────────────────────────────
function VoteCard({ item, rank, voteCount, prevRank, hasVoted, onVote, voting, accent, t, isMobile }) {
  const [hov, setHov] = useState(false)
  const isTop3 = rank <= 3

  return (
    <div
      onMouseEnter={() => !isMobile && setHov(true)}
      onMouseLeave={() => !isMobile && setHov(false)}
      style={{
        position: 'relative', borderRadius: isMobile ? 12 : 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: isTop3 ? `${accent}09` : hov ? `${accent}06` : 'rgba(255,248,240,0.02)',
        border: `1px solid ${isTop3 ? (rank===1?'#FFD70045':rank===2?'#C0C0C045':'#CD7F3245') : hov ? `${accent}50` : 'rgba(255,248,240,0.06)'}`,
        transition: 'transform .22s ease, box-shadow .22s ease, border-color .15s',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 16px 36px ${accent}22, 0 4px 12px rgba(0,0,0,0.5)` : '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      {/* Rank badge */}
      <div style={{
        position:'absolute', top: isMobile ? 7 : 10, left: isMobile ? 7 : 10, zIndex:2,
        width: isMobile ? 26 : 34, height: isMobile ? 26 : 34, borderRadius:'50%',
        background: rankBg(rank), display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile ? 11 : 14,
        color: rank<=3?'#000':'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.6)',
        fontWeight: 800,
      }}>#{rank}</div>

      {/* Trend */}
      <div style={{ position:'absolute', top: isMobile ? 8 : 12, right: isMobile ? 8 : 12, zIndex:2 }}>
        <TrendArrow current={rank} prev={prevRank} t={t} />
      </div>

      {/* Cover */}
      <div style={{ position:'relative', height: isMobile ? 115 : 155, flexShrink:0, background:'#130d08', overflow:'hidden' }}>
        {item.cover_url
          ? <img src={item.cover_url} alt={item.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top',
                transition:'transform .3s', transform: hov?'scale(1.05)':'scale(1)' }}
              onError={e => { e.target.style.display='none' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize: isMobile ? 32 : 48, background:`${accent}12` }}>
              {item.emoji}
            </div>
        }
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40,
          background:'linear-gradient(to bottom,transparent,rgba(8,5,3,0.96))' }} />
      </div>

      {/* Body */}
      <div style={{ padding: isMobile ? '7px 9px 10px' : '10px 14px 14px', flex:1, display:'flex', flexDirection:'column', gap: isMobile ? 5 : 7 }}>
        <div>
          <div style={{
            fontFamily:"'Barlow Condensed',sans-serif", fontSize: isMobile ? 12 : 15,
            lineHeight:1.25, color:'#f1f5f9',
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>{item.title}</div>
          {!isMobile && item.sub && (
            <div style={{ fontSize:10, color:'#475569', marginTop:2,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.sub}</div>
          )}
        </div>

        {!isMobile && item.tags?.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {item.tags.map(tag => (
              <span key={tag} style={{ fontSize:10, padding:'2px 7px', borderRadius:20, fontWeight:600,
                background:`${accent}14`, border:`1px solid ${accent}28`, color:accent }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ flex:1 }} />

        {/* Vote count + button */}
        {isMobile ? (
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:2 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, lineHeight:1,
                color: isTop3 ? rankColor(rank) : accent, fontWeight:800 }}>
                {(voteCount||0).toLocaleString()}
              </span>
              <span style={{ color:'#475569', fontSize:9, letterSpacing:1, textTransform:'uppercase' }}>
                {t('vote_votes')}
              </span>
            </div>
            <button
              onClick={() => onVote(item)}
              disabled={hasVoted || voting}
              style={{
                width:'100%', background: hasVoted ? 'rgba(74,222,128,0.14)' : accent,
                border: `1px solid ${hasVoted ? 'rgba(74,222,128,0.4)' : accent}`,
                color: hasVoted ? '#4ADE80' : '#fff',
                padding:'7px 0', borderRadius:8,
                cursor: hasVoted ? 'default' : voting ? 'wait' : 'pointer',
                fontSize:11, fontWeight:700,
                opacity: voting && !hasVoted ? 0.55 : 1,
                transition:'all .18s', fontFamily:"'Be Vietnam Pro',sans-serif",
              }}>
              {hasVoted ? '✓ ' + t('vote_voted') : t('vote_cast')}
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:2 }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, lineHeight:1,
                color: isTop3 ? rankColor(rank) : accent }}>
                {(voteCount||0).toLocaleString()}
              </div>
              <div style={{ color:'#475569', fontSize:9, letterSpacing:1.5, textTransform:'uppercase' }}>
                {t('vote_votes')}
              </div>
            </div>
            <button
              onClick={() => onVote(item)}
              disabled={hasVoted || voting}
              style={{
                background: hasVoted ? 'rgba(74,222,128,0.14)' : accent,
                border: `1px solid ${hasVoted ? 'rgba(74,222,128,0.4)' : accent}`,
                color: hasVoted ? '#4ADE80' : '#fff',
                padding: '8px 16px', borderRadius:10,
                cursor: hasVoted ? 'default' : voting ? 'wait' : 'pointer',
                fontSize:12, fontWeight:700,
                opacity: voting && !hasVoted ? 0.55 : 1,
                transition:'all .18s', fontFamily:"'Be Vietnam Pro',sans-serif",
                boxShadow: hasVoted ? 'none' : `0 4px 14px ${accent}45`,
              }}>
              {hasVoted ? t('vote_voted') : t('vote_cast')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Per-category panel — lazy loads its own data ──────────────────────────────
function CategoryPanel({ cat, month, year, lang, token, t, isMobile }) {
  const [items,    setItems]   = useState([])
  const [votes,    setVotes]   = useState({})
  const [loading,  setLoading] = useState(true)
  const [error,    setError]   = useState(null)
  const [voting,   setVoting]  = useState(false)
  const [toast,    setToast]   = useState(null)
  const [search,   setSearch]  = useState('')

  const lsKey = `nt_voted_${cat.id}`
  const [votedIds, setVotedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(lsKey) || '[]')) }
    catch { return new Set() }
  })

  useEffect(() => {
    let alive = true
    setLoading(true); setError(null)
    Promise.all([loadItems(alive), loadVotes(alive)])
      .catch(e => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [cat.id])

  // ── Fetch candidate items ─────────────────────────────────────────────────
  async function loadItems(alive) {
    let rows = []
    if (cat.id === 'novel') {
      const [p1, p2] = await Promise.all([
        fetch(`${RANOBE}/series?limit=25&page=1&sort=Num.+books+desc&rl=ja`).then(r=>r.json()),
        fetch(`${RANOBE}/series?limit=25&page=2&sort=Num.+books+desc&rl=ja`).then(r=>r.json()),
      ])
      rows = [...(p1.series||[]), ...(p2.series||[])].map(s => ({
        id:        `novel_${s.id}`,
        title:     s.romaji || s.title || '',
        sub:       s.title && s.romaji && s.title !== s.romaji ? s.title : null,
        cover_url: s.book?.image?.filename ? `https://images.ranobedb.org/${s.book.image.filename}` : null,
        emoji:     '📖',
        tags:      [
          s.c_num_books ? `${s.c_num_books} ${t('meta_vols')}` : null,
          s.publication_status ? t(`status_${s.publication_status}`) || s.publication_status : null,
        ].filter(Boolean),
      }))
    } else if (cat.id === 'anime') {
      const data = await sbGet('anime',
        'select=id,title_english,title_romaji,cover_large,format,season,season_year,status&order=popularity.desc.nullslast&limit=50')
      rows = data.map(a => ({
        id:        `anime_${a.id}`,
        title:     a.title_english || a.title_romaji || '',
        sub:       a.title_romaji && a.title_english && a.title_romaji !== a.title_english ? a.title_romaji : null,
        cover_url: a.cover_large,
        emoji:     '📺',
        tags:      [a.format, a.season_year ? String(a.season_year) : null].filter(Boolean),
      }))
    } else {
      const data = await sbGet('manga',
        'select=id,title_en,title_ja_ro,cover_url,demographic,year,status&order=follows.desc.nullslast&limit=50')
      rows = data.map(m => ({
        id:        `manga_${m.id}`,
        title:     m.title_en || m.title_ja_ro || '',
        sub:       m.title_ja_ro && m.title_en && m.title_ja_ro !== m.title_en ? m.title_ja_ro : null,
        cover_url: m.cover_url,
        emoji:     '📚',
        tags:      [
          m.demographic ? m.demographic.charAt(0).toUpperCase()+m.demographic.slice(1) : null,
          m.year ? String(m.year) : null,
        ].filter(Boolean),
      }))
    }
    if (alive) setItems(rows)
  }

  // ── Fetch this month's votes for this category ────────────────────────────
  async function loadVotes(alive) {
    if (!isConfigured) return
    const prefix = cat.id + '_%'
    const data = await sbGet('novel_votes',
      `month=eq.${month}&year=eq.${year}&novel_id=like.${encodeURIComponent(prefix)}&order=vote_count.desc&limit=200`)
    const map = {}
    ;(data||[]).forEach(r => { map[r.novel_id] = r })
    if (alive) setVotes(map)
  }

  // ── Cast a vote ───────────────────────────────────────────────────────────
  const castVote = async (item) => {
    const key = `${item.id}-${month}-${year}`
    if (votedIds.has(key)) { flash(t('vote_already'), false); return }
    setVoting(true)
    try {
      const authHeader = token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON}`
      const res = await fetch(`${SUPABASE_URL}/functions/v1/vote`, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          novel_id:     item.id,
          novel_title:  item.title,
          novel_romaji: item.sub || item.title,
          cover_url:    item.cover_url || '',
          month, year,
        }),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      const newSet = new Set(votedIds)
      newSet.add(key)
      setVotedIds(newSet)
      localStorage.setItem(lsKey, JSON.stringify([...newSet]))
      if (res.status === 409 || data?.error === 'already_voted') {
        flash(t('vote_already'), false)
      } else {
        flash(t('vote_success'), true)
        await loadVotes(true)
      }
    } catch (e) {
      flash(`Network error: ${e.message}`, false)
    } finally {
      setVoting(false)
    }
  }

  const flash = (msg, ok) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  // ── Sort & filter ─────────────────────────────────────────────────────────
  const withVotes    = items.filter(n => votes[n.id]?.vote_count > 0)
    .sort((a,b) => (votes[b.id]?.vote_count??0) - (votes[a.id]?.vote_count??0))
  const withoutVotes = items.filter(n => !(votes[n.id]?.vote_count > 0))
  const sorted       = [...withVotes, ...withoutVotes]
  const q            = search.trim().toLowerCase()
  const filtered     = q
    ? sorted.filter(n => n.title.toLowerCase().includes(q) || (n.sub||'').toLowerCase().includes(q))
    : sorted

  return (
    <div style={{ position:'relative' }}>
      {/* Search */}
      {!loading && items.length > 0 && (
        <div style={{ position:'relative', marginBottom:20 }}>
          <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', opacity:.3 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang==='vi' ? 'Lọc theo tên...' : 'Filter by title...'}
            style={{ width:'100%', boxSizing:'border-box',
              background:'rgba(255,248,240,0.04)', border:`1px solid ${cat.accent}22`,
              borderRadius:12, padding:'10px 36px 10px 38px',
              color:'#f1f5f9', fontSize:13, outline:'none',
              fontFamily:"'Be Vietnam Pro',sans-serif" }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%',
              transform:'translateY(-50%)', background:'none', border:'none',
              color:'#64748B', cursor:'pointer', fontSize:18 }}>×</button>
          )}
        </div>
      )}

      {error   && <ErrorBox msg={error} onRetry={() => window.location.reload()} color={cat.accent} />}
      {loading && <SkeletonGrid isMobile={isMobile} />}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#4B5563' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>{search ? '🔍' : cat.icon}</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22 }}>
            {search ? (lang==='vi'?'Không tìm thấy':'No results') : (lang==='vi'?'Chưa có dữ liệu':'No data yet')}
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{
          display:'grid',
          gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(190px,1fr))',
          gap: isMobile ? 10 : 16,
        }}>
          {filtered.map((item, i) => (
            <VoteCard
              key={item.id} item={item} rank={i+1}
              voteCount={votes[item.id]?.vote_count ?? 0}
              prevRank={votes[item.id]?.prev_rank ?? null}
              hasVoted={votedIds.has(`${item.id}-${month}-${year}`)}
              onVote={castVote} voting={voting} accent={cat.accent} t={t} isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          background: toast.ok ? 'rgba(74,222,128,0.14)' : 'rgba(239,68,68,0.14)',
          border: `1px solid ${toast.ok ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.ok ? '#4ADE80' : '#FCA5A5',
          padding:'12px 22px', borderRadius:12, fontSize:13, fontWeight:600,
          zIndex:9999, backdropFilter:'blur(12px)',
          maxWidth:'90vw', textAlign:'center', lineHeight:1.4,
          animation:'fadeIn .2s ease',
        }}>{toast.msg}</div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function VotePage() {
  const { t, lang } = useLang()
  const { token }   = useAuth()

  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const daysLeft = new Date(year, month, 1) - now
  const daysNum  = Math.ceil(daysLeft / 86400000)

  const MONTHS_VI = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6',
                     'tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12']
  const monthLabel = lang === 'vi'
    ? MONTHS_VI[month-1]
    : new Date(year, month-1).toLocaleString('en', { month: 'long' })

  const [activeCat, setActiveCat] = useState('novel')
  const [isMobile,  setIsMobile]  = useState(() => window.innerWidth < 768)
  const contentRef = useRef(null)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const cat = CATS.find(c => c.id === activeCat)

  const switchCat = (id) => {
    setActiveCat(id)
    if (isMobile && contentRef.current) {
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
    }
  }

  // ── Sidebar item ────────────────────────────────────────────────────────────
  const SidebarItem = ({ c }) => {
    const isActive = activeCat === c.id
    const [hov, setHov] = useState(false)
    return (
      <button
        onClick={() => switchCat(c.id)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width:'100%', display:'flex', alignItems:'flex-start', gap:12,
          padding:'14px 18px 14px 16px', textAlign:'left',
          background: isActive ? `${c.accent}12` : hov ? 'rgba(255,248,240,0.04)' : 'transparent',
          border:'none',
          borderLeft: `3px solid ${isActive ? c.accent : 'transparent'}`,
          cursor:'pointer', transition:'all .15s',
        }}
      >
        <span style={{ fontSize:22, lineHeight:1.2, flexShrink:0 }}>{c.icon}</span>
        <div>
          <div style={{
            fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:14,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? '#f1f5f9' : hov ? '#c8b89a' : '#a08060',
            lineHeight:1.3,
          }}>
            {lang==='vi' ? c.label.vi : c.label.en}
          </div>
          <div style={{
            fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:11, marginTop:3, lineHeight:1.5,
            color: isActive ? c.accent : '#4a3828',
          }}>
            {lang==='vi' ? c.desc.vi : c.desc.en}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="page-enter" style={{ minHeight:'100vh', background:'#0f0b09' }}>
      <AppHeader activeTab="#/vote" accent={PURPLE}
        searchInput="" onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}}
        hideSearch hideSorts />

      {/* ── Hero ── */}
      <div style={{ background:'linear-gradient(160deg,#130a1c 0%,#0f0b09 60%)',
        padding: isMobile ? '32px 20px 28px' : '44px 48px 40px',
        borderBottom:'1px solid rgba(255,248,240,0.06)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0,
          background:`radial-gradient(ellipse at 15% 60%, ${PURPLE}14 0%, transparent 55%)` }} />
        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:560, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase',
              color:PURPLE, fontFamily:"'Barlow Condensed',sans-serif" }}>
              🏆 {lang==='vi' ? 'Bầu chọn tháng này' : 'Monthly Vote'}
            </span>
          </div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize: isMobile ? 34 : 52, fontWeight:900, color:'#f1f5f9',
            margin:'0 0 10px', lineHeight:1.05, letterSpacing:.5 }}>
            {lang==='vi'
              ? `Bầu chọn ${monthLabel} ${year}`
              : `${monthLabel} ${year} Poll`}
          </h1>
          {!isMobile && (
            <p style={{ fontSize:13, color:'#6b4f35', fontFamily:"'Be Vietnam Pro',sans-serif",
              margin:0, lineHeight:1.7 }}>
              {lang==='vi'
                ? `Bình chọn tác phẩm yêu thích của bạn trong mỗi hạng mục. Còn ${daysNum} ngày.`
                : `Cast one vote per category for your favorites. ${daysNum} days remaining.`}
            </p>
          )}
          {isMobile && (
            <p style={{ fontSize:12, color:'#6b4f35', fontFamily:"'Be Vietnam Pro',sans-serif",
              margin:0, lineHeight:1.6 }}>
              {lang==='vi' ? `Còn ${daysNum} ngày` : `${daysNum} days left`}
            </p>
          )}
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{ display:'flex', alignItems:'flex-start', maxWidth:1320, margin:'0 auto' }}>

        {isMobile ? (
          /* ── Mobile pills ── */
          <div style={{ width:'100%', display:'flex', padding:'10px 12px',
            gap:8,
            borderBottom:'1px solid rgba(255,248,240,0.07)',
            background:'rgba(15,11,9,0.97)', backdropFilter:'blur(12px)',
            position:'sticky', top:56, zIndex:20 }}>
            {CATS.map(c => {
              const isActive = activeCat === c.id
              return (
                <button key={c.id} onClick={() => switchCat(c.id)} style={{
                  flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  padding:'9px 4px', borderRadius:12, cursor:'pointer',
                  fontFamily:"'Be Vietnam Pro',sans-serif", fontWeight: isActive?700:500,
                  fontSize:12, transition:'all .15s',
                  background: isActive ? `${c.accent}18` : 'rgba(255,248,240,0.05)',
                  border: `1.5px solid ${isActive ? c.accent : 'transparent'}`,
                  color: isActive ? c.accent : '#6b4f35',
                  boxShadow: isActive ? `0 2px 10px ${c.accent}30` : 'none',
                }}>
                  <span style={{ fontSize:15 }}>{c.icon}</span>
                  <span>{lang==='vi' ? c.label.vi : c.label.en}</span>
                </button>
              )
            })}
          </div>
        ) : (
          /* ── Desktop sidebar ── */
          <aside style={{ width:230, flexShrink:0, position:'sticky', top:56,
            alignSelf:'flex-start', minHeight:'calc(100vh - 56px)',
            borderRight:'1px solid rgba(255,248,240,0.07)',
            background:'#0f0b09', paddingTop:28 }}>

            <div style={{ padding:'0 16px 16px',
              fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700,
              letterSpacing:2.5, color:'#2e2016', textTransform:'uppercase' }}>
              {lang==='vi' ? 'Hạng mục' : 'Categories'}
            </div>

            {CATS.map(c => <SidebarItem key={c.id} c={c} />)}

            {/* Info block */}
            <div style={{ margin:'28px 16px 0', padding:'18px 0 0',
              borderTop:'1px solid rgba(255,248,240,0.06)' }}>
              <div style={{ fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:12,
                color:'#4a3828', lineHeight:2 }}>
                <div>📅 {lang==='vi' ? `Còn ${daysNum} ngày` : `${daysNum} days left`}</div>
                <div>🗳️ {lang==='vi' ? '1 vote / hạng mục' : '1 vote per category'}</div>
                <div>🔄 {lang==='vi' ? `Reset đầu tháng` : 'Resets monthly'}</div>
              </div>
            </div>
          </aside>
        )}

        {/* ── Right: category panel ── */}
        <div ref={contentRef} style={{
          flex:1, minWidth:0,
          padding: isMobile ? '16px 12px 72px' : '32px 32px 72px',
        }}>
          {/* Section header */}
          <div style={{ marginBottom: isMobile ? 16 : 24, paddingBottom: isMobile ? 14 : 18,
            borderBottom:'1px solid rgba(255,248,240,0.07)' }}>
            <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 10 : 14 }}>
              <span style={{ fontSize: isMobile ? 22 : 30 }}>{cat.icon}</span>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize: isMobile ? 20 : 28,
                  fontWeight:900, color:'#f1f5f9', margin:0, letterSpacing:.5 }}>
                  {lang==='vi' ? cat.label.vi : cat.label.en}
                </h2>
                {!isMobile && (
                  <p style={{ fontSize:12, color:'#6b4f35', margin:'4px 0 0',
                    fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                    {lang==='vi' ? cat.desc.vi : cat.desc.en}
                    {' · '}
                    <span style={{ color: cat.accent }}>{monthLabel} {year}</span>
                  </p>
                )}
              </div>
              {isMobile && (
                <span style={{ marginLeft:'auto', fontSize:11, color: cat.accent,
                  background:`${cat.accent}15`, padding:'3px 10px', borderRadius:20,
                  fontWeight:700, whiteSpace:'nowrap', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                  {monthLabel}
                </span>
              )}
            </div>
          </div>

          {/* Panel — keyed so it remounts fresh on category switch */}
          <CategoryPanel
            key={activeCat}
            cat={cat} month={month} year={year}
            lang={lang} token={token} t={t} isMobile={isMobile}
          />
        </div>
      </div>

      <PageFooter color={PURPLE} src="RanobeDB" />
    </div>
  )
}
