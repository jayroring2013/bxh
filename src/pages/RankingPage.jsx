import React, { useState, useEffect, useMemo } from 'react'
import { PURPLE, CYAN } from '../constants.js'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner } from '../components/Shared.jsx'
import { ModalShell, useIsMobile } from '../components/ModalLayout.jsx'
import { NovelModal } from '../components/NovelModal.jsx'
import { RANOBE } from '../constants.js'

const GOLD   = '#FFD700'
const SILVER = '#C0C0C0'
const BRONZE = '#CD7F32'
const MONTHS    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_VI = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12']

const rankColor = r => r === 1 ? GOLD : r === 2 ? SILVER : r === 3 ? BRONZE : '#475569'

// ── Detail modal for a ranked novel ─────────────────────────────
function NovelDetailModal({ entry, rank, prevRank, allHistory, onClose, onOpenDetail, lang }) {
  const mobile = useIsMobile()
  const rc  = rankColor(rank)
  const votes = entry.vote_count || 0

  // Build rank history across months (most recent last)
  const rankHistory = useMemo(() => {
    return allHistory.map((monthData, mi) => {  // already oldest→newest
      const idx = monthData.findIndex(e => e.novel_id === entry.novel_id)
      return idx >= 0 ? idx + 1 : null
    }).concat([rank])
  }, [allHistory, entry.novel_id, rank])

  const movement = prevRank ? prevRank - rank : null
  const isNew    = !prevRank

  return (
    <ModalShell onClose={onClose} accentColor={rc}
      bg="linear-gradient(145deg,#0a0f1e 0%,#111827 100%)">
      <div style={{ padding: mobile ? 16 : 28 }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: mobile ? 10 : 16, alignItems: 'flex-start', marginBottom: mobile ? 16 : 24 }}>
          {/* Rank badge */}
          <div style={{
            width: mobile ? 40 : 56, height: mobile ? 40 : 56,
            borderRadius: mobile ? 10 : 14, flexShrink: 0,
            background: rank <= 3 ? `linear-gradient(135deg,${rc},${rc}88)` : 'rgba(255,255,255,0.06)',
            border: `2px solid ${rc}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: mobile ? 18 : 26, fontWeight: 900,
            color: rank === 1 ? '#000' : '#fff',
          }}>#{rank}</div>

          {/* Cover */}
          {entry.cover_url && (
            <div style={{ width: mobile ? 50 : 70, height: mobile ? 70 : 98, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              <img src={entry.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => e.target.style.display='none'} />
            </div>
          )}

          {/* Title + stats */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: mobile ? 16 : 22, color: '#f1f5f9', margin: '0 0 6px', lineHeight: 1.2 }}>
              {entry.novel_title}
            </h2>
            <div style={{ display: 'flex', gap: mobile ? 10 : 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: mobile ? 20 : 28, fontWeight: 900, color: rc }}>{votes}</div>
                <div style={{ fontSize: 9, color: '#475569', fontWeight: 700, letterSpacing: 1 }}>VOTES</div>
              </div>
              <div>
                <div style={{ fontSize: mobile ? 13 : 18, fontWeight: 700,
                  color: isNew ? CYAN : movement > 0 ? '#4ADE80' : movement < 0 ? '#F87171' : '#64748B' }}>
                  {isNew ? '★ NEW'
                    : movement > 0 ? `▲ +${movement}`
                    : movement < 0 ? `▼ ${movement}`
                    : '— SAME'}
                </div>
                <div style={{ fontSize: 9, color: '#475569', fontWeight: 700, letterSpacing: 1 }}>VS LAST MONTH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rank progression chart */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1,
            color: '#475569', marginBottom: 12 }}>RANK PROGRESSION</div>
          <RankChart history={rankHistory} color={rc} mobile={mobile} />
        </div>

        {/* Detail button */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button onClick={() => onOpenDetail(entry.novel_id)} style={{
            padding: mobile ? '8px 20px' : '10px 28px',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)',
            color: '#A5B4FC', borderRadius: 10, cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: mobile ? 12 : 13, fontWeight: 600,
          }}>📖 {lang === 'vi' ? 'Thông tin chi tiết' : 'Series Details'}</button>
        </div>
      </div>
    </ModalShell>
  )
}

// ── Rank chart: shows rank number over months ────────────────────
function RankChart({ history, color, mobile }) {
  // history = array of rank numbers (null = not ranked that month)
  // Lower rank number = better (1 is top)
  const valid = history.filter(v => v !== null)
  if (valid.length < 2) {
    return (
      <div style={{ textAlign: 'center', color: '#374151', fontSize: 12, padding: '20px 0' }}>
        Not enough history to show chart
      </div>
    )
  }

  const W = mobile ? Math.min(280, (typeof window !== 'undefined' ? window.innerWidth - 80 : 280)) : 500
  const H = mobile ? 90 : 100
  const maxRank = Math.max(...valid) + 1
  const minRank = Math.max(1, Math.min(...valid) - 1)
  const range   = maxRank - minRank || 1

  const points = history.map((r, i) => {
    if (r === null) return null
    const x = (i / (history.length - 1)) * W
    // Invert: rank 1 at top (y=0), lower ranks at bottom
    const y = ((r - minRank) / range) * H
    return { x, y, r }
  }).filter(Boolean)

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

  const monthLabels = ['3mo ago', '2mo ago', 'Last mo', 'This mo']
    .slice(-(history.length))

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`-20 -10 ${W + 40} ${H + 30}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Grid lines */}
        {[1,2,3,4,5].map(r => {
          const y = ((r - minRank) / range) * H
          if (y < 0 || y > H) return null
          return (
            <g key={r}>
              <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={-5} y={y + 4} fontSize="9" fill="#374151" textAnchor="end">#{r}</text>
            </g>
          )
        })}

        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

        {/* Area fill */}
        <path d={`${pathD} L ${points[points.length-1].x} ${H} L ${points[0].x} ${H} Z`}
          fill={color} opacity="0.06" />

        {/* Points + rank labels */}
        {points.map((p, i) => {
          const prev = points[i - 1]
          const moved = prev ? prev.r - p.r : null
          const dotColor = !prev ? CYAN
            : moved > 0 ? '#4ADE80'
            : moved < 0 ? '#F87171'
            : '#64748B'
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill={dotColor} stroke="#0a0f1e" strokeWidth="2" />
              {/* Rank number above dot */}
              <text x={p.x} y={p.y - 10} fontSize="10" fill={dotColor}
                textAnchor="middle" fontWeight="700">#{p.r}</text>
              {/* Movement arrow below dot (except first) */}
              {moved !== null && (
                <text x={p.x} y={p.y + 20} fontSize="9" fill={dotColor} textAnchor="middle">
                  {moved > 0 ? `▲+${moved}` : moved < 0 ? `▼${moved}` : '—'}
                </text>
              )}
            </g>
          )
        })}

        {/* Month labels at bottom */}
        {monthLabels.map((label, i) => {
          const x = (i / (monthLabels.length - 1)) * W
          return (
            <text key={i} x={x} y={H + 22} fontSize="9" fill="#374151" textAnchor="middle">{label}</text>
          )
        })}
      </svg>
    </div>
  )
}


