import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getExternalLinks, getExternalLinksAsync, LINK_CONFIG } from '../mockData.js'
import { useLang } from '../context/LangContext.jsx'

function ViewOnPopup({ links, title, onClose }) {
  const { lang } = useLang()
  const entries  = Object.entries(links).filter(([,url]) => url)

  if (entries.length === 0) return null

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg,#0f0f1a,#1a1a2e)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 20, width: '100%', maxWidth: 300,
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14, color: '#94A3B8',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 220 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            color: '#475569', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map(([key, url]) => {
            const cfg = LINK_CONFIG[key]
            if (!cfg) return null
            return (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: `${cfg.color}10`,
                  border: `1px solid ${cfg.color}30`,
                  color: cfg.color, borderRadius: 10, padding: '10px 14px',
                  textDecoration: 'none', fontSize: 13, fontWeight: 600,
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${cfg.color}20`; e.currentTarget.style.borderColor = `${cfg.color}60` }}
                onMouseLeave={e => { e.currentTarget.style.background = `${cfg.color}10`; e.currentTarget.style.borderColor = `${cfg.color}30` }}
              >
                {lang === 'vi' ? cfg.labelVi : cfg.label}
                <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}>↗</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export function ViewOnButton({ itemId, itemType, title }) {
  const { lang }        = useLang()
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState(() => getExternalLinks(itemId, itemType))
  const [loaded, setLoaded] = useState(false)

  // Always fetch DB links — may add buttons that weren't in static defaults
  useEffect(() => {
    getExternalLinksAsync(itemId, itemType).then(l => { setLinks(l); setLoaded(true) })
  }, [itemId, itemType])

  const count = Object.values(links).filter(Boolean).length

  // Don't hide until DB fetch completes — avoids flash of missing buttons
  if (loaded && count === 0) return null
  if (!loaded && count === 0) return null

  const label = lang === 'vi' ? '🔗 Xem' : '🔗 View'

  return (
    <>
      <button
        onClick={e => { e.stopPropagation(); setOpen(true) }}
        style={{
          position: 'absolute', bottom: 10, left: 10, zIndex: 10,
          background: 'rgba(15,15,26,0.88)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#94A3B8',
          borderRadius: 8, padding: '5px 9px', cursor: 'pointer',
          fontSize: 10, fontWeight: 700, backdropFilter: 'blur(8px)',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#94A3B8' }}
      >
        {label}
        {count > 1 && <span style={{ marginLeft: 4, opacity: 0.5, fontSize: 9 }}>{count}</span>}
      </button>

      {open && (
        <ViewOnPopup links={links} title={title} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
