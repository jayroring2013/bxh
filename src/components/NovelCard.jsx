import React, { useState, useEffect } from 'react'
import { RANOBE, novelStatusColor } from '../constants.js'
import { RankBadge } from './Shared.jsx'
import { QuickAddButton } from './QuickAddButton.jsx'
import { ViewOnButton } from './ViewOnButton.jsx'

export function NovelCard({ series, rank, onClick }) {
  const [desc,   setDesc]   = useState(null)
  const [rating, setRating] = useState(null)

  const cover = series.book?.image?.filename
    ? `https://images.ranobedb.org/${series.book.image.filename}`
    : null
  const vols = series.c_num_books || parseInt(series.volumes?.count) || 0
  const tag  = series.tags?.[0]

  // Use cached data if available, lazy-load from API only as fallback
  useEffect(() => {
    // If Supabase cache has description already, use it
    const cachedDesc = series.description || series.book_description?.description
    const cachedRating = series.rating
    if (cachedDesc) { setDesc(cachedDesc); }
    if (cachedRating?.score) { setRating(cachedRating); return }

    // Fallback: lazy-load from live API (staggered to avoid hammering)
    if (cachedDesc && cachedRating) return
    const t = setTimeout(async () => {
      try {
        const r  = await fetch(`${RANOBE}/series/${series.id}`)
        const d  = await r.json()
        const tx = d.series?.book_description?.description || d.series?.description || ''
        const rt = d.series?.rating || null
        if (tx && !cachedDesc) setDesc(tx)
        if (rt?.score) setRating(rt)
      } catch (_) {}
    }, Math.min(rank * 180, 3000))
    return () => clearTimeout(t)
  }, [series.id])

  const statusBg = novelStatusColor(series.publication_status)

  return (
    <div className="novel-card" onClick={() => onClick(series)}>
      <RankBadge rank={rank} />

      {/* Status badge */}
      {series.publication_status && (
        <div className="status-badge" style={{ background: statusBg }}>
          {series.publication_status === 'ongoing' && <span className="status-badge__dot" />}
          {series.publication_status}
        </div>
      )}

      {/* Cover image */}
      {cover
        ? <img className="novel-card__cover" src={cover} alt={series.title} onError={e => e.target.style.display = 'none'} />
        : <div className="novel-card__placeholder">📖</div>
      }

      {/* Gradient overlay */}
      <div className="novel-card__gradient" />

      {/* Info overlay */}
      <div className="novel-card__info">
        {tag && <div className="novel-card__tag">{tag.name}</div>}

        <div className="novel-card__title">{series.romaji || series.title}</div>
        {series.title_orig && <div className="novel-card__title-orig">{series.title_orig}</div>}

        <div className="novel-card__meta">
          <span className="novel-card__meta-label">RUN</span>
          <span className="novel-card__meta-value">
            {series.c_start_date ? String(series.c_start_date).slice(0, 4) : '?'}
            {' → '}
            {!series.c_end_date || series.c_end_date === 99999999
              ? <span style={{ color: '#4ADE80' }}>Present</span>
              : String(series.c_end_date).slice(0, 4)
            }
          </span>
        </div>

        {vols > 0 && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">VOLS</span>
            <span className="novel-card__meta-value" style={{ color: '#C4B5FD' }}>
              {vols} vol{vols !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {rating && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">SCORE</span>
            <span className="novel-card__meta-value" style={{ color: '#FBBF24' }}>
              ★ {Number(rating.score).toFixed(1)}
              <span style={{ color: '#64748B' }}> ({rating.count})</span>
            </span>
          </div>
        )}

        {desc && <div className="novel-card__desc">{desc}</div>}
      </div>
      <QuickAddButton
        itemId={series.id} itemType="novel"
        title={series.romaji || series.title}
        coverUrl={cover}
      />
      <ViewOnButton itemId={series.id} itemType="novel" title={series.romaji || series.title} />
    </div>
  )
}
