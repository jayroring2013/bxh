import React from 'react'
import { ROSE, mangaStatusColor } from '../constants.js'
import { RankBadge } from './Shared.jsx'
import { QuickAddButton } from './QuickAddButton.jsx'

export function MangaCard({ manga, rank, stats, onClick }) {
  // ── Support both shapes ───────────────────────────────────────
  // New: normalized series row  → manga.title, manga.cover_url, manga.demographic, ...
  // Old: MangaDex API shape     → manga.attributes.title.en, manga._cover_url, ...
  const isNormalized = !manga.attributes

  let title, status, demo, year, cover, chap, vol, score, follows, genre

  if (isNormalized) {
    title   = manga.title || manga.title_native || 'Unknown'
    status  = manga.status
    demo    = manga.demographic
    year    = manga.year
    cover   = manga.cover_url
    chap    = manga.last_chapter ?? manga.chapters ?? null
    vol     = manga.last_volume  ?? manga.volumes  ?? null
    score   = manga.score ? String(parseFloat(manga.score).toFixed(2)) : null
    follows = manga.follows ?? null
    genre   = (manga.genres || [])[0] || null
  } else {
    const attrs = manga.attributes || {}
    title   = attrs.title?.en || attrs.title?.['ja-ro'] || Object.values(attrs.title || {})[0] || 'Unknown'
    status  = attrs.status
    demo    = attrs.publicationDemographic
    year    = attrs.year
    cover   = manga._cover_url || manga.cover_url
      || (() => {
        const rel  = manga.relationships?.find(r => r.type === 'cover_art')
        const file = rel?.attributes?.fileName
        return file ? `https://mangadex.org/covers/${manga.id}/${file}.256.jpg` : null
      })()
    const stat = manga._stats || stats?.[manga.id]
    chap    = stat?.chapters ?? attrs.lastChapter ?? null
    vol     = stat?.volumes  ?? attrs.lastVolume  ?? null
    score   = stat?.rating   ?? null
    follows = stat?.follows  ?? null
    genre   = (attrs.tags || []).find(t => t.attributes?.group === 'genre')?.attributes?.name?.en || null
  }

  return (
    <div className="anime-card manga-card" onClick={() => onClick(manga)}>
      <RankBadge rank={rank} />

      {status && status !== 'ongoing' && (
        <div className="status-badge" style={{ background: mangaStatusColor(status) }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      )}

      {cover
        ? <img className="anime-card__cover" src={cover} alt={title} onError={e => e.target.style.display='none'} />
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
        {year && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">YEAR</span>
            <span className="novel-card__meta-value">{year}</span>
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
        {score && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">SCORE</span>
            <span className="novel-card__meta-value" style={{ color: '#FBBF24' }}>★ {score}</span>
          </div>
        )}
        {follows != null && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">FOLLOWS</span>
            <span className="novel-card__meta-value" style={{ color: '#86EFAC' }}>
              {follows.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      <QuickAddButton
        itemId={manga.id} itemType="manga"
        title={title}
        coverUrl={cover}
      />
    </div>
  )
}
