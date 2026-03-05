import React, { useState, useEffect } from 'react'
import { RANOBE, PURPLE } from '../constants.js'
import { supabase, SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner, ErrorBox } from '../components/Shared.jsx'

const GOLD   = '#F59E0B'
const SILVER = '#94A3B8'
const BRONZE = '#CD7F32'

const rankColor = r => r === 1 ? GOLD : r === 2 ? SILVER : r === 3 ? BRONZE : '#475569'
const rankBg    = r => r === 1 ? 'linear-gradient(135deg,#FFD700,#FFA500)'
                     : r === 2 ? 'linear-gradient(135deg,#C0C0C0,#A8A8A8)'
                     : r === 3 ? 'linear-gradient(135deg,#CD7F32,#A0522D)'
                     : 'rgba(255,255,255,0.06)'

function TrendArrow({ current, prev, t }) {
  if (!prev)          return <span style={{ color: '#06B6D4', fontSize: 11, fontWeight: 700 }}>★ {t('vote_trend_new')}</span>
  if (current < prev) return <span style={{ color: '#4ADE80', fontSize: 13 }}>▲ <span style={{ fontSize: 10 }}>{t('vote_trend_up')}</span></span>
  if (current > prev) return <span style={{ color: '#F87171', fontSize: 13 }}>▼ <span style={{ fontSize: 10 }}>{t('vote_trend_down')}</span></span>
  return                     <span style={{ color: '#64748B', fontSize: 11 }}>— {t('vote_trend_same')}</span>
}

function SkeletonCards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 16,
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          height: 320, borderRadius: 16,
          background: 'linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
      ))}
    </div>
  )
}

