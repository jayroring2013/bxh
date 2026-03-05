import React, { useState, useMemo } from 'react'
import { PURPLE, CYAN, ROSE } from '../constants.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner } from '../components/Shared.jsx'
import { SCHEDULE_MOCK } from '../mockData.js'

const TYPE_COLOR = { anime: CYAN, manga: ROSE, novel: PURPLE }
const TYPE_ICON  = { anime: '🎌', manga: '📚', novel: '📖' }
const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAY_NAMES_VI = ['CN','T2','T3','T4','T5','T6','T7']

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
function getDayKey(iso) {
  return new Date(iso).toDateString()
}
function isToday(iso) {
  return new Date(iso).toDateString() === new Date().toDateString()
}
function isPast(iso) {
  return new Date(iso) < new Date()
}

function ScheduleItem({ item, lang }) {
  const color = TYPE_COLOR[item.type]
  const past  = isPast(item.airsAt)

  const subLabel = item.episode
    ? `EP ${item.episode}`
    : item.chapter
    ? `CH ${item.chapter}`
    : item.volume
    ? `VOL ${item.volume}`
    : ''

  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '10px 14px', borderRadius: 12,
      background: past ? 'rgba(255,255,255,0.02)' : `${color}08`,
      border: `1px solid ${past ? 'rgba(255,255,255,0.05)' : color + '25'}`,
      opacity: past ? 0.5 : 1,
      transition: 'all 0.2s',
    }}>
      {/* Cover */}
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

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
          color: past ? '#475569' : '#e2e8f0', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 20,
            background: `${color}20`, color: color,
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {item.type}
          </span>
          {subLabel && (
            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {/* Time */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700,
          color: past ? '#374151' : color,
          fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {formatTime(item.airsAt)}
        </div>
        {past && (
          <div style={{ fontSize: 9, color: '#374151', marginTop: 2 }}>
            {lang === 'vi' ? 'Đã phát' : 'Released'}
          </div>
        )}
      </div>
    </div>
  )
}

export function SchedulePage() {
  const { lang, t }    = useLang()
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    const items = typeFilter === 'all'
      ? SCHEDULE_MOCK
      : SCHEDULE_MOCK.filter(i => i.type === typeFilter)
    return [...items].sort((a, b) => new Date(a.airsAt) - new Date(b.airsAt))
  }, [typeFilter])

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach(item => {
      const key = getDayKey(item.airsAt)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    })
    return map
  }, [filtered])

  const todayCount = filtered.filter(i => isToday(i.airsAt)).length
  const weekCount  = filtered.filter(i => {
    const d = new Date(i.airsAt)
    const now = new Date()
    const diff = (d - now) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  }).length

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
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'anime', 'manga', 'novel'].map(type => {
            const color = type === 'all' ? PURPLE : TYPE_COLOR[type]
            const active = typeFilter === type
            const labels = {
              all:   lang === 'vi' ? 'Tất cả' : 'All',
              anime: 'Anime', manga: 'Manga',
              novel: lang === 'vi' ? 'Novel' : 'Novel',
            }
            return (
              <button key={type} onClick={() => setTypeFilter(type)} style={{
                background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.08)'}`,
                color: active ? color : '#64748B',
                padding: '7px 18px', borderRadius: 20, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                transition: 'all 0.15s',
              }}>
                {type !== 'all' && TYPE_ICON[type] + ' '}{labels[type]}
              </button>
            )
          })}
        </div>

        {/* Grouped by day */}
        {[...grouped.entries()].map(([dayKey, items]) => {
          const date    = new Date(dayKey)
          const isToday_ = dayKey === new Date().toDateString()
          const dayName = isToday_
            ? (lang === 'vi' ? 'Hôm nay' : 'Today')
            : (lang === 'vi' ? DAY_NAMES_VI : DAY_NAMES)[date.getDay()]

          return (
            <div key={dayKey} style={{ marginBottom: 28 }}>
              {/* Day header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: isToday_ ? 22 : 16,
                  fontWeight: 700, letterSpacing: 1,
                  color: isToday_ ? CYAN : '#475569',
                }}>
                  {dayName}
                </div>
                <div style={{ fontSize: 11, color: '#374151',
                  fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  {formatDate(items[0].airsAt)}
                </div>
                {isToday_ && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: CYAN, boxShadow: `0 0 8px ${CYAN}`,
                    animation: 'pulse 1.5s infinite',
                  }} />
                )}
                <div style={{ flex: 1, height: 1,
                  background: isToday_
                    ? `linear-gradient(to right, ${CYAN}30, transparent)`
                    : 'rgba(255,255,255,0.05)' }} />
                <span style={{ fontSize: 10, color: '#374151' }}>
                  {items.length} {lang === 'vi' ? 'mục' : 'items'}
                </span>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(item => (
                  <ScheduleItem key={item.id} item={item} lang={lang} />
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#374151' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 22, color: '#4B5563' }}>
              {lang === 'vi' ? 'Không có lịch' : 'No releases scheduled'}
            </div>
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
