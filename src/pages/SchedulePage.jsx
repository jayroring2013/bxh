import React, { useState, useEffect, useMemo, useRef } from 'react'
import { PURPLE, CYAN, ROSE } from '../constants.js'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner } from '../components/Shared.jsx'

const TYPE_COLOR  = { anime: CYAN, manga: ROSE, novel: PURPLE }
const TYPE_ICON   = { anime: '🎌', manga: '📚', novel: '📖' }
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAY_NAMES_VI = ['CN','T2','T3','T4','T5','T6','T7']

const toYMD = d => d.toISOString().slice(0, 10)   // "YYYY-MM-DD"
const fromYMD = s => new Date(s + 'T00:00:00')
const sameDay = (a, b) => toYMD(new Date(a)) === toYMD(new Date(b))

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US',
    { month: 'short', day: 'numeric' })
}
function isToday(iso) {
  return sameDay(iso, new Date())
}
function isPast(iso) {
  return new Date(iso) < new Date()
}

// ── Date picker control ─────────────────────────────────────────
function DateSelector({ lang, dateMode, setDateMode, singleDate, setSingleDate,
  rangeStart, setRangeStart, rangeEnd, setRangeEnd }) {

  const today  = toYMD(new Date())
  const CYAN_  = CYAN

  const modeLabel = {
    all:    lang === 'vi' ? 'Tất cả'       : 'All dates',
    single: lang === 'vi' ? 'Ngày cụ thể'  : 'Specific date',
    range:  lang === 'vi' ? 'Khoảng thời gian' : 'Date range',
  }

  // Quick shortcuts
  const shortcuts = [
    { key: 'today',   label: lang === 'vi' ? 'Hôm nay' : 'Today' },
    { key: 'week',    label: lang === 'vi' ? 'Tuần này' : 'This week' },
    { key: 'month',   label: lang === 'vi' ? 'Tháng này' : 'This month' },
  ]

  const applyShortcut = key => {
    const now = new Date()
    if (key === 'today') {
      setDateMode('single'); setSingleDate(today)
    } else if (key === 'week') {
      const end = new Date(now); end.setDate(end.getDate() + 6)
      setDateMode('range'); setRangeStart(today); setRangeEnd(toYMD(end))
    } else if (key === 'month') {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setDateMode('range'); setRangeStart(today); setRangeEnd(toYMD(end))
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Mode pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        {['all','single','range'].map(m => (
          <button key={m} onClick={() => setDateMode(m)} style={{
            background: dateMode === m ? `${CYAN_}20` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${dateMode === m ? CYAN_+'50' : 'rgba(255,255,255,0.08)'}`,
            color: dateMode === m ? CYAN_ : '#64748B',
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
            fontFamily: "'Be Vietnam Pro', sans-serif", transition: 'all 0.15s',
          }}>{modeLabel[m]}</button>
        ))}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

        {/* Quick shortcuts */}
        {shortcuts.map(s => (
          <button key={s.key} onClick={() => applyShortcut(s.key)} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#475569', padding: '6px 12px', borderRadius: 8,
            cursor: 'pointer', fontSize: 11,
            fontFamily: "'Be Vietnam Pro', sans-serif", transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = CYAN_; e.currentTarget.style.borderColor = CYAN_+'30' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      {dateMode === 'single' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#475569',
            fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {lang === 'vi' ? 'Ngày:' : 'Date:'}
          </span>
          <input type="date" value={singleDate} min={today}
            onChange={e => setSingleDate(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${CYAN_}30`,
              color: CYAN_, borderRadius: 8, padding: '6px 12px',
              fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif",
              outline: 'none', cursor: 'pointer',
              colorScheme: 'dark',
            }} />
          {singleDate !== today && (
            <button onClick={() => setSingleDate(today)} style={{
              background: 'none', border: 'none', color: '#374151',
              cursor: 'pointer', fontSize: 11,
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>{lang === 'vi' ? '↺ Hôm nay' : '↺ Today'}</button>
          )}
        </div>
      )}

      {dateMode === 'range' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#475569',
            fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {lang === 'vi' ? 'Từ:' : 'From:'}
          </span>
          <input type="date" value={rangeStart}
            onChange={e => setRangeStart(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${CYAN_}30`,
              color: CYAN_, borderRadius: 8, padding: '6px 12px',
              fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif",
              outline: 'none', cursor: 'pointer', colorScheme: 'dark',
            }} />
          <span style={{ fontSize: 12, color: '#374151' }}>
            {lang === 'vi' ? 'đến' : 'to'}
          </span>
          <input type="date" value={rangeEnd} min={rangeStart}
            onChange={e => setRangeEnd(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${CYAN_}30`,
              color: CYAN_, borderRadius: 8, padding: '6px 12px',
              fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif",
              outline: 'none', cursor: 'pointer', colorScheme: 'dark',
            }} />
          {rangeStart && rangeEnd && (
            <span style={{ fontSize: 11, color: '#374151',
              fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              {(() => {
                const diff = Math.round((fromYMD(rangeEnd) - fromYMD(rangeStart)) / 86400000) + 1
                return lang === 'vi' ? `${diff} ngày` : `${diff} day${diff !== 1 ? 's' : ''}`
              })()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}


// ── Schedule Detail Modal ───────────────────────────────────────────────────
function ScheduleDetailModal({ item, onClose, lang }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(!!item.item_id)
  const color = TYPE_COLOR[item.type]

  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  useEffect(() => {
    // series data is already embedded in item.series from the joined fetch
    if (item.series && Object.keys(item.series).length > 0) {
      setDetail(item.series)
      setLoading(false)
      return
    }
    // Fallback: fetch from series table by series_id
    if (!item.series_id) { setLoading(false); return }
    fetch(`${SUPABASE_URL}/rest/v1/series?id=eq.${item.series_id}&limit=1`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` }
    })
      .then(r => r.json())
      .then(d => { if (d?.[0]) setDetail(d[0]) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [item.series_id])

  const priceLabel = item.price
    ? new Intl.NumberFormat('vi-VN').format(item.price) + '₫'
    : null

  // Extract fields from detail row based on type
  const d_info  = detail || item.series || {}
  const title   = d_info.title || item.series_title || item.title
  const cover   = item.cover || d_info.cover_url || null

  const d_desc  = detail || item.series || {}
  const desc    = (d_desc.description || item.description || '').replace(/<[^>]*>/g, '')

  const metaItems = []
  const d = detail || item.series || {}
  // Fields from series table (same shape for all types)
  if (d.author || d.studio) metaItems.push({ label: lang === 'vi' ? 'Tác giả / Studio' : 'Author / Studio', value: d.author || d.studio })
  if (d.publisher || item.publisher) metaItems.push({ label: lang === 'vi' ? 'NXB' : 'Publisher', value: d.publisher || item.publisher })
  if (d.status)  metaItems.push({ label: lang === 'vi' ? 'Trạng thái' : 'Status', value: d.status })
  if (d.score)   metaItems.push({ label: lang === 'vi' ? 'Điểm' : 'Score',        value: `${d.score}/10` })
  if (priceLabel)metaItems.push({ label: lang === 'vi' ? 'Giá tập này' : 'Price', value: priceLabel })

  const genres = Array.isArray(d.genres) ? d.genres : []

  const shopLabel = item.shopLabel
                  || (item.source === 'fahasa' ? 'Fahasa'
                  : item.source === 'anilist' ? 'AniList'
                  : lang === 'vi' ? 'Đặt mua' : 'Shop')

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'linear-gradient(145deg,#0d1117,#1a1a2e)',
        borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '90vh',
        overflowY: 'auto', border: `1px solid ${color}30`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.8), 0 0 40px ${color}10` }}>

        {/* Cover banner */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden',
          borderRadius: '18px 18px 0 0', background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {cover
            ? <img src={cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => e.target.style.display='none'} />
            : <div style={{ fontSize: 64 }}>{TYPE_ICON[item.type]}</div>}
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(13,17,23,0.95) 0%, transparent 50%)' }} />
          {/* Close */}
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
            width: 32, height: 32, color: '#94A3B8', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          {/* Type badge */}
          <span style={{ position: 'absolute', top: 12, left: 12,
            fontSize: 9, padding: '3px 9px', borderRadius: 20,
            background: `${color}30`, color, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.8,
            border: `1px solid ${color}40` }}>
            {item.type}
          </span>
        </div>

        <div style={{ padding: '16px 20px 24px' }}>
          {/* Title */}
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 22, fontWeight: 700, color: '#f1f5f9',
            lineHeight: 1.2, marginBottom: 4 }}>
            {loading ? '…' : title}
          </div>
          {item.volume && (
            <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 12 }}>
              {item.volume}
            </div>
          )}

          {/* Release date */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: '#64748B' }}>
              {lang === 'vi' ? '📅 Ngày phát hành:' : '📅 Release date:'}
            </span>
            <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>
              {new Date(item.airsAt).toLocaleDateString(
                lang === 'vi' ? 'vi-VN' : 'en-US',
                { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </span>
          </div>

          {/* Meta grid */}
          {metaItems.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '8px 16px', marginBottom: 14,
              background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12 }}>
              {metaItems.map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 9, color: '#475569', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>{m.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {genres.map(g => (
                <span key={g} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20,
                  background: `${color}15`, color, border: `1px solid ${color}25` }}>{g}</span>
              ))}
            </div>
          )}

          {/* Description */}
          {loading
            ? <div style={{ color: '#374151', fontSize: 12 }}>
                {lang === 'vi' ? 'Đang tải...' : 'Loading details…'}
              </div>
            : desc
            ? <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.7,
                marginBottom: 16, maxHeight: 140, overflowY: 'auto',
                paddingRight: 4 }}>
                {desc.length > 600 ? desc.slice(0, 600) + '…' : desc}
              </p>
            : null}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {item.shopUrl && (
              <a href={item.shopUrl} target="_blank" rel="noreferrer"
                style={{ flex: 1, textAlign: 'center', padding: '9px 16px',
                  borderRadius: 10, background: color, color: '#fff',
                  fontWeight: 700, fontSize: 13, textDecoration: 'none',
                  fontFamily: "'Barlow Condensed', sans-serif" }}>
                🛒 {shopLabel}
              </a>
            )}
            <button onClick={onClose}
              style={{ padding: '9px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#64748B', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              {lang === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleItem({ item, lang, onOpen }) {
  const color   = TYPE_COLOR[item.type]
  const past    = isPast(item.airsAt)
  const edition = item.edition

  const priceLabel = item.price
    ? new Intl.NumberFormat('vi-VN').format(item.price) + '₫'
    : null

  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '10px 14px', borderRadius: 12,
      background: past ? 'rgba(255,255,255,0.02)' : `${color}08`,
      border: `1px solid ${past ? 'rgba(255,255,255,0.05)' : color + '25'}`,
      opacity: past ? 0.6 : 1, transition: 'all 0.2s',
    }}>
      <div onClick={onOpen} style={{ width: 36, height: 50, borderRadius: 6,
        background: `${color}20`, flexShrink: 0, overflow: 'hidden', cursor: 'pointer' }}>
        {item.cover
          ? <img src={item.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {TYPE_ICON[item.type]}
            </div>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div onClick={onOpen} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
          color: past ? '#475569' : '#e2e8f0', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          cursor: 'pointer' }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 20,
            background: `${color}20`, color, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {item.type}
          </span>
          {(item.publisher || item.author) && <span style={{ fontSize: 10, color: '#374151' }}>{item.publisher || item.author}</span>}
          {edition && (
            <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 20,
              background: 'rgba(139,92,246,0.2)', color: '#a78bfa',
              border: '1px solid rgba(139,92,246,0.4)', fontWeight: 700,
              letterSpacing: 0.3 }}>
              {edition}
            </span>
          )}
          {priceLabel && <span style={{ fontSize: 10, color: '#FBBF24', fontWeight: 600 }}>{priceLabel}</span>}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {item.shopUrl && !past && (
          <a href={item.shopUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6,
              background: `${color}20`, color, border: `1px solid ${color}40`,
              textDecoration: 'none', fontWeight: 600 }}>
            {item.shopLabel || (item.source === 'fahasa' ? 'Fahasa'
              : item.source === 'anilist' ? 'AniList'
              : lang === 'vi' ? 'Đặt mua' : 'Pre-order')}
          </a>
        )}
        {past && (
          <div style={{ fontSize: 9, color: '#374151' }}>
            {lang === 'vi' ? 'Đã phát hành' : 'Released'}
          </div>
        )}
      </div>
    </div>
  )
}

export function SchedulePage() {
  const { lang } = useLang()

  const [scheduleData, setScheduleData] = useState([])
  const [loadingData,  setLoadingData]  = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Join volumes ← series + volume_links in one request
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/volumes`
          + `?select=id,volume_label,volume_number,title,cover_url,description,release_date,price,is_special,source`
          + `,series!inner(id,item_type,title,cover_url,description,publisher,author,studio,genres,score,external_id)`
          + `,volume_links(id,link_type,label,url,affiliate_code)`
          + `&release_date=not.is.null`
          + `&order=release_date.asc`
          + `&limit=500`,
          { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
        )
        const data = await res.json()
        setScheduleData(Array.isArray(data) ? data : [])
      } catch(e) { console.error('Schedule fetch failed:', e) }
      finally { setLoadingData(false) }
    }
    fetchSchedule()
  }, [])

  // Normalize joined rows to internal shape
  const SCHEDULE = useMemo(() => scheduleData.map(r => {
    const s       = r.series || {}
    const links   = r.volume_links || []
    const shopLink= links.find(l => l.link_type === 'shop' && l.is_active !== false)
    const cover   = r.cover_url || s.cover_url || null
    // Build display title: series title + volume label
    const volPart = r.volume_label && r.volume_label !== 'Standalone' ? r.volume_label : null
    const displayTitle = volPart ? `${s.title} - ${volPart}` : s.title
    return {
      id:          r.id,
      type:        s.item_type || 'novel',
      title:       displayTitle,
      series_title:s.title,
      airsAt:      r.release_date ? r.release_date + 'T00:00:00' : null,
      cover,
      volume:      r.volume_label !== 'Standalone' ? r.volume_label : null,
      subtitle:    r.title || null,           // volume subtitle
      shopUrl:     shopLink?.url || null,
      shopLabel:   shopLink?.label || null,
      publisher:   s.publisher || null,
      author:      s.author     || null,
      price:       r.price     || null,
      source:      r.source    || 'fahasa',
      series_id:   s.id        || null,
      description: r.description || s.description || null,
      // pass series data for detail modal
      series:      s,
      is_special:  r.is_special || false,
      edition:     r.is_special ? 'Đặc Biệt' : null,
    }
  }).filter(r => r.airsAt), [scheduleData])

  const today = toYMD(new Date())
  const [typeFilter,  setTypeFilter]  = useState('all')
  const [detailItem,  setDetailItem]  = useState(null)
  const [dateMode,    setDateMode]    = useState('all')      // 'all' | 'single' | 'range'
  const [singleDate,  setSingleDate]  = useState(today)
  const [rangeStart,  setRangeStart]  = useState(today)
  const [rangeEnd,    setRangeEnd]    = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 6); return toYMD(d)
  })

  const filtered = useMemo(() => {
    let items = typeFilter === 'all' ? SCHEDULE : SCHEDULE.filter(i => i.type === typeFilter)

    if (dateMode === 'single') {
      items = items.filter(i => toYMD(new Date(i.airsAt)) === singleDate)
    } else if (dateMode === 'range' && rangeStart && rangeEnd) {
      const start = fromYMD(rangeStart)
      const end   = new Date(fromYMD(rangeEnd).getTime() + 86399999) // end of day
      items = items.filter(i => {
        const d = new Date(i.airsAt)
        return d >= start && d <= end
      })
    }

    return [...items].sort((a, b) => {
      const dateDiff = new Date(a.airsAt) - new Date(b.airsAt)
      if (dateDiff !== 0) return dateDiff
      return (a.series_title || a.title).localeCompare(b.series_title || b.title, 'vi')
    })
  }, [SCHEDULE, typeFilter, dateMode, singleDate, rangeStart, rangeEnd])

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach(item => {
      const key = toYMD(new Date(item.airsAt))
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    })
    return map
  }, [filtered])

  const todayCount = filtered.filter(i => isToday(i.airsAt)).length
  const weekCount  = filtered.filter(i => {
    const diff = (new Date(i.airsAt) - new Date()) / 86400000
    return diff >= 0 && diff <= 7
  }).length

  if (loadingData) return (
    <div className="page-enter">
      <AppHeader activeTab="#/schedule" accent={CYAN}
        searchInput="" onSearch={() => {}} sorts={[]}
        activeSort="" onSort={() => {}} hideSearch hideSorts />
      <div style={{ textAlign: 'center', padding: 80, color: '#475569' }}>
        {lang === 'vi' ? 'Đang tải lịch phát hành…' : 'Loading schedule…'}
      </div>
    </div>
  )

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/schedule" accent={CYAN}
        searchInput="" onSearch={() => {}} sorts={[]}
        activeSort="" onSort={() => {}} hideSearch hideSorts />

      <HeroBanner
        title={lang === 'vi' ? 'LỊCH PHÁT HÀNH' : 'RELEASE SCHEDULE'}
        sub={lang === 'vi'
          ? `${todayCount} phát hôm nay · ${weekCount} trong tuần này`
          : `${todayCount} releasing today · ${weekCount} this week`}
        accent={CYAN} src="Schedule" />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

        {/* Type filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all','anime','manga','novel'].map(type => {
            const color  = type === 'all' ? PURPLE : TYPE_COLOR[type]
            const active = typeFilter === type
            const labels = { all: lang === 'vi' ? 'Tất cả' : 'All', anime: 'Anime', manga: 'Manga', novel: 'Novel' }
            return (
              <button key={type} onClick={() => setTypeFilter(type)} style={{
                background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? color+'60' : 'rgba(255,255,255,0.08)'}`,
                color: active ? color : '#64748B',
                padding: '7px 18px', borderRadius: 20, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                fontFamily: "'Be Vietnam Pro', sans-serif", transition: 'all 0.15s',
              }}>
                {type !== 'all' && TYPE_ICON[type] + ' '}{labels[type]}
              </button>
            )
          })}
        </div>

        {/* Date selector */}
        <DateSelector lang={lang}
          dateMode={dateMode} setDateMode={setDateMode}
          singleDate={singleDate} setSingleDate={setSingleDate}
          rangeStart={rangeStart} setRangeStart={setRangeStart}
          rangeEnd={rangeEnd} setRangeEnd={setRangeEnd} />

        {/* Result count */}
        {dateMode !== 'all' && (
          <div style={{ fontSize: 11, color: '#374151', marginBottom: 16,
            fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {filtered.length > 0
              ? lang === 'vi'
                ? `${filtered.length} mục trong khoảng thời gian đã chọn`
                : `${filtered.length} release${filtered.length !== 1 ? 's' : ''} in selected period`
              : lang === 'vi' ? 'Không có mục nào' : 'No releases found'
            }
          </div>
        )}

        {/* Grouped by day */}
        {[...grouped.entries()].map(([dayKey, items]) => {
          const date     = fromYMD(dayKey)
          const isToday_ = dayKey === today
          const dayName  = isToday_
            ? (lang === 'vi' ? 'Hôm nay' : 'Today')
            : (lang === 'vi' ? DAY_NAMES_VI : DAY_NAMES)[date.getDay()]

          return (
            <div key={dayKey} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: isToday_ ? 22 : 16, fontWeight: 700, letterSpacing: 1,
                  color: isToday_ ? CYAN : '#475569',
                }}>{dayName}</div>
                <div style={{ fontSize: 11, color: '#374151',
                  fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  {formatDate(items[0].airsAt, lang)}
                </div>
                {isToday_ && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%',
                    background: CYAN, boxShadow: `0 0 8px ${CYAN}`,
                    animation: 'pulse 1.5s infinite' }} />
                )}
                <div style={{ flex: 1, height: 1,
                  background: isToday_
                    ? `linear-gradient(to right, ${CYAN}30, transparent)`
                    : 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: 10, color: '#374151' }}>
                  {items.length} {lang === 'vi' ? 'mục' : 'items'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(item => <ScheduleItem key={item.id} item={item} lang={lang} onOpen={() => setDetailItem(item)} />)}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22, color: '#4B5563' }}>
              {lang === 'vi' ? 'Không có lịch phát hành' : 'No releases scheduled'}
            </div>
            {dateMode !== 'all' && (
              <button onClick={() => setDateMode('all')} style={{
                marginTop: 14, background: 'none',
                border: `1px solid ${CYAN}30`, color: CYAN,
                padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>
                {lang === 'vi' ? '↺ Xem tất cả' : '↺ Show all dates'}
              </button>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: '#1F2937' }}>
          {lang === 'vi'
            ? '⚡ Dữ liệu lịch phát hành từ bảng volumes · series · volume_links.'
            : '⚡ Schedule data will be auto-updated from AniList & MangaDex in production.'}
        </div>
      </main>

      {detailItem && (
        <ScheduleDetailModal
          item={detailItem}
          lang={lang}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  )
}
