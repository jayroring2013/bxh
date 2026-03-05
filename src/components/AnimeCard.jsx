import React from 'react'
import { CYAN, animeStatusColor, animeStatusLabel } from '../constants.js'
import { RankBadge } from './Shared.jsx'
import { QuickAddButton } from './QuickAddButton.jsx'
import { ViewOnButton } from './ViewOnButton.jsx'

export function AnimeCard({ anime, rank, onClick }) {
  // Support both AniList shape (nested) and Supabase shape (flat)
  const cover = anime.cover_large || anime.coverImage?.extraLarge || anime.coverImage?.large
  const title = anime.title_english || anime.title_romaji || anime.title?.english || anime.title?.romaji || 'Unknown'
  const score = anime.average_score ?? anime.averageScore
  const genre = (anime.genres)?.[0]
  const year  = anime.season_year  || anime.startDate?.year
  const eps   = anime.episodes
  const status= anime.status

  return (
    <div className="anime-card" onClick={() => onClick(anime)}>
      <RankBadge rank={rank} />

      {status && (
        <div className="status-badge" style={{ background: animeStatusColor(status) }}>
          {status === 'RELEASING' && <span className="status-badge__dot" />}
          {animeStatusLabel(status)}
        </div>
      )}

      {cover
        ? <img className="anime-card__cover" src={cover} alt={title} onError={e => e.target.style.display='none'} />
        : <div className="anime-card__placeholder">🎌</div>
      }

      <div className="anime-card__gradient" />

      <div className="anime-card__info">
        {genre && <div className="anime-card__tag">{genre}</div>}
        <div className="anime-card__title">{title}</div>

        {year && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">YEAR</span>
            <span className="novel-card__meta-value">{year}</span>
          </div>
        )}
        {eps && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">EPS</span>
            <span className="novel-card__meta-value" style={{ color: '#67E8F9' }}>{eps}</span>
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
      </div>
      <QuickAddButton
        itemId={anime.id} itemType="anime"
        title={title}
        coverUrl={cover}
      />
      <ViewOnButton itemId={anime.id} itemType="anime" title={title} />
    </div>
  )
}
