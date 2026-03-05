import React from 'react'
import { MANGADEX_COVER, ROSE, mangaStatusColor } from '../constants.js'
import { RankBadge } from './Shared.jsx'

export function MangaCard({ manga, rank, stats, onClick }) {
  const attrs  = manga.attributes
  const title  = attrs.title?.en || attrs.title?.['ja-ro'] || Object.values(attrs.title || {})[0] || 'Unknown'
  const status = attrs.status
  const demo   = attrs.publicationDemographic

  const coverRel  = manga.relationships?.find(r => r.type === 'cover_art')
  const coverFile = coverRel?.attributes?.fileName
  const cover     = coverFile ? `${MANGADEX_COVER}/${manga.id}/${coverFile}.256.jpg` : null

  const genre  = (attrs.tags || []).find(t => t.attributes.group === 'genre')?.attributes?.name?.en
  const stat   = stats?.[manga.id]

  // lastChapter/lastVolume only for completed manga
  // For ongoing: use aggregate data from stats
  const chap = stat?.chapters ?? (attrs.lastChapter || null)
  const vol  = stat?.volumes  ?? (attrs.lastVolume  || null)

  return (
    <div className="anime-card manga-card" onClick={() => onClick(manga)}>
      <RankBadge rank={rank} />

      {status && (
        <div className="status-badge" style={{ background: mangaStatusColor(status) }}>
          {status === 'ongoing' && <span className="status-badge__dot" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      )}

      {cover
        ? <img className="anime-card__cover" src={cover} alt={title} onError={e => e.target.style.display = 'none'} />
        : <div className="anime-card__placeholder">📚</div>
      }

      <div className="anime-card__gradient" />

      <div className="anime-card__info">
        {genre && <div className="anime-card__tag" style={{ background: ROSE }}>{genre}</div>}

        <div className="anime-card__title">{title}</div>

        {demo && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">DEMO</span>
            <span className="novel-card__meta-value" style={{ color: '#FDA4AF' }}>
              {demo.charAt(0).toUpperCase() + demo.slice(1)}
            </span>
          </div>
        )}

        {attrs.year && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">YEAR</span>
            <span className="novel-card__meta-value">{attrs.year}</span>
          </div>
        )}

        {chap && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">CH</span>
            <span className="novel-card__meta-value" style={{ color: '#FDA4AF' }}>{chap}</span>
          </div>
        )}
        {vol && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">VOL</span>
            <span className="novel-card__meta-value" style={{ color: '#FDA4AF' }}>{vol}</span>
          </div>
        )}

        {/* Rating from statistics endpoint */}
        {stat?.rating && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">SCORE</span>
            <span className="novel-card__meta-value" style={{ color: '#FBBF24' }}>
              ★ {stat.rating}
            </span>
          </div>
        )}

        {/* Follow count */}
        {stat?.follows != null && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">FOLLOWS</span>
            <span className="novel-card__meta-value" style={{ color: '#86EFAC' }}>
              {stat.follows.toLocaleString()}
            </span>
          </div>
        )}

        {attrs.description?.en && (
          <div className="novel-card__desc">
            {attrs.description.en.replace(/\[.*?\]/g, '').trim()}
          </div>
        )}
      </div>
    </div>
  )
}
