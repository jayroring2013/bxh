import React, { useState, useEffect } from 'react'
import { PURPLE, novelStatusColor } from '../constants.js'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { ModalShell, ModalBody } from './ModalLayout.jsx'

const sbHeaders = {
  apikey: SUPABASE_ANON,
  Authorization: `Bearer ${SUPABASE_ANON}`,
}

export function NovelModal({ series, onClose }) {
  const [volumes,  setVolumes]  = useState([])
  const [links,    setLinks]    = useState([])
  const [ldg,      setLdg]      = useState(true)

  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)

    // Fetch volumes and series_links in parallel
    Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/volumes?series_id=eq.${series.id}&is_special=eq.false&order=volume_number.asc&select=id,volume_label,volume_number,title&limit=100`, { headers: sbHeaders })
        .then(r => r.json()).catch(() => []),
      fetch(`${SUPABASE_URL}/rest/v1/series_links?series_id=eq.${series.id}&select=link_type,label,url&limit=20`, { headers: sbHeaders })
        .then(r => r.json()).catch(() => []),
    ]).then(([vols, lnks]) => {
      setVolumes(Array.isArray(vols) ? vols : [])
      setLinks(Array.isArray(lnks) ? lnks : [])
      setLdg(false)
    })

    return () => window.removeEventListener('keydown', esc)
  }, [series.id])

  const cover  = series.cover_url || null
  const title  = series.title || 'Unknown'
  const genres = Array.isArray(series.genres) ? series.genres : []
  const desc   = typeof series.description === 'object'
    ? series.description?.en
    : series.description || ''
  const status = series.status || null

  // Link type display config
  const LINK_STYLES = {
    shop:     { color: '#F59E0B', label: 'Shop' },
    buy:      { color: '#F59E0B', label: 'Mua sách' },
    read:     { color: '#06B6D4', label: 'Đọc online' },
    watch:    { color: '#06B6D4', label: 'Xem anime' },
    trailer:  { color: '#EF4444', label: 'Trailer' },
    official: { color: '#8B5CF6', label: 'Official' },
    raw:      { color: '#7a6045', label: 'Raws' },
    anilist:  { color: '#02A9FF', label: 'AniList' },
    mal:      { color: '#2E51A2', label: 'MyAnimeList' },
  }

  const bg = 'linear-gradient(145deg,#1a1410 0%,#2a1f10 60%,#1a1410 100%)'

  return (
    <ModalShell onClose={onClose} accentColor={PURPLE} bg={bg}>
      <ModalBody cover={cover} coverBg="#0a0f1e" accentColor={PURPLE} coverEmoji="📖">

        {/* Genre + status tags */}
        <div className="modal-tags">
          {genres.slice(0, 5).map(g => (
            <span key={g} className="modal-tag" style={{
              background: 'rgba(139,92,246,0.15)',
              borderColor: 'rgba(139,92,246,0.3)',
              color: '#C4B5FD',
            }}>{g}</span>
          ))}
          {status && (
            <span className="modal-tag" style={{
              background:  novelStatusColor(status).replace(/[\d.]+\)$/, '0.15)'),
              borderColor: novelStatusColor(status).replace(/[\d.]+\)$/, '0.4)'),
              color: '#fff', textTransform: 'capitalize',
            }}>{status}</span>
          )}
        </div>

        {/* Title */}
        <h2 className="modal-title">{title}</h2>
        {series.author && <div className="modal-author">by {series.author}</div>}

        {/* Stats row */}
        <div className="modal-stats">
          {[
            { label: 'VOLUMES', value: volumes.length || '?' },
            { label: 'PUBLISHER', value: series.publisher || '—' },
            { label: 'SCORE', value: series.score != null ? `${Number(series.score).toFixed(1)}/10` : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="modal-stat">
              <div className="modal-stat__value" style={{ color: PURPLE }}>{value}</div>
              <div className="modal-stat__label">{label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {ldg
          ? <p className="modal-desc" style={{ color: '#3d2e1e' }}>Đang tải...</p>
          : desc && <p className="modal-desc">{desc.length > 450 ? desc.slice(0, 450) + '…' : desc}</p>
        }

        {/* Volume list */}
        {volumes.length > 0 && (
          <div>
            <div className="modal-section-label">TẬP SÁCH ({volumes.length})</div>
            <div className="modal-volumes">
              {volumes.slice(0, 12).map(v => (
                <div key={v.id} className="modal-vol-chip" title={v.title || v.volume_label}>
                  {v.volume_label === 'Standalone' ? 'Tập 1' : (v.volume_label || `Vol.${v.volume_number}`)}
                </div>
              ))}
              {volumes.length > 12 && (
                <div className="modal-vol-more">+{volumes.length - 12} more</div>
              )}
            </div>
          </div>
        )}

        {/* External links */}
        {(links.length > 0 || series.external_id) && (
          <div className="modal-links">
            {series.external_id && (
              <a href={`https://ranobedb.org/series/${series.external_id}`}
                target="_blank" rel="noreferrer" className="modal-link"
                style={{ background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.3)', color: '#C4B5FD' }}>
                RanobeDB
              </a>
            )}
            {links.map((lnk, i) => {
              const cfg = LINK_STYLES[lnk.link_type] || { color: '#7a6045', label: lnk.label || lnk.link_type }
              return (
                <a key={i} href={lnk.url} target="_blank" rel="noreferrer" className="modal-link"
                  style={{ background: `${cfg.color}18`, borderColor: `${cfg.color}35`, color: cfg.color }}>
                  {lnk.label || cfg.label}
                </a>
              )
            })}
          </div>
        )}

      </ModalBody>
    </ModalShell>
  )
}
