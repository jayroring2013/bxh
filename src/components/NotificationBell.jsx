import React, { useState, useEffect, useRef } from 'react'
import { useNotifications } from '../context/NotificationContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { CYAN } from '../constants.js'

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const ref  = useRef()

  // Close on outside click
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const hasUnread = unreadCount > 0

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Bell button */}
      <button onClick={() => { setOpen(p => !p); if (!open && hasUnread) markAllRead() }}
        style={{
          position: 'relative', width: 34, height: 34, borderRadius: '50%',
          background: hasUnread ? `${CYAN}20` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${hasUnread ? CYAN + '50' : 'rgba(255,255,255,0.12)'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        title={lang === 'vi' ? 'Thông báo' : 'Notifications'}>
        {/* Bell SVG */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={hasUnread ? CYAN : '#64748B'} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {/* Unread badge */}
        {hasUnread && (
          <div style={{
            position: 'absolute', top: -3, right: -3,
            width: 16, height: 16, borderRadius: '50%',
            background: '#F87171', border: '2px solid #0a0f1e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 900, color: '#fff',
            fontFamily: "'Be Vietnam Pro', sans-serif",
            animation: 'pulse 1.5s infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 42, right: 0, zIndex: 9999,
          width: 320, maxHeight: 420, overflowY: 'auto',
          background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: 0.5 }}>
              🔔 {lang === 'vi' ? 'Thông báo' : 'Notifications'}
            </span>
            {notifications.some(n => !n.read) && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none', color: CYAN,
                cursor: 'pointer', fontSize: 11,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>
                {lang === 'vi' ? 'Đánh dấu đã đọc' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notification list */}
          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
              <div style={{ fontSize: 12, color: '#374151',
                fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {lang === 'vi'
                  ? 'Không có thông báo nào. Theo dõi series để nhận thông báo!'
                  : 'No notifications. Follow a series to get notified!'}
              </div>
              <a href="#/list" onClick={() => setOpen(false)} style={{
                display: 'inline-block', marginTop: 12,
                fontSize: 11, color: CYAN, textDecoration: 'none',
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>
                {lang === 'vi' ? '→ Danh sách của tôi' : '→ Go to My List'}
              </a>
            </div>
          ) : (
            notifications.map(notif => (
              <NotifItem key={notif.id} notif={notif} lang={lang} onRead={markRead} />
            ))
          )}

          {/* Footer hint */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
              fontSize: 10, color: '#1F2937', textAlign: 'center',
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {lang === 'vi'
                ? `Thông báo cho series phát hành trong vòng 24 giờ tới`
                : `Notifications for releases within the next 24 hours`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NotifItem({ notif, lang, onRead }) {
  const { item } = notif
  const isUnread = !notif.read

  const timeLeft = () => {
    const diff = new Date(item.airsAt) - new Date()
    const hrs  = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    if (hrs > 0) return lang === 'vi' ? `còn ${hrs} giờ` : `in ${hrs}h`
    return lang === 'vi' ? `còn ${mins} phút` : `in ${mins}m`
  }

  const typeColor = { anime: '#67E8F9', manga: '#FDA4AF', novel: '#C4B5FD' }
  const color = typeColor[item.type] || '#94A3B8'

  return (
    <div onClick={() => onRead(notif.id)} style={{
      padding: '12px 16px', cursor: 'pointer',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: isUnread ? 'rgba(103,232,249,0.04)' : 'transparent',
      transition: 'background 0.15s',
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
    onMouseLeave={e => e.currentTarget.style.background = isUnread ? 'rgba(103,232,249,0.04)' : 'transparent'}>

      {/* Cover or icon */}
      <div style={{
        width: 38, height: 52, borderRadius: 7, overflow: 'hidden',
        flexShrink: 0, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {item.cover
          ? <img src={item.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.style.display='none'} />
          : { anime: '🎌', manga: '📚', novel: '📖' }[item.type]
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Message */}
        <div style={{
          fontSize: 12, color: isUnread ? '#e2e8f0' : '#64748B',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          lineHeight: 1.4, marginBottom: 6,
        }}>
          {lang === 'vi' ? notif.messageVi : notif.messageEn}
        </div>

        {/* Time badge + type */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 20,
            background: `${color}18`, color, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>{item.type}</span>
          <span style={{ fontSize: 10, color: CYAN, fontWeight: 700 }}>
            ⏰ {timeLeft()}
          </span>
          {isUnread && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#F87171', flexShrink: 0,
            }} />
          )}
        </div>
      </div>
    </div>
  )
}
