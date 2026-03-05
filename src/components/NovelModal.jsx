import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { RANOBE, PURPLE, novelStatusColor } from '../constants.js'

export function NovelModal({ series, onClose }) {
  const [detail, setDetail] = useState(null)
  const [ldg,    setLdg]    = useState(true)


  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    fetch(`${RANOBE}/series/${series.id}`)
      .then(r  => r.json())
      .then(d  => { setDetail(d); setLdg(false) })
      .catch(() => setLdg(false))
    return () => window.removeEventListener('keydown', esc)
  }, [series.id])

  const d       = detail?.series || series
  const img     = series.book?.image
    ? `https://images.ranobedb.org/${series.book.image.filename}`
    : null
  const tags    = d.tags   || series.tags || []
  const staff   = d.staff  || []
  const desc    = d.book_description?.description || d.description || ''
  const authors = staff.filter(s => s.role_type === 'author').map(s => s.name).join(', ')
  const rating  = d.rating || null
  const mainBooks = (d.books || []).filter(b => b.book_type === 'main')

  return createPortal(
    <div className="nt-overlay" onClick={onClose}>
      <div
        className="nt-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background:  'linear-gradient(145deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)',
          border:      '1px solid rgba(139,92,246,0.2)',
          boxShadow:   '0 40px 100px rgba(0,0,0,0.9)',
        }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-body">
          {/* Cover */}
          <div className="modal-cover">
            {img
              ? <img src={img} alt={series.title} onError={e => e.target.style.display = 'none'} />
              : <div className="modal-cover__placeholder" style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)' }}>📖</div>
            }
            <div className="modal-cover__fade" style={{ background: 'linear-gradient(to right,transparent 50%,#0f172a 100%)' }} />
          </div>

          {/* Content */}
          <div className="modal-content">
            {/* Tags */}
            <div className="modal-tags">
              {tags.slice(0, 5).map(t => (
                <span
                  key={t.id}
                  className="modal-tag"
                  style={{
                    background:  t.ttype === 'genre' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.06)',
                    borderColor: t.ttype === 'genre' ? 'rgba(139,92,246,0.3)'  : 'rgba(255,255,255,0.1)',
                    color:       t.ttype === 'genre' ? '#C4B5FD'               : '#94A3B8',
                  }}
                >
                  {t.name}
                </span>
              ))}
              {series.publication_status && (
                <span
                  className="modal-tag"
                  style={{
                    background:  novelStatusColor(series.publication_status).replace(/[\d.]+\)$/, '0.15)'),
                    borderColor: novelStatusColor(series.publication_status).replace(/[\d.]+\)$/, '0.4)'),
                    color: '#fff',
                    textTransform: 'capitalize',
                  }}
                >
                  {series.publication_status}
                </span>
              )}
            </div>

            <h2 className="modal-title">{series.romaji || series.title}</h2>
            {series.title_orig && <div className="modal-title-orig">{series.title_orig}</div>}
            {authors && <div className="modal-author">by {authors}</div>}

            {/* Stats row */}
            <div className="modal-stats">
              {[
                { label: 'VOLUMES', value: d.c_num_books || series.volumes?.count || '?' },
                { label: 'START',   value: series.c_start_date ? String(series.c_start_date).slice(0, 4) : '?' },
                { label: 'LATEST',  value: series.c_end_date && series.c_end_date !== 99999999 ? String(series.c_end_date).slice(0, 4) : 'Ongoing' },
                { label: 'RATING',  value: rating ? `${Number(rating.score).toFixed(1)} ★` : 'N/A' },
                { label: 'LANG',    value: (series.olang || 'ja').toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} className="modal-stat">
                  <div className="modal-stat__value" style={{ color: PURPLE }}>{value}</div>
                  <div className="modal-stat__label">{label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {ldg
              ? <p className="modal-desc" style={{ color: '#374151' }}>Loading details…</p>
              : desc && <p className="modal-desc">{desc.length > 450 ? desc.slice(0, 450) + '…' : desc}</p>
            }

            {/* Volume list */}
            {mainBooks.length > 0 && (
              <div>
                <div className="modal-section-label">VOLUMES</div>
                <div className="modal-volumes">
                  {mainBooks.slice(0, 8).map((b, i) => (
                    <div key={b.id} className="modal-vol-chip">Vol.{i + 1}</div>
                  ))}
                  {mainBooks.length > 8 && (
                    <div className="modal-vol-more">+{mainBooks.length - 8} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Publishers */}
            {d.publishers?.length > 0 && (
              <div>
                <div className="modal-section-label">PUBLISHER</div>
                <div className="modal-publishers">
                  {d.publishers.map(p => (
                    <span key={p.id} className="modal-publisher-chip">{p.name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="modal-links">
              <a
                href={`https://ranobedb.org/series/${series.id}`}
                target="_blank" rel="noreferrer"
                className="modal-link"
                style={{ background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.3)', color: '#C4B5FD' }}
              >
                ↗ View on RanobeDB
              </a>
              {d.web_novel && (
                <a
                  href={d.web_novel}
                  target="_blank" rel="noreferrer"
                  className="modal-link"
                  style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)', color: '#93C5FD' }}
                >
                  🌐 Web Novel
                </a>
              )}
</div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}
