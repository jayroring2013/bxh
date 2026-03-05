import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CYAN, animeStatusColor, animeStatusLabel, fmtDate } from '../constants.js'

export function AnimeModal({ anime, onClose }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  const title  = anime.title?.english || anime.title?.romaji
  const romaji = anime.title?.romaji
  const native = anime.title?.native
  const cover  = anime.coverImage?.extraLarge || anime.coverImage?.large
  const desc   = (anime.description || '').replace(/<[^>]*>/g, '')
  const studio = anime.studios?.nodes?.[0]?.name
  const nextEp = anime.nextAiringEpisode

  return createPortal(
    <div className="nt-overlay" onClick={onClose}>
      <div
        className="nt-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg,#0a0f1e 0%,#0c1a2e 60%,#0a0f1e 100%)',
          border:     `1px solid ${CYAN}30`,
          boxShadow:  '0 40px 100px rgba(0,0,0,0.9)',
        }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Banner */}
        {anime.bannerImage && (
          <div className="modal-banner">
            <img src={anime.bannerImage} alt="" />
            <div className="modal-banner__fade" />
          </div>
        )}

        <div className="modal-body" style={{ marginTop: anime.bannerImage ? -40 : 0 }}>
          {/* Cover */}
          <div className="modal-cover" style={{ zIndex: 1 }}>
            {cover
              ? <img src={cover} alt={title} />
              : <div className="modal-cover__placeholder" style={{ background: 'linear-gradient(135deg,#0c1a2e,#0f172a)' }}>🎌</div>
            }
            <div className="modal-cover__fade" style={{ background: `linear-gradient(to right,transparent 50%,#0a0f1e 100%)` }} />
          </div>

          {/* Content */}
          <div className="modal-content">
            {/* Genre / status tags */}
            <div className="modal-tags">
              {(anime.genres || []).slice(0, 5).map(g => (
                <span
                  key={g}
                  className="modal-tag"
                  style={{ background: `${CYAN}1a`, borderColor: `${CYAN}40`, color: '#67E8F9' }}
                >
                  {g}
                </span>
              ))}
              {anime.status && (
                <span
                  className="modal-tag"
                  style={{
                    background:  animeStatusColor(anime.status).replace(/[\d.]+\)$/, '0.15)'),
                    borderColor: animeStatusColor(anime.status).replace(/[\d.]+\)$/, '0.4)'),
                    color: '#fff',
                  }}
                >
                  {animeStatusLabel(anime.status)}
                </span>
              )}
              {anime.format && (
                <span
                  className="modal-tag"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8' }}
                >
                  {anime.format}
                </span>
              )}
            </div>

            <h2 className="modal-title">{title}</h2>
            {romaji && romaji !== title && <div className="modal-title-sub">{romaji}</div>}
            {native && <div className="modal-title-orig">{native}</div>}
            {studio && <div className="modal-author">by {studio}</div>}

            {/* Stats */}
            <div className="modal-stats">
              {[
                { label: 'SCORE',    value: anime.averageScore ? `${anime.averageScore}/100` : 'N/A' },
                { label: 'EPISODES', value: anime.episodes  || '?' },
                { label: 'DURATION', value: anime.duration  ? `${anime.duration}m` : '?' },
                { label: 'YEAR',     value: anime.seasonYear || anime.startDate?.year || '?' },
                { label: 'FAVS',     value: anime.favourites?.toLocaleString() || '?' },
              ].map(({ label, value }) => (
                <div key={label} className="modal-stat">
                  <div className="modal-stat__value" style={{ color: CYAN }}>{value}</div>
                  <div className="modal-stat__label">{label}</div>
                </div>
              ))}
            </div>

            {/* Next episode */}
            {nextEp && (
              <div className="airing-badge" style={{ background: `${CYAN}10`, border: `1px solid ${CYAN}30` }}>
                <span className="airing-badge__dot" style={{ background: CYAN }} />
                <span style={{ color: '#67E8F9', fontSize: 12, fontWeight: 600 }}>
                  Ep {nextEp.episode} airing {new Date(nextEp.airingAt * 1000).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Description */}
            {desc && (
              <p className="modal-desc">
                {desc.length > 450 ? desc.slice(0, 450) + '…' : desc}
              </p>
            )}

            {/* Dates */}
            <div className="date-chips">
              {[
                { label: 'START', val: fmtDate(anime.startDate) },
                { label: 'END',   val: fmtDate(anime.endDate)   },
              ].filter(x => x.val !== '?').map(x => (
                <div key={x.label} className="date-chip">
                  <span className="date-chip__label">{x.label} </span>
                  <span className="date-chip__value">{x.val}</span>
                </div>
              ))}
            </div>

            <div className="modal-links">
              <a
                href={anime.siteUrl}
                target="_blank" rel="noreferrer"
                className="modal-link"
                style={{ background: `${CYAN}20`, borderColor: `${CYAN}40`, color: '#67E8F9' }}
              >
                ↗ View on AniList
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}