// ── Unified row: rank + change + cover + title + votes + sparkline ──
function UnifiedRow({ entry, rank, prevRanks, rankHistory, onClick, lang }) {
  const mobile   = useIsMobile()
  const prev     = prevRanks?.[entry.novel_id]
  const movement = prev ? prev - rank : null
  const isNew    = !prev
  const isTop3   = rank <= 3
  const rc       = rankColor(rank)
  const votes    = entry.vote_count || 0

  const moveColor = isNew ? CYAN : movement > 0 ? '#4ADE80' : movement < 0 ? '#F87171' : '#64748B'
  const moveText  = isNew          ? '★ NEW'
    : movement > 0 ? `▲ +${movement}`
    : movement < 0 ? `▼ ${movement}`
    : '—'
  const moveTextShort = isNew      ? 'NEW'
    : movement > 0 ? `+${movement}`
    : movement < 0 ? `${movement}`
    : '—'

  // Mini rank sparkline
  const valid = (rankHistory || []).filter(v => v !== null)
  let sparkEl = null
  if (valid.length >= 2) {
    const W = mobile ? 40 : 64, H = 20
    const maxR  = Math.max(...valid) + 1
    const minR  = Math.max(1, Math.min(...valid) - 1)
    const range = maxR - minR || 1
    const pts   = (rankHistory || []).map((r, i) => {
      if (r === null) return null
      const x = (i / ((rankHistory.length || 1) - 1)) * W
      const y = ((r - minR) / range) * H
      return `${x},${y}`
    }).filter(Boolean)
    if (pts.length >= 2) {
      const last = pts[pts.length - 1].split(',')
      sparkEl = (
        <svg width={W} height={H} style={{ overflow: 'visible', flexShrink: 0 }}>
          <polyline points={pts.join(' ')} fill="none" stroke={moveColor}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          <circle cx={last[0]} cy={last[1]} r="2.5" fill={moveColor} />
        </svg>
      )
    }
  }

  const rowBg = isTop3
    ? rank===1 ? 'linear-gradient(135deg,rgba(255,215,0,0.09),rgba(255,165,0,0.04))'
    : rank===2 ? 'linear-gradient(135deg,rgba(192,192,192,0.08),rgba(168,168,168,0.04))'
    : 'linear-gradient(135deg,rgba(205,127,50,0.08),rgba(160,82,45,0.04))'
    : 'rgba(255,255,255,0.02)'

  // ── MOBILE layout ─────────────────────────────────
  if (mobile) {
    return (
      <div onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
        background: rowBg,
        border: `1px solid ${isTop3 ? rc+'30' : 'rgba(255,255,255,0.05)'}`,
      }}>
        {/* Rank badge */}
        <div style={{
          width: isTop3 ? 34 : 26, height: isTop3 ? 34 : 26, flexShrink: 0,
          borderRadius: isTop3 ? 9 : 7,
          background: isTop3 ? `linear-gradient(135deg,${rc},${rc}88)` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isTop3 ? rc+'60' : 'rgba(255,255,255,0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isTop3 ? 15 : 12, fontWeight: 900,
          color: isTop3 ? (rank===1 ? '#000' : '#fff') : '#475569',
        }}>{rank}</div>

        {/* Cover */}
        {entry.cover_url && (
          <div style={{ width: 28, height: 40, borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
            <img src={entry.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.style.display='none'} />
          </div>
        )}

        {/* Title + change row */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: isTop3 ? 14 : 12, color: '#f1f5f9', lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{entry.novel_title || 'Unknown'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: moveColor,
              fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              {isNew ? '★ ' : movement > 0 ? '▲ ' : movement < 0 ? '▼ ' : ''}{moveTextShort}
            </span>
          </div>
        </div>

        {/* Votes */}
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: isTop3 ? 18 : 15, fontWeight: 900, color: isTop3 ? rc : '#64748B',
          flexShrink: 0, textAlign: 'right' }}>{votes}</div>

        {/* Sparkline */}
        {sparkEl && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {sparkEl}
          </div>
        )}

        {/* Vote button */}
        <a href="#/vote" onClick={e => e.stopPropagation()} style={{
          flexShrink: 0, padding: '4px 8px', borderRadius: 7,
          background: `${GOLD}15`, border: `1px solid ${GOLD}35`,
          color: GOLD, fontSize: 10, fontWeight: 700,
          fontFamily: "'Be Vietnam Pro', sans-serif", textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          {lang === 'vi' ? 'Bầu' : 'Vote'}
        </a>
      </div>
    )
  }

  // ── DESKTOP layout ────────────────────────────────
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: isTop3 ? '13px 16px' : '10px 16px',
      borderRadius: isTop3 ? 16 : 12, cursor: 'pointer',
      background: rowBg,
      border: `1px solid ${isTop3 ? rc+'30' : 'rgba(255,255,255,0.05)'}`,
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = rc+'50'; e.currentTarget.style.background = `${rc}0a` }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = isTop3 ? rc+'30' : 'rgba(255,255,255,0.05)'
      e.currentTarget.style.background = rowBg
    }}>
      <div style={{
        width: isTop3 ? 40 : 32, height: isTop3 ? 40 : 32, flexShrink: 0,
        borderRadius: isTop3 ? 11 : 8,
        background: isTop3 ? `linear-gradient(135deg,${rc},${rc}88)` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isTop3 ? rc+'60' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: isTop3 ? 18 : 14, fontWeight: 900,
        color: isTop3 ? (rank===1 ? '#000' : '#fff') : '#475569',
      }}>{rank}</div>

      {entry.cover_url && (
        <div style={{ width: 32, height: 44, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
          <img src={entry.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.style.display='none'} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: isTop3 ? 15 : 13, color: '#f1f5f9', lineHeight: 1.2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.novel_title || 'Unknown'}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: moveColor,
        flexShrink: 0, minWidth: 60, textAlign: 'center',
        fontFamily: "'Be Vietnam Pro', sans-serif" }}>{moveText}</div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: isTop3 ? 20 : 16, fontWeight: 900, color: isTop3 ? rc : '#64748B',
        flexShrink: 0, minWidth: 40, textAlign: 'right' }}>{votes}</div>

      <div style={{ width: 64, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        {sparkEl}
      </div>

      <a href="#/vote" onClick={e => e.stopPropagation()} style={{
        flexShrink: 0, padding: '5px 12px', borderRadius: 8,
        background: `${GOLD}15`, border: `1px solid ${GOLD}35`,
        color: GOLD, fontSize: 11, fontWeight: 700,
        fontFamily: "'Be Vietnam Pro', sans-serif", textDecoration: 'none',
        whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${GOLD}28`; e.currentTarget.style.borderColor = `${GOLD}60` }}
      onMouseLeave={e => { e.currentTarget.style.background = `${GOLD}15`; e.currentTarget.style.borderColor = `${GOLD}35` }}>
        {lang === 'vi' ? 'Bình chọn' : 'Vote'}
      </a>
    </div>
  )
}

// ── Rank view row ────────────────────────────────────────────────
function RankRow({ entry, rank, prevRanks, onClick }) {
  const prev      = prevRanks?.[entry.novel_id]
  const movement  = prev ? prev - rank : null
  const isNew     = !prev
  const isTop3    = rank <= 3
  const rc        = rankColor(rank)
  const votes     = entry.vote_count || 0

  const moveBadge = isNew
    ? <span style={{ color: CYAN, fontSize: 10, fontWeight: 700 }}>★ NEW</span>
    : movement > 0
    ? <span style={{ color: '#4ADE80', fontSize: 11, fontWeight: 700 }}>▲{movement}</span>
    : movement < 0
    ? <span style={{ color: '#F87171', fontSize: 11, fontWeight: 700 }}>▼{Math.abs(movement)}</span>
    : <span style={{ color: '#374151', fontSize: 11 }}>—</span>

  return (
    <div onClick={onClick} style={{
      display: 'flex', gap: 14, alignItems: 'center',
      padding: isTop3 ? '14px 18px' : '11px 16px',
      borderRadius: isTop3 ? 16 : 12, cursor: 'pointer',
      background: isTop3
        ? rank === 1 ? 'linear-gradient(135deg,rgba(255,215,0,0.09),rgba(255,165,0,0.04))'
        : rank === 2 ? 'linear-gradient(135deg,rgba(192,192,192,0.08),rgba(168,168,168,0.04))'
        : 'linear-gradient(135deg,rgba(205,127,50,0.08),rgba(160,82,45,0.04))'
        : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isTop3 ? rc + '30' : 'rgba(255,255,255,0.05)'}`,
      transition: 'all 0.18s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = rc+'50'; e.currentTarget.style.background = `${rc}08` }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = isTop3 ? rc+'30' : 'rgba(255,255,255,0.05)'
      e.currentTarget.style.background = isTop3
        ? rank===1 ? 'linear-gradient(135deg,rgba(255,215,0,0.09),rgba(255,165,0,0.04))'
        : rank===2 ? 'linear-gradient(135deg,rgba(192,192,192,0.08),rgba(168,168,168,0.04))'
        : 'linear-gradient(135deg,rgba(205,127,50,0.08),rgba(160,82,45,0.04))'
        : 'rgba(255,255,255,0.02)'
    }}>

      {/* Rank badge */}
      <div style={{
        width: isTop3 ? 42 : 34, height: isTop3 ? 42 : 34, flexShrink: 0,
        borderRadius: isTop3 ? 12 : 8,
        background: isTop3 ? `linear-gradient(135deg,${rc},${rc}88)` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isTop3 ? rc+'60' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: isTop3 ? 19 : 15, fontWeight: 900,
        color: isTop3 ? (rank===1 ? '#000' : '#fff') : '#475569',
      }}>{rank}</div>

      {/* Movement */}
      <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
        {moveBadge}
      </div>

      {/* Cover (clickable) */}
      {entry.cover_url && (
        <div style={{ width: 34, height: 48, borderRadius: 6,
          overflow: 'hidden', flexShrink: 0 }}>
          <img src={entry.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.style.display='none'} />
        </div>
      )}

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: isTop3 ? 16 : 14, color: '#f1f5f9', lineHeight: 1.2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {entry.novel_title || 'Unknown'}
      </div>

      {/* Vote count */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: isTop3 ? 22 : 17, fontWeight: 900, color: isTop3 ? rc : '#64748B',
        flexShrink: 0 }}>
        {votes.toLocaleString()}
        <span style={{ fontSize: 9, color: '#374151', marginLeft: 3 }}>
          {isTop3 ? 'votes' : ''}
        </span>
      </div>
    </div>
  )
}

