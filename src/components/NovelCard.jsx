import React from 'react'
import { PURPLE, novelStatusColor } from '../constants.js'
import { RankBadge } from './Shared.jsx'
import { QuickAddButton } from './QuickAddButton.jsx'

export function NovelCard({ series, rank, onClick }) {
  // New series table shape: id, title, cover_url, description, publisher, author,
  // genres (array), score, status, external_id
  const cover  = series.cover_url || null
  const title  = series.title || 'Unknown'
  const genre  = (series.genres || [])[0] || null
  const status = series.status || null
  const desc   = typeof series.description === 'object'
    ? series.description?.en
    : series.description || null

  const statusBg = novelStatusColor(status)

  return (
    <div className="novel-card" onClick={() => onClick(series)}>
      <RankBadge rank={rank} />

      {/* Status badge — only show non-ongoing */}
      {status && status !== 'ongoing' && (
        <div className="status-badge" style={{ background: statusBg }}>
          {status}
        </div>
      )}

      {/* Cover */}
      {cover
        ? <img className="novel-card__cover" src={cover} alt={title}
            onError={e => e.target.style.display = 'none'} />
        : <div className="novel-card__placeholder">📖</div>
      }

      <div className="novel-card__gradient" />

      <div className="novel-card__info">
        {genre && <div className="novel-card__tag">{genre}</div>}

        <div className="novel-card__title">{title}</div>

        {series.author && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">TÁC GIẢ</span>
            <span className="novel-card__meta-value" style={{ color: '#C4B5FD' }}>
              {series.author}
            </span>
          </div>
        )}

        {series.publisher && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">NXB</span>
            <span className="novel-card__meta-value">{series.publisher}</span>
          </div>
        )}

        {series.score != null && (
          <div className="novel-card__meta">
            <span className="novel-card__meta-label">SCORE</span>
            <span className="novel-card__meta-value" style={{ color: '#FBBF24' }}>
              ★ {Number(series.score).toFixed(1)}
            </span>
          </div>
        )}

        {desc && <div className="novel-card__desc">{desc}</div>}
      </div>

      <QuickAddButton
        itemId={series.id} itemType="novel"
        title={title}
        coverUrl={cover}
      />
    </div>
  )
}
