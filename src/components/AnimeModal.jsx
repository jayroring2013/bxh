import React, { useEffect } from 'react'
import { getExternalLinks, LINK_CONFIG } from '../mockData.js'
import { CYAN, animeStatusColor, animeStatusLabel } from '../constants.js'
import { ModalShell, ModalBody } from './ModalLayout.jsx'

export function AnimeModal({ anime, onClose }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  const title  = anime.title_english || anime.title_romaji || anime.title?.english || anime.title?.romaji
  const romaji = anime.title_romaji  || anime.title?.romaji
  const native = anime.title_native  || anime.title?.native
  const cover  = anime.cover_large   || anime.coverImage?.extraLarge || anime.coverImage?.large
  const banner = anime.banner_image  || anime.bannerImage
  const desc   = (anime.description  || '').replace(/<[^>]*>/g, '')
  const studio = anime.studio        || anime.studios?.nodes?.[0]?.name
  const score  = anime.average_score ?? anime.averageScore
  const eps    = anime.episodes
  const dur    = anime.duration
  const year   = anime.season_year   || anime.startDate?.year
  const favs   = anime.favourites
  const url    = anime.site_url      || anime.siteUrl
  const start  = anime.start_date    || (anime.startDate?.year ? `${anime.startDate.year}-${String(anime.startDate.month||1).padStart(2,'0')}-${String(anime.startDate.day||1).padStart(2,'0')}` : null)
  const end    = anime.end_date      || (anime.endDate?.year   ? `${anime.endDate.year}-${String(anime.endDate.month||1).padStart(2,'0')}-${String(anime.endDate.day||1).padStart(2,'0')}` : null)
  const extLinks = Object.entries(getExternalLinks(anime.id, 'anime')).filter(([k,v]) => v && k !== 'anilist')

  const bg = 'linear-gradient(145deg,#0a0f1e 0%,#0c1a2e 60%,#0a0f1e 100%)'

  return (
    <ModalShell onClose={onClose} accentColor={CYAN} bg={bg}>
      {banner && (
        <div style={{ position: 'relative', height: 160, overflow: 'hidden', flexShrink: 0 }}>
          <img src={banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #0a0f1e 100%)' }} />
        </div>
      )}
      <ModalBody cover={cover} coverBg="#050810" accentColor={CYAN} coverEmoji="🎌">
        <div className="modal-tags">
          {(anime.genres || []).slice(0,5).map(g => (
            <span key={g} className="modal-tag" style={{ background: `${CYAN}1a`, borderColor: `${CYAN}40`, color: '#67E8F9' }}>{g}</span>
          ))}
          {anime.status && (
            <span className="modal-tag" style={{
              background: animeStatusColor(anime.status).replace(/[\d.]+\)$/, '0.15)'),
              borderColor: animeStatusColor(anime.status).replace(/[\d.]+\)$/, '0.4)'), color: '#fff'
            }}>{animeStatusLabel(anime.status)}</span>
          )}
          {anime.format && (
            <span className="modal-tag" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8' }}>{anime.format}</span>
          )}
        </div>
        <h2 className="modal-title">{title}</h2>
        {romaji && romaji !== title && <div className="modal-title-sub">{romaji}</div>}
        {native && <div className="modal-title-orig">{native}</div>}
        {studio && <div className="modal-author">by {studio}</div>}
        <div className="modal-stats">
          {[
            { label: 'SCORE',    value: score ? `${score}/100` : 'N/A' },
            { label: 'EPISODES', value: eps || '?' },
            { label: 'DURATION', value: dur ? `${dur}m` : '?' },
            { label: 'YEAR',     value: year || '?' },
            { label: 'FAVS',     value: favs?.toLocaleString() || '?' },
          ].map(({ label, value }) => (
            <div key={label} className="modal-stat">
              <div className="modal-stat__value" style={{ color: CYAN }}>{value}</div>
              <div className="modal-stat__label">{label}</div>
            </div>
          ))}
        </div>
        {desc && <p className="modal-desc">{desc.length > 450 ? desc.slice(0,450)+'...' : desc}</p>}
        {(start || end) && (
          <div className="date-chips">
            {start && <div className="date-chip"><span className="date-chip__label">START </span><span className="date-chip__value">{start}</span></div>}
            {end   && <div className="date-chip"><span className="date-chip__label">END </span><span className="date-chip__value">{end}</span></div>}
          </div>
        )}
        <div className="modal-links">
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="modal-link"
              style={{ background: `${CYAN}20`, borderColor: `${CYAN}40`, color: '#67E8F9' }}>
              View on AniList
            </a>
          )}
          {extLinks.map(([k, v]) => {
            const cfg = LINK_CONFIG[k]
            if (!cfg) return null
            return (
              <a key={k} href={v} target="_blank" rel="noreferrer" className="modal-link"
                style={{ background: `${cfg.color}18`, borderColor: `${cfg.color}35`, color: cfg.color }}>
                {cfg.label}
              </a>
            )
          })}
        </div>
      </ModalBody>
    </ModalShell>
  )
}
