import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { PURPLE } from '../constants.js'
import { useAuth } from '../context/AuthContext.jsx'
import { STATUS_LABELS } from '../useList.js'
import { useLang } from '../context/LangContext.jsx'

const STATUSES = Object.entries(STATUS_LABELS)

export function AddToListModal({ item, existing, onSave, onRemove, onClose }) {
  const { user } = useAuth()
  const { lang } = useLang()
  const [status,  setStatus]  = useState(existing?.status  || 'planned')
  const [rating,  setRating]  = useState(existing?.rating  || 0)
  const [review,  setReview]  = useState(existing?.review  || '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const T = {
    title:   lang === 'vi' ? 'Thêm vào danh sách'   : 'Add to List',
    edit:    lang === 'vi' ? 'Chỉnh sửa'             : 'Edit Entry',
    status:  lang === 'vi' ? 'Trạng thái'            : 'Status',
    rating:  lang === 'vi' ? 'Đánh giá'              : 'Rating',
    review:  lang === 'vi' ? 'Nhận xét'              : 'Review',
    save:    lang === 'vi' ? 'Lưu'                   : 'Save',
    remove:  lang === 'vi' ? 'Xóa khỏi danh sách'   : 'Remove',
    no_rating: lang === 'vi' ? 'Chưa đánh giá'      : 'No rating',
    placeholder: lang === 'vi' ? 'Viết nhận xét của bạn...' : 'Write your thoughts...',
  }

  const statusLabel = (key) => {
    const map = {
      reading:   lang === 'vi' ? 'Đang đọc/xem' : 'Reading/Watching',
      completed: lang === 'vi' ? 'Hoàn thành'    : 'Completed',
      planned:   lang === 'vi' ? 'Dự định'       : 'Plan to Read',
      onhold:    lang === 'vi' ? 'Tạm dừng'      : 'On Hold',
      dropped:   lang === 'vi' ? 'Bỏ dở'         : 'Dropped',
    }
    return map[key] || key
  }

  const save = async () => {
    setLoading(true); setError(null)
    try {
      await onSave({ ...item, status, rating: rating || null, review: review.trim() || null })
      onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const remove = async () => {
    setLoading(true)
    try { await onRemove(existing.id); onClose() }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const statusColor = {
    reading:   '#06B6D4', completed: '#4ADE80', planned: '#A78BFA',
    onhold:    '#F59E0B', dropped:   '#F87171',
  }

  return createPortal(
    <div className="nt-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg,#0f0f1a,#1a1a2e)',
        border: `1px solid ${PURPLE}40`, borderRadius: 20,
        padding: 28, width: '100%', maxWidth: 420,
        boxShadow: `0 40px 100px rgba(0,0,0,0.9)`,
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, background: 'none',
          border: 'none', color: '#64748B', fontSize: 22, cursor: 'pointer',
        }}>×</button>

        {/* Cover + title header */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, alignItems: 'flex-start' }}>
          {item.cover_url && (
            <img src={item.cover_url} style={{ width: 52, height: 74,
              objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              onError={e => e.target.style.display='none'} />
          )}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16, lineHeight: 1.3, color: '#fff', marginBottom: 4 }}>
              {item.title}
            </div>
            <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase',
              letterSpacing: 1, background: `${PURPLE}20`, padding: '2px 8px',
              borderRadius: 20, display: 'inline-block' }}>
              {item.item_type}
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#64748B', letterSpacing: 1.5,
            textTransform: 'uppercase', marginBottom: 8 }}>{T.status}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {Object.keys(STATUS_LABELS).map(s => (
              <button key={s} onClick={() => setStatus(s)} style={{
                background: status === s ? `${statusColor[s]}25` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${status === s ? statusColor[s] : 'rgba(255,255,255,0.08)'}`,
                color: status === s ? statusColor[s] : '#64748B',
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
                transition: 'all 0.15s',
              }}>
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#64748B', letterSpacing: 1.5,
            textTransform: 'uppercase', marginBottom: 8 }}>
            {T.rating} {rating > 0 ? `— ${rating}/10` : `— ${T.no_rating}`}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setRating(rating === n ? 0 : n)} style={{
                width: 32, height: 32, borderRadius: 8,
                background: n <= rating ? PURPLE : 'rgba(255,255,255,0.05)',
                border: `1px solid ${n <= rating ? PURPLE : 'rgba(255,255,255,0.08)'}`,
                color: n <= rating ? '#fff' : '#475569',
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                transition: 'all 0.15s',
              }}>{n}</button>
            ))}
          </div>
        </div>

        {/* Review */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: '#64748B', letterSpacing: 1.5,
            textTransform: 'uppercase', marginBottom: 8 }}>{T.review}</div>
          <textarea
            value={review} onChange={e => setReview(e.target.value)}
            placeholder={T.placeholder} rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '10px 12px', color: '#fff', fontSize: 13, resize: 'vertical',
              outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif",
              boxSizing: 'border-box', minHeight: 80,
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {existing && (
            <button onClick={remove} disabled={loading} style={{
              flex: 1, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#F87171', borderRadius: 12, padding: '11px 0', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>{T.remove}</button>
          )}
          <button onClick={save} disabled={loading} style={{
            flex: 2, background: PURPLE, border: 'none', color: '#fff',
            borderRadius: 12, padding: '11px 0', cursor: loading ? 'wait' : 'pointer',
            fontSize: 14, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
            opacity: loading ? 0.7 : 1, boxShadow: `0 4px 20px ${PURPLE}50`,
          }}>
            {loading ? '...' : T.save}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}