function VoteCard({ novel, rank, voteEntry, hasVoted, onVote, voting, t }) {
  const [hovered, setHovered] = useState(false)
  const isTop3    = rank <= 3
  const voteCount = voteEntry?.vote_count ?? 0
  const prevRank  = voteEntry?.prev_rank  ?? null

  const borderColor = isTop3
    ? rank === 1 ? '#FFD70050' : rank === 2 ? '#C0C0C050' : '#CD7F3250'
    : hovered ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.06)'

  const bgColor = isTop3
    ? 'rgba(139,92,246,0.07)'
    : hovered ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.02)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 16px 40px rgba(139,92,246,0.2), 0 4px 12px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Rank badge — top left */}
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 2,
        width: 34, height: 34, borderRadius: '50%',
        background: rankBg(rank),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
        color: rank <= 3 ? '#000' : '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      }}>#{rank}</div>

      {/* Trend arrow — top right */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
        <TrendArrow current={rank} prev={prevRank} t={t} />
      </div>

      {/* Cover image */}
      <div style={{ position: 'relative', height: 160, flexShrink: 0, background: '#0f172a', overflow: 'hidden' }}>
        {novel.cover_url
          ? <img src={novel.cover_url} alt={novel.novel_romaji || novel.novel_title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top',
                transition: 'transform 0.3s', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
              onError={e => e.target.style.display = 'none'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 48, background: 'rgba(139,92,246,0.1)' }}>📖</div>
        }
        {/* Gradient fade at bottom of cover */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to bottom, transparent, rgba(10,10,15,0.95))',
        }} />
      </div>

      {/* Info section */}
      <div style={{ padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

        {/* Title */}
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, lineHeight: 1.25,
            color: '#fff', display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {novel.novel_romaji || novel.novel_title}
          </div>
          {novel.novel_romaji && novel.novel_title !== novel.novel_romaji && (
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {novel.novel_title}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {novel.vols > 0 && (
            <span style={{
              background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
              color: '#A78BFA', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
            }}>
              📚 {novel.vols} {t('meta_vols')}
            </span>
          )}
          {novel.status && (
            <span style={{
              background: novel.status === 'ongoing' ? 'rgba(6,182,212,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${novel.status === 'ongoing' ? 'rgba(6,182,212,0.25)' : 'rgba(34,197,94,0.25)'}`,
              color: novel.status === 'ongoing' ? '#06B6D4' : '#4ADE80',
              fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {novel.status === 'ongoing' ? '● ' : ''}{t(`status_${novel.status}`) || novel.status}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Vote count + button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, lineHeight: 1,
              color: isTop3 ? rankColor(rank) : PURPLE,
            }}>
              {voteCount.toLocaleString()}
            </div>
            <div style={{ color: '#475569', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {t('vote_votes')}
            </div>
          </div>

          <button
            onClick={() => onVote(novel)}
            disabled={hasVoted || voting}
            style={{
              background: hasVoted ? 'rgba(74,222,128,0.15)' : PURPLE,
              border: `1px solid ${hasVoted ? 'rgba(74,222,128,0.4)' : 'rgba(139,92,246,0.6)'}`,
              color: hasVoted ? '#4ADE80' : '#fff',
              padding: '8px 18px', borderRadius: 10,
              cursor: hasVoted ? 'default' : voting ? 'wait' : 'pointer',
              fontSize: 12, fontWeight: 700,
              opacity: voting && !hasVoted ? 0.6 : 1,
              transition: 'all 0.2s', fontFamily: "'Be Vietnam Pro', sans-serif",
              boxShadow: hasVoted ? 'none' : `0 4px 14px ${PURPLE}50`,
            }}
          >
            {hasVoted ? t('vote_voted') : t('vote_cast')}
          </button>
        </div>
      </div>
    </div>
  )
}


export function VotePage() {
  const { t, lang } = useLang()
  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  // Top 50 novels pre-loaded from RanobeDB (by volume count)
  const [novels,   setNovels]   = useState([])   // stable list of 50 novels
  const [votes,    setVotes]    = useState({})    // map: novel_id -> vote entry from Supabase
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [voting,   setVoting]   = useState(false)
  const [toast,    setToast]    = useState(null)
  const [search,   setSearch]   = useState('')

  const [votedIds, setVotedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nt_voted') || '[]')) }
    catch { return new Set() }
  })

  const daysLeft  = new Date(year, month, 1) - now
  const daysNum   = Math.ceil(daysLeft / 86400000)
  const monthLabel = t('vote_month')[month - 1]
  const isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL'

  // Load top 50 novels by volume count + current month votes in parallel
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch top 50 by volume count (2 pages of 25)
        const [p1, p2] = await Promise.all([
          fetch(`${RANOBE}/series?limit=25&page=1&sort=Num.+books+desc&rl=ja`).then(r => r.json()),
          fetch(`${RANOBE}/series?limit=25&page=2&sort=Num.+books+desc&rl=ja`).then(r => r.json()),
        ])
        const all = [...(p1.series || []), ...(p2.series || [])]

        const mapped = all.map(s => ({
          novel_id:     String(s.id),
          novel_title:  s.title || '',
          novel_romaji: s.romaji || s.title || '',
          cover_url:    s.book?.image?.filename
            ? `https://images.ranobedb.org/${s.book.image.filename}`
            : null,
          vols: s.c_num_books || 0,
          status: s.publication_status || '',
        }))
        setNovels(mapped)

        // Fetch existing votes for this month
        if (isConfigured) {
          await loadVotes()
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const loadVotes = async () => {
    try {
      const url = `${SUPABASE_URL}/rest/v1/novel_votes?month=eq.${month}&year=eq.${year}&order=vote_count.desc&limit=50`
      const res = await fetch(url, {
        headers: {
          apikey:        SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
          'Content-Type': 'application/json',
        },
      })
      const text = await res.text()
      if (!res.ok) throw new Error(`${res.status}: ${text}`)
      const data = JSON.parse(text)
      const map = {}
      ;(data || []).forEach(row => { map[row.novel_id] = row })
      setVotes(map)
    } catch (e) {
    }
  }

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  const castVote = async (novel) => {
    const key = `${novel.novel_id}-${month}-${year}`
    if (votedIds.has(key)) { showToast(t('vote_already'), false); return }
    setVoting(true)

    // Save to Supabase — wait for confirmation before updating UI
    try {



      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_vote`, {
        method: 'POST',
        headers: {
          apikey:          SUPABASE_ANON,
          Authorization:  `Bearer ${SUPABASE_ANON}`,
          'Content-Type': 'application/json',
          Prefer:         'return=minimal',
        },
        body: JSON.stringify({
          p_novel_id:     novel.novel_id,
          p_novel_title:  novel.novel_title,
          p_novel_romaji: novel.novel_romaji,
          p_cover_url:    novel.cover_url,
          p_month:        month,
          p_year:         year,
        }),
      })
      const body = await res.text()

      if (!res.ok) {
        showToast(`Error ${res.status}: ${body || res.statusText}`, false)
      } else {
        // Only mark as voted + update UI after DB confirms success
        const newSet = new Set(votedIds)
        newSet.add(key)
        setVotedIds(newSet)
        localStorage.setItem('nt_voted', JSON.stringify([...newSet]))
        showToast(t('vote_success'))
        await loadVotes()
      }
    } catch (e) {
      showToast(`Network error: ${e.message}`, false)
    } finally {
      setVoting(false)
    }
  }

  // Split into: novels with votes (sorted by count desc) + rest (original order)
  const withVotes    = novels.filter(n => votes[n.novel_id]?.vote_count > 0)
    .sort((a, b) => (votes[b.novel_id]?.vote_count ?? 0) - (votes[a.novel_id]?.vote_count ?? 0))
  const withoutVotes = novels.filter(n => !(votes[n.novel_id]?.vote_count > 0))
  const sorted = [...withVotes, ...withoutVotes]

  // Filter by search (searches across full sorted list)
  const filtered = search.trim()
    ? sorted.filter(n => {
        const q = search.toLowerCase()
        return (n.novel_romaji || '').toLowerCase().includes(q)
          || (n.novel_title || '').toLowerCase().includes(q)
      })
    : sorted

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/vote" accent={PURPLE}
        searchInput="" onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}}
        hideSearch hideSorts />

      <HeroBanner
        title={t('hero_vote')}
        sub={`${t('vote_sub', monthLabel, year)} · ${t('vote_resets', daysNum)}`}
        accent={PURPLE} src="RanobeDB"
      />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* Not configured warning */}
        {!isConfigured && (
          <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: '#FDE68A' }}>
            ⚠️ Supabase not configured. Open <code>src/supabase.js</code> and add your URL + anon key.
          </div>
        )}

        {/* Search filter */}
        {!loading && novels.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'vi' ? 'Lọc theo tên novel…' : 'Filter by title…'}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                padding: '10px 14px 10px 38px', color: '#fff', fontSize: 13,
                outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18,
              }}>×</button>
            )}
          </div>
        )}

        {error   && <ErrorBox msg={error} onRetry={() => window.location.reload()} color={PURPLE} />}
        {loading && <SkeletonCards />}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#4B5563' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24 }}>
                  {lang === 'vi' ? 'Không tìm thấy novel' : 'No novels found'}
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16,
              }}>
                {filtered.map((novel, i) => (
                  <VoteCard
                    key={novel.novel_id}
                    novel={novel}
                    rank={i + 1}
                    voteEntry={votes[novel.novel_id]}
                    hasVoted={votedIds.has(`${novel.novel_id}-${month}-${year}`)}
                    onVote={castVote}
                    voting={voting}
                    t={t}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.ok ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.ok ? '#4ADE80' : '#FCA5A5',
          padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600,
          zIndex: 9999, animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(12px)',
          whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      <footer className="page-footer">
        <span className="page-footer__brand" style={{ color: PURPLE }}>NOVELTREND</span>
        {` · ${t('footer_powered')} RanobeDB · `}{year}
      </footer>
    </div>
  )
}