// ── Chart view row ───────────────────────────────────────────────
function ChartRow({ entry, rank, prevRanks, rankHistory, onClick }) {
  const prev     = prevRanks?.[entry.novel_id]
  const movement = prev ? prev - rank : null
  const isNew    = !prev
  const rc       = rankColor(rank)
  const votes    = entry.vote_count || 0

  // Inline mini rank chart (SVG)
  const valid = (rankHistory || []).filter(v => v !== null)
  const W = 72, H = 28

  let sparkEl = null
  if (valid.length >= 2) {
    const maxR = Math.max(...valid) + 1
    const minR = Math.max(1, Math.min(...valid) - 1)
    const range = maxR - minR || 1
    const pts = (rankHistory || []).map((r, i) => {
      if (r === null) return null
      const x = (i / ((rankHistory.length || 1) - 1)) * W
      const y = ((r - minR) / range) * H
      return `${x},${y}`
    }).filter(Boolean)

    if (pts.length >= 2) {
      const lastPt  = pts[pts.length - 1].split(',')
      sparkEl = (
        <svg width={W} height={H} style={{ overflow: 'visible', flexShrink: 0 }}>
          <polyline points={pts.join(' ')} fill="none" stroke={rc}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={rc} />
        </svg>
      )
    }
  }

  const moveColor = isNew ? CYAN : movement > 0 ? '#4ADE80' : movement < 0 ? '#F87171' : '#64748B'
  const moveText  = isNew ? '★ NEW'
    : movement > 0 ? `▲ +${movement}`
    : movement < 0 ? `▼ ${movement}`
    : '— SAME'

  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = rc+'40'; e.currentTarget.style.background = `${rc}08` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}>

      {/* Rank */}
      <div style={{ width: 24, fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 16, fontWeight: 900, color: rc, textAlign: 'center', flexShrink: 0 }}>
        {rank}
      </div>

      {/* Cover */}
      {entry.cover_url && (
        <div style={{ width: 30, height: 42, borderRadius: 5,
          overflow: 'hidden', flexShrink: 0 }}>
          <img src={entry.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => e.target.style.display='none'} />
        </div>
      )}

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 13, color: '#e2e8f0',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.novel_title}
      </div>

      {/* Movement badge */}
      <div style={{ fontSize: 11, fontWeight: 700, color: moveColor,
        flexShrink: 0, minWidth: 52, textAlign: 'center' }}>
        {moveText}
      </div>

      {/* Votes */}
      <div style={{ fontSize: 13, fontWeight: 700, color: rc,
        flexShrink: 0, minWidth: 28, textAlign: 'right' }}>
        {votes}
      </div>

      {/* Mini sparkline */}
      {sparkEl}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────
