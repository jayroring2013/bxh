import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserList } from '../useList.js'
import { AddToListModal } from './AddToListModal.jsx'
import { createPortal } from 'react-dom'
import { ROSE, mangaStatusColor } from '../constants.js'

export function MangaModal({ manga, stats, onClose }) {
  const { user } = useAuth()
  const { addOrUpdate, getEntry, remove } = useUserList()
  const [showList, setShowList] = useState(false)
  const existing  = getEntry(manga.id, 'manga')

  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  const attrs  = manga.attributes
  const title  = attrs.title?.en || attrs.title?.['ja-ro'] || Object.values(attrs.title || {})[0] || 'Unknown'
  const titleJa = attrs.title?.ja || attrs.altTitles?.find(t => t.ja)?.ja || null
  const altEn  = attrs.altTitles?.find(t => t.en)?.en

  const cover = manga._cover_url
    || (() => {
      const rel  = manga.relationships?.find(r => r.type === 'cover_art')
      const file = rel?.attributes?.fileName
      return file ? `https://mangadex.org/covers/${manga.id}/${file}.512.jpg` : null
    })()

  const authors  = manga.relationships?.filter(r => r.type === 'author').map(r => r.attributes?.name).filter(Boolean)
  const artists  = manga.relationships?.filter(r => r.type === 'artist').map(r => r.attributes?.name).filter(Boolean)
  const authorStr = [...new Set([...(authors||[]), ...(artists||[])])].join(', ')

  const desc   = attrs.description?.en || ''
  const stat   = stats?.[manga.id]
  const status = attrs.status
  const demo   = attrs.publicationDemographic
  const genres = (attrs.tags || []).filter(t => t.attributes.group === 'genre').map(t => t.attributes.name.en)
  const themes = (attrs.tags || []).filter(t => t.attributes.group === 'theme').map(t => t.attributes.name.en)
  const mdUrl  = `https://mangadex.org/title/${manga.id}`

  return createPortal(
    <div className="nt-overlay" onClick={onClose}>
      <div
        className="nt-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg,#1a0a0f 0%,#2d0a1a 60%,#1a0a0f 100%)',
          border:     `1px solid ${ROSE}30`,
          boxShadow:  '0 40px 100px rgba(0,0,0,0.9)',
        }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-body">
          {/* Cover */}
          <div className="modal-cover">
            {cover
              ? <img src={cover} alt={title} onError={e => e.target.style.display = 'none'} />
              : <div className="modal-cover__placeholder" style={{ background: 'linear-gradient(135deg,#2d0a1a,#1a0a0f)' }}>📚</div>
            }
            <div className="modal-cover__fade" style={{ background: `linear-gradient(to right,transparent 50%,#1a0a0f 100%)` }} />
          </div>

          {/* Content */}
          <div className="modal-content">
            {/* Genre tags */}
            <div className="modal-tags">
              {genres.slice(0, 4).map(g => (
                <span key={g} className="modal-tag"
                  style={{ background: `${ROSE}1a`, borderColor: `${ROSE}40`, color: '#FDA4AF' }}>
                  {g}
                </span>
              ))}
              {status && (
                <span className="modal-tag" style={{
                  background:  mangaStatusColor(status).replace(/[\d.]+\)$/, '0.15)'),
                  borderColor: mangaStatusColor(status).replace(/[\d.]+\)$/, '0.4)'),
                  color: '#fff', textTransform: 'capitalize',
                }}>
                  {status}
                </span>
              )}
              {demo && (
                <span className="modal-tag"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#94A3B8', textTransform: 'capitalize' }}>
                  {demo}
                </span>
              )}
            </div>

            <h2 className="modal-title">{title}</h2>
            {altEn && altEn !== title && <div className="modal-title-sub">{altEn}</div>}
            {titleJa && <div className="modal-title-orig">{titleJa}</div>}
            {authorStr && <div className="modal-author">by {authorStr}</div>}

            {/* Stats */}
            <div className="modal-stats">
              {[
                { label: 'CHAPTERS', value: stat?.chapters ?? attrs.lastChapter ?? 'Ongoing' },
                { label: 'VOLUMES',  value: stat?.volumes  ?? attrs.lastVolume  ?? 'Ongoing' },
                { label: 'YEAR',     value: attrs.year        || '?' },
                { label: 'LANG',     value: (attrs.originalLanguage || 'ja').toUpperCase() },
                { label: 'SCORE',    value: stat?.rating ? `★ ${stat.rating}` : 'N/A' },
                { label: 'FOLLOWS',  value: stat?.follows != null ? stat.follows.toLocaleString() : '?' },
              ].map(({ label, value }) => (
                <div key={label} className="modal-stat">
                  <div className="modal-stat__value" style={{ color: ROSE }}>{value}</div>
                  <div className="modal-stat__label">{label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {desc && (
              <p className="modal-desc">
                {desc.replace(/\[.*?\]/g, '').trim().slice(0, 450)}
                {desc.length > 450 ? '…' : ''}
              </p>
            )}

            {/* Themes */}
            {themes.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div className="modal-section-label">THEMES</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {themes.slice(0, 8).map(t => (
                    <span key={t} className="modal-tag"
                      style={{ background: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.2)', color: '#FDA4AF' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="modal-links">
              <a href={mdUrl} target="_blank" rel="noreferrer" className="modal-link"
                style={{ background: `${ROSE}20`, borderColor: `${ROSE}40`, color: '#FDA4AF' }}>
                ↗ View on MangaDex
              </a>

            {/* Add to List button */}
            <div style={{ marginTop: 16 }}>
              {user ? (
                <button onClick={() => setShowList(true)} style={{
                  background: existing ? 'rgba(74,222,128,0.12)' : 'rgba(139,92,246,0.15)',
                  border: `1px solid ${existing ? 'rgba(74,222,128,0.4)' : 'rgba(139,92,246,0.4)'}`,
                  color: existing ? '#4ADE80' : '#A78BFA',
                  padding: '9px 20px', borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  {existing ? '✓ ' : '+ '}
                  {existing ? (navigator.language.startsWith('vi') ? 'Đã có trong danh sách' : 'In My List') : (navigator.language.startsWith('vi') ? 'Thêm vào danh sách' : 'Add to List')}
                </button>
              ) : (
                <a href="#/list" style={{
                  color: '#475569', fontSize: 12,
                  textDecoration: 'none', display: 'block', marginTop: 4,
                }}>
                  {navigator.language.startsWith('vi') ? '🔖 Đăng nhập để lưu vào danh sách' : '🔖 Sign in to save to list'}
                </a>
              )}
            </div>

            {showList && (
              <AddToListModal
                item={{ item_id: String(manga.id), item_type: 'manga', title: title, cover_url: cover }}
                existing={existing}
                onSave={addOrUpdate}
                onRemove={remove}
                onClose={() => setShowList(false)}
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}
