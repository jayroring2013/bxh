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

function ScheduleItem({ item, lang }) {
  const color = TYPE_COLOR[item.type]
  const past  = isPast(item.airsAt)

  const subLabel = item.volume || (item.episode ? `Ep.${item.episode}` : '')
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
      <div style={{ width: 36, height: 50, borderRadius: 6,
        background: `${color}20`, flexShrink: 0, overflow: 'hidden' }}>
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
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
          color: past ? '#475569' : '#e2e8f0', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 20,
            background: `${color}20`, color, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {item.type}
          </span>
          {subLabel && <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>{subLabel}</span>}
          {item.publisher && <span style={{ fontSize: 10, color: '#374151' }}>{item.publisher}</span>}
          {priceLabel && <span style={{ fontSize: 10, color: '#FBBF24', fontWeight: 600 }}>{priceLabel}</span>}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {item.shopUrl && !past && (
          <a href={item.shopUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6,
              background: `${color}20`, color, border: `1px solid ${color}40`,
              textDecoration: 'none', fontWeight: 600 }}>
            {lang === 'vi' ? 'Đặt mua' : 'Pre-order'}
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
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/release_schedule?order=release_date.asc&limit=500`,
          { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
        )
        const data = await res.json()
        setScheduleData(Array.isArray(data) ? data : [])
      } catch(e) { console.error('Schedule fetch failed:', e) }
      finally { setLoadingData(false) }
    }
    fetchSchedule()
  }, [])

  // Normalize DB rows to internal shape
  const SCHEDULE = useMemo(() => scheduleData.map(r => ({
    id:     r.id,
    type:   r.item_type,
    title:  r.title,
    airsAt: r.release_date ? r.release_date + 'T00:00:00' : null,
    cover:  r.cover_url || null,
    ep:     r.episode   || null,
    volume: r.volume    || null,
    shopUrl: r.shop_url || null,
    publisher: r.publisher || null,
    price:  r.price     || null,
    source: r.source    || null,
  })).filter(r => r.airsAt), [scheduleData])

  const today = toYMD(new Date())
  const [typeFilter,  setTypeFilter]  = useState('all')
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

    return [...items].sort((a, b) => new Date(a.airsAt) - new Date(b.airsAt))
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
                {items.map(item => <ScheduleItem key={item.id} item={item} lang={lang} />)}
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
            ? '⚡ Dữ liệu lịch phát hành sẽ được cập nhật tự động từ AniList, MangaDex.'
            : '⚡ Schedule data will be auto-updated from AniList & MangaDex in production.'}
        </div>
      </main>
    </div>
  )
}