export function RankingPage() {
  const { lang }  = useLang()
  const [votes,   setVotes]   = useState([])
  const [voterCount, setVoterCount] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()
  const [monthOffset, setMonthOffset] = useState(0)
  const [selected, setSelected] = useState(null)  // entry for modal
  const [novelDetail, setNovelDetail] = useState(null)   // full series for NovelModal
  const [detailLoading, setDetailLoading] = useState(false)

  const openNovelDetail = async (novelId) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`${RANOBE}/series/${novelId}`)
      const data = await res.json()
      const series = data?.series || data
      if (series?.id) setNovelDetail(series)
    } catch {}
    setDetailLoading(false)
  }

  const now        = new Date()
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
  const month      = targetDate.getMonth() + 1
  const year       = targetDate.getFullYear()
  const monthLabel = (lang === 'vi' ? MONTHS_VI : MONTHS)[month - 1]

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res  = await fetch(
          `${SUPABASE_URL}/rest/v1/novel_votes?month=eq.${month}&year=eq.${year}&order=vote_count.desc&limit=30`,
          { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
        )
        const data = await res.json()
        setVotes(Array.isArray(data) ? data : [])

        // Fetch distinct voter count for this month
        try {
          const vr = await fetch(
            `${SUPABASE_URL}/rest/v1/vote_log?month=eq.${month}&year=eq.${year}&select=user_id`,
            { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
          )
          const vd = await vr.json()
          if (Array.isArray(vd)) {
            const distinct = new Set(vd.map(r => r.user_id)).size
            setVoterCount(distinct)
          }
        } catch { setVoterCount(0) }

        const hist = []
        // Fetch 3 months, oldest first (i=3 = 3mo ago, i=1 = last month)
        for (let i = 3; i >= 1; i--) {
          const d2  = new Date(now.getFullYear(), now.getMonth() - monthOffset - i, 1)
          const r2  = await fetch(
            `${SUPABASE_URL}/rest/v1/novel_votes?month=eq.${d2.getMonth()+1}&year=eq.${d2.getFullYear()}&order=vote_count.desc&limit=30`,
            { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
          )
          const d2d = await r2.json()
          hist.push(Array.isArray(d2d) ? d2d : [])
        }
        // hist = [3mo ago, 2mo ago, last month] — newest last
        setHistory(hist)
      } catch {}
      setLoading(false)
    }
    load()
  }, [month, year])

  const prevRanks = useMemo(() => {
    // history is built oldest-first (3moAgo, 2moAgo, 1moAgo)
    // We want the most recent previous month = last item
    const prev = history[history.length - 1] || []
    const map  = {}
    prev.forEach((e, i) => { map[e.novel_id] = i + 1 })
    return map
  }, [history])

  // Rank history per novel: [3moAgo, 2moAgo, 1moAgo, current]
  const rankHistories = useMemo(() => {
    const map = {}
    votes.forEach((v, i) => {
      const pts = history.map(monthData => {  // already oldest→newest
        const idx = monthData.findIndex(e => e.novel_id === v.novel_id)
        return idx >= 0 ? idx + 1 : null
      })
      pts.push(i + 1)
      map[v.novel_id] = pts
    })
    return map
  }, [votes, history])

  const T = {
    title:  lang === 'vi' ? 'BẢNG XẾP HẠNG' : 'RANKING DASHBOARD',
    prev:   lang === 'vi' ? '← Tháng trước'  : '← Prev',
    next:   lang === 'vi' ? 'Tháng sau →'    : 'Next →',
    voters: lang === 'vi' ? 'người bình chọn' : 'voters',
    series: lang === 'vi' ? 'series'          : 'series',
    noData: lang === 'vi' ? 'Chưa có phiếu bầu tháng này' : 'No votes this month yet',
  }

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/ranking" accent={GOLD}
        searchInput="" onSearch={() => {}} sorts={[]}
        activeSort="" onSort={() => {}} hideSearch hideSorts />

      <HeroBanner title={T.title}
        sub={lang === 'vi'
          ? `${monthLabel} ${year} · ${voterCount} người bình chọn · ${votes.length} series`
          : `${monthLabel} ${year} · ${voterCount} voter${voterCount !== 1 ? 's' : ''} · ${votes.length} series`}
        accent={GOLD} src="Ranking" />

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setMonthOffset(o => o + 1)} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748B', borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
              fontSize: 12, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>{T.prev}</button>
            <div style={{
              padding: '6px 16px', background: `${GOLD}15`, border: `1px solid ${GOLD}30`,
              borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: GOLD, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5,
            }}>
              {monthLabel} {year}
              {monthOffset === 0 && <span style={{ fontSize: 9, color: CYAN, marginLeft: 6 }}>● LIVE</span>}
            </div>
            {monthOffset > 0 && (
              <button onClick={() => setMonthOffset(o => o - 1)} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#64748B', borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                fontSize: 12, fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>{T.next}</button>
            )}
          </div>


        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({length: 8}).map((_,i) => (
              <div key={i} style={{ height: 62, borderRadius: 12,
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Column header — desktop only */}
            {!isMobile && (
            <div style={{ display: 'flex', gap: 10, padding: '0 16px 8px',
              fontSize: 9, fontWeight: 700, letterSpacing: 1, color: '#374151',
              borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 4 }}>
              <span style={{ width: 42, flexShrink: 0 }}>#</span>
              <span style={{ width: 34, flexShrink: 0 }}></span>
              <span style={{ flex: 1 }}>SERIES</span>
              <span style={{ minWidth: 60, textAlign: 'center' }}>CHANGE</span>
              <span style={{ minWidth: 40, textAlign: 'right' }}>VOTES</span>
              <span style={{ width: 72, textAlign: 'center' }}>TREND</span>
            </div>
            )}
            {votes.map((entry, i) => (
              <UnifiedRow key={entry.novel_id} entry={entry} rank={i+1}
                prevRanks={prevRanks}
                rankHistory={rankHistories[entry.novel_id]}
                lang={lang}
                onClick={() => setSelected({ entry, rank: i+1 })} />
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selected && (
        <NovelDetailModal
          entry={selected.entry}
          rank={selected.rank}
          prevRank={prevRanks[selected.entry.novel_id]}
          allHistory={history}
          onClose={() => setSelected(null)}
          onOpenDetail={(id) => { setSelected(null); openNovelDetail(id) }}
          lang={lang} />
      )}
      {detailLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#C4B5FD', fontFamily: "'Be Vietnam Pro'",
            fontSize: 14 }}>Loading...</div>
        </div>
      )}
      {novelDetail && (
        <NovelModal series={novelDetail} onClose={() => setNovelDetail(null)} />
      )}
    </div>
  )
}
