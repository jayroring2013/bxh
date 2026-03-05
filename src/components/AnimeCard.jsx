import React from 'react'
import { CYAN, animeStatusColor, animeStatusLabel } from '../constants.js'
import { RankBadge } from './Shared.jsx'

export function AnimeCard({ anime, rank, onClick }) {
  const cover = anime.coverImage?.extraLarge || anime.coverImage?.large
  const title = anime.title?.english || anime.title?.romaji || 'Unknown'
  const score = anime.averageScore
  const genre = anime.genres?.[0]

  return (
    <div className="anime-card" onClick={() => onClick(anime)}>
      <RankBadge rank={rank} />

      {/* Status badge */}
      {anime.status && (
        <div className="status-badge" style={{ background: animeStatusColor(anime.status) }}>
          {anime.status === 'RELEASING' && <span className="status-badge__dot" />}
          {animeStatusLabel(anime.status)}
        </div>
      )}

      {/* Cover */}
      {cover
        ? <img className="anime-card__cover" src={cover} alt={title} onError={e => e.target.style.display = 'none'} />
        : <div className="anime-card__placeholder">🎌</div>
      }

      {/* Gradient */}
      <div className="anime-card__gradient" />

      {/* Info */}
      <div className="anime-card__info">
        {genre && <div className="anime-card__tag">{genre}</div>}

        <div className="anime-card__title">{title}</div>

        {anime.startDate?.year && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">YEAR</span>
            <span className="novel-card__meta-value">{anime.startDate.year}</span>
          </div>
        )}

        {anime.episodes && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">EPS</span>
            <span className="novel-card__meta-value" style={{ color: '#67E8F9' }}>{anime.episodes}</span>
          </div>
        )}

        {score && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">SCORE</span>
            <span className="novel-card__meta-value" style={{ color: '#FBBF24' }}>
              ★ {score}<span style={{ color: '#64748B' }}>/100</span>
            </span>
          </div>
        )}

        {anime.description && (
          <div className="novel-card__desc">
            {anime.description.replace(/<[^>]*>/g, '')}
          </div>
        )}
      </div>
    </div>
  )
}
