import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CYAN, animeStatusColor, animeStatusLabel } from '../constants.js'

export function AnimeModal({ anime, onClose }) {

  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  // Support both flat (Supabase) and nested (AniList) shapes
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

  return createPortal(
    <div className="nt-overlay" onClick={onClose}>
      <div className="nt-modal" onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(145deg,#0a0f1e 0%,#0c1a2e 60%,#0a0f1e 100%)',
          border: `1px solid ${CYAN}30`, boxShadow: '0 40px 100px rgba(0,0,0,0.9)' }}>
        <button className="modal-close" onClick={onClose}>×</button>

        {banner && (
          <div className="modal-banner">
            <img src={banner} alt="" />
            <div className="modal-banner__fade" />
          </div>
        )}

        <div className="modal-body" style={{ marginTop: banner ? -40 : 0 }}>
          <div className="modal-cover" style={{ zIndex: 1 }}>
            {cover
              ? <img src={cover} alt={title} />
              : <div className="modal-cover__placeholder" style={{ background: 'linear-gradient(135deg,#0c1a2e,#0f172a)' }}>🎌</div>
            }
            <div className="modal-cover__fade" style={{ background: `linear-gradient(to right,transparent 50%,#0a0f1e 100%)` }} />
          </div>

          <div className="modal-content">
            <div className="modal-tags">
              {(anime.genres || []).slice(0,5).map(g => (
                <span key={g} className="modal-tag"
                  style={{ background: `${CYAN}1a`, borderColor: `${CYAN}40`, color: '#67E8F9' }}>{g}</span>
              ))}
              {anime.status && (
                <span className="modal-tag" style={{
                  background:  animeStatusColor(anime.status).replace(/[\d.]+\)$/, '0.15)'),
                  borderColor: animeStatusColor(anime.status).replace(/[\d.]+\)$/, '0.4)'),
                  color: '#fff' }}>
                  {animeStatusLabel(anime.status)}
                </span>
              )}
              {anime.format && (
                <span className="modal-tag"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8' }}>
                  {anime.format}
                </span>
              )}
            </div>

            <h2 className="modal-title">{title}</h2>
            {romaji && romaji !== title && <div className="modal-title-sub">{romaji}</div>}
            {native && <div className="modal-title-orig">{native}</div>}
            {studio && <div className="modal-author">by {studio}</div>}

            <div className="modal-stats">
              {[
                { label: 'SCORE',    value: score ? `${score}/100` : 'N/A' },
                { label: 'EPISODES', value: eps   || '?'                   },
                { label: 'DURATION', value: dur   ? `${dur}m` : '?'        },
                { label: 'YEAR',     value: year  || '?'                   },
                { label: 'FAVS',     value: favs?.toLocaleString() || '?'  },
              ].map(({ label, value }) => (
                <div key={label} className="modal-stat">
                  <div className="modal-stat__value" style={{ color: CYAN }}>{value}</div>
                  <div className="modal-stat__label">{label}</div>
                </div>
              ))}
            </div>

            {desc && (
              <p className="modal-desc">{desc.length > 450 ? desc.slice(0,450)+'…' : desc}</p>
            )}

            {(start || end) && (
              <div className="date-chips">
                {start && <div className="date-chip"><span className="date-chip__label">START </span><span className="date-chip__value">{start}</span></div>}
                {end   && <div className="date-chip"><span className="date-chip__label">END </span><span className="date-chip__value">{end}</span></div>}
              </div>
            )}

            {url && (
              <div className="modal-links">
                <a href={url} target="_blank" rel="noreferrer" className="modal-link"
                  style={{ background: `${CYAN}20`, borderColor: `${CYAN}40`, color: '#67E8F9' }}>
                  ↗ View on AniList
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}
