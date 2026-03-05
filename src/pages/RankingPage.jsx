import React, { useState, useEffect, useMemo } from 'react'
import { PURPLE, CYAN, ROSE } from '../constants.js'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner } from '../components/Shared.jsx'

const GOLD   = '#FFD700'
const SILVER = '#C0C0C0'
const BRONZE = '#CD7F32'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_VI = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12']

function rankColor(r) {
  return r === 1 ? GOLD : r === 2 ? SILVER : r === 3 ? BRONZE : '#475569'
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)',
      overflow: 'hidden', marginTop: 6 }}>
      <div style={{
        height: '100%', width: `${pct}%`, borderRadius: 2,
        background: `linear-gradient(to right, ${color}80, ${color})`,
        transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

function RankCard({ entry, rank, max, prevRanks, lang }) {
  const prev      = prevRanks?.[entry.novel_id]
  const movement  = prev ? prev - rank : null  // positive = moved up
  const isNew     = !prev
  const isTop3    = rank <= 3
  const rc        = rankColor(rank)
  const votes     = entry.vote_count || 0

  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'center',
      padding: isTop3 ? '16px 18px' : '12px 16px',
      borderRadius: isTop3 ? 16 : 12,
      background: isTop3
        ? rank === 1 ? 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.04))'
        : rank === 2 ? 'linear-gradient(135deg, rgba(192,192,192,0.08), rgba(168,168,168,0.04))'
        : 'linear-gradient(135deg, rgba(205,127,50,0.08), rgba(160,82,45,0.04))'
        : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isTop3 ? rc + '30' : 'rgba(255,255,255,0.05)'}`,
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${PURPLE}0a`; e.currentTarget.style.borderColor = `${PURPLE}30` }}
    onMouseLeave={e => {
      e.currentTarget.style.background = isTop3
        ? rank===1 ? 'linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,165,0,0.04))'
        : rank===2 ? 'linear-gradient(135deg,rgba(192,192,192,0.08),rgba(168,168,168,0.04))'
        : 'linear-gradient(135deg,rgba(205,127,50,0.08),rgba(160,82,45,0.04))'
        : 'rgba(255,255,255,0.02)'
      e.currentTarget.style.borderColor = isTop3 ? rc+'30' : 'rgba(255,255,255,0.05)'
    }}
    >
      {/* Rank number */}
      <div style={{
        width: isTop3 ? 44 : 36, height: isTop3 ? 44 : 36,
        borderRadius: isTop3 ? 12 : 8, flexShrink: 0,
        background: isTop3
          ? `linear-gradient(135deg, ${rc}, ${rc}88)`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isTop3 ? rc + '60' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: isTop3 ? 20 : 16, fontWeight: 900,
        color: isTop3 ? (rank === 1 ? '#000' : '#fff') : '#475569',
      }}>
        {rank}
      </div>

      {/* Cover */}
      {entry.cover_url && (
        <div style={{ width: 36, height: 50, borderRadius: 7,
          overflow: 'hidden', flexShrink: 0 }}>
          <img src={entry.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.style.display='none'} />
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isTop3 ? 16 : 14, color: '#f1f5f9', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.novel_title || 'Unknown'}
        </div>
        <Bar value={votes} max={max} color={isTop3 ? rc : PURPLE} />
      </div>

      {/* Votes + movement */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isTop3 ? 20 : 16, fontWeight: 900,
          color: isTop3 ? rc : '#64748B',
        }}>
          {votes.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, marginTop: 2 }}>
          {isNew ? (
            <span style={{ color: CYAN, fontWeight: 700 }}>★ NEW</span>
          ) : movement > 0 ? (
            <span style={{ color: '#4ADE80' }}>▲{movement}</span>
          ) : movement < 0 ? (
            <span style={{ color: '#F87171' }}>▼{Math.abs(movement)}</span>
          ) : (
            <span style={{ color: '#374151' }}>—</span>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniSparkline({ data, color }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 80, H = 24
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={pts.split(' ').pop().split(',')[0]}
        cy={pts.split(' ').pop().split(',')[1]}
        r="2.5" fill={color} />
    </svg>
  )
}

export function RankingPage() {
  const { lang }   = useLang()
  const [votes,    setVotes]    = useState([])
  const [history,  setHistory]  = useState([])   // last 3 months
  const [loading,  setLoading]  = useState(true)
  const [viewMode, setViewMode] = useState('rank')  // 'rank' | 'chart'
  const [monthOffset, setMonthOffset] = useState(0)

  const now        = new Date()
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
  const month      = targetDate.getMonth() + 1
  const year       = targetDate.getFullYear()
  const monthLabel = (lang === 'vi' ? MONTHS_VI : MONTHS)[month - 1]

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Current month
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/novel_votes?month=eq.${month}&year=eq.${year}&order=vote_count.desc&limit=30`,
          { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
        )
        const data = await res.json()
        setVotes(Array.isArray(data) ? data : [])

        // Last 3 months for sparklines
        const hist = []
        for (let i = 1; i <= 3; i++) {
          const d2 = new Date(now.getFullYear(), now.getMonth() - monthOffset - i, 1)
          const r2 = await fetch(
            `${SUPABASE_URL}/rest/v1/novel_votes?month=eq.${d2.getMonth()+1}&year=eq.${d2.getFullYear()}&order=vote_count.desc&limit=30`,
            { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
          )
          const d2data = await r2.json()
          hist.push(Array.isArray(d2data) ? d2data : [])
        }
        setHistory(hist)
      } catch {}
      setLoading(false)
    }
    load()
  }, [month, year])

  // Build sparkline data per novel (last 3 months + current)
  const sparklines = useMemo(() => {
    const map = {}
    votes.forEach(v => {
      const points = [...history].reverse().map(month_data =>
        month_data.find(e => e.novel_id === v.novel_id)?.vote_count || 0
      )
      points.push(v.vote_count || 0)
      map[v.novel_id] = points
    })
    return map
  }, [votes, history])

  // Previous month ranks for movement
  const prevRanks = useMemo(() => {
    const prev = history[0] || []
    const map = {}
    prev.forEach((e, i) => { map[e.novel_id] = i + 1 })
    return map
  }, [history])

  const maxVotes = votes[0]?.vote_count || 1

  const T = {
    title:   lang === 'vi' ? 'BẢNG XẾP HẠNG' : 'RANKING DASHBOARD',
    rank:    lang === 'vi' ? 'Xếp hạng'       : 'Rankings',
    chart:   lang === 'vi' ? 'Biểu đồ'        : 'Chart',
    prev:    lang === 'vi' ? '← Tháng trước'  : '← Prev month',
    next:    lang === 'vi' ? 'Tháng sau →'    : 'Next month →',
    votes:   lang === 'vi' ? 'phiếu'          : 'votes',
    noData:  lang === 'vi' ? 'Chưa có phiếu bầu tháng này' : 'No votes this month yet',
    current: lang === 'vi' ? 'Tháng hiện tại' : 'Current month',
  }

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/ranking" accent={GOLD}
        searchInput="" onSearch={() => {}} sorts={[]}
        activeSort="" onSort={() => {}} hideSearch hideSorts />

      <HeroBanner
        title={T.title}
        sub={`${monthLabel} ${year} · ${votes.length} ${T.votes}`}
        accent={GOLD} src="Ranking" />

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px' }}>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>

          {/* Month navigation */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setMonthOffset(o => o + 1)} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748B', borderRadius: 8, padding: '6px 14px',
              cursor: 'pointer', fontSize: 12,
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>{T.prev}</button>
            <div style={{
              padding: '6px 16px',
              background: `${GOLD}15`,
              border: `1px solid ${GOLD}30`,
              borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: GOLD, fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: 0.5,
            }}>
              {monthLabel} {year}
              {monthOffset === 0 && (
                <span style={{ fontSize: 9, color: CYAN, marginLeft: 6 }}>● LIVE</span>
              )}
            </div>
            {monthOffset > 0 && (
              <button onClick={() => setMonthOffset(o => o - 1)} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#64748B', borderRadius: 8, padding: '6px 14px',
                cursor: 'pointer', fontSize: 12,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>{T.next}</button>
            )}
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)' }}>
            {[{k:'rank',l:'🏆 ' + T.rank},{k:'chart',l:'📊 ' + T.chart}].map(({k,l}) => (
              <button key={k} onClick={() => setViewMode(k)} style={{
                background: viewMode===k ? `${GOLD}20` : 'transparent',
                border: 'none', color: viewMode===k ? GOLD : '#475569',
                padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                borderRight: k==='rank' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({length: 10}).map((_,i) => (
              <div key={i} style={{ height: 68, borderRadius: 12,
                background: 'linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        ) : votes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗳️</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22, color: '#4B5563' }}>{T.noData}</div>
            <div style={{ fontSize: 12, color: '#374151', marginTop: 8 }}>
              <a href="#/vote" style={{ color: PURPLE, textDecoration: 'none' }}>
                {lang === 'vi' ? '→ Đến trang bầu chọn' : '→ Go vote now'}
              </a>
            </div>
          </div>
        ) : viewMode === 'rank' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {votes.map((entry, i) => (
              <RankCard key={entry.novel_id} entry={entry}
                rank={i + 1} max={maxVotes}
                prevRanks={prevRanks} lang={lang} />
            ))}
          </div>
        ) : (
          /* Chart view */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {votes.map((entry, i) => {
              const spark = sparklines[entry.novel_id] || []
              const pct   = (entry.vote_count / maxVotes) * 100
              const rc    = rankColor(i + 1)
              return (
                <div key={entry.novel_id} style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', gap: 12, alignItems: 'center',
                }}>
                  <div style={{ width: 28, fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 16, fontWeight: 900, color: rc, textAlign: 'center' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 13, color: '#e2e8f0',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: '60%' }}>
                        {entry.novel_title}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700,
                        color: rc, flexShrink: 0 }}>
                        {entry.vote_count}
                      </span>
                    </div>
                    {/* Bar */}
                    <div style={{ height: 6, borderRadius: 3,
                      background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, borderRadius: 3,
                        background: `linear-gradient(to right, ${rc}60, ${rc})`,
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                    </div>
                  </div>
                  <MiniSparkline data={spark} color={rc} />
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
