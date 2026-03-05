import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { PURPLE } from '../constants.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserList } from '../useList.js'
import { useToast } from '../context/ToastContext.jsx'
import { useLang } from '../context/LangContext.jsx'

const STATUS_OPTIONS = [
  { key: 'reading',   color: '#06B6D4', vi: 'Đang đọc/xem', en: 'Reading / Watching' },
  { key: 'planned',   color: '#A78BFA', vi: 'Dự định đọc',   en: 'Plan to Read'       },
  { key: 'completed', color: '#4ADE80', vi: 'Hoàn thành',    en: 'Completed'           },
  { key: 'onhold',    color: '#F59E0B', vi: 'Tạm dừng',      en: 'On Hold'             },
  { key: 'dropped',   color: '#F87171', vi: 'Bỏ dở',         en: 'Dropped'             },
]

function QuickAddPopup({ item, existing, onClose }) {
  const { user }                        = useAuth()
  const { addOrUpdate, remove }         = useUserList()
  const { show }                        = useToast()
  const { lang }                        = useLang()
  const [loading, setLoading]           = useState(false)

  const T = {
    title:    lang === 'vi' ? 'Thêm vào danh sách' : 'Add to List',
    inList:   lang === 'vi' ? 'Đã có trong danh sách' : 'Already in your list',
    remove:   lang === 'vi' ? 'Xóa khỏi danh sách'   : 'Remove from list',
    success:  lang === 'vi' ? 'Đã thêm vào danh sách!' : 'Added to your list!',
    already:  lang === 'vi' ? 'Đã có trong danh sách rồi!' : 'Already in your list!',
    removed:  lang === 'vi' ? 'Đã xóa khỏi danh sách'     : 'Removed from list',
    updated:  lang === 'vi' ? 'Đã cập nhật danh sách!'    : 'List updated!',
  }

  const pick = async (status) => {
    setLoading(true)
    try {
      const isAlready = existing?.status === status
      if (isAlready) {
        show(T.already, 'warning')
        onClose()
        return
      }
      await addOrUpdate({ ...item, status })
      show(existing ? T.updated : T.success, 'success')
      onClose()
    } catch (e) {
      show(e.message || 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!existing) return
    setLoading(true)
    try {
      await remove(existing.id)
      show(T.removed, 'success')
      onClose()
    } catch (e) {
      show(e.message || 'Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg,#0f0f1a,#1a1a2e)',
        border: `1px solid ${PURPLE}40`, borderRadius: 18,
        padding: 24, width: '100%', maxWidth: 360,
        boxShadow: `0 24px 60px rgba(0,0,0,0.8), 0 0 40px ${PURPLE}15`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          {item.cover_url && (
            <img src={item.cover_url} style={{ width: 42, height: 58, objectFit: 'cover',
              borderRadius: 7, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
              color: '#fff', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              {existing ? T.inList : T.title}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            color: '#475569', fontSize: 20, cursor: 'pointer', flexShrink: 0 }}>×</button>
        </div>

        {/* Status buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STATUS_OPTIONS.map(s => {
            const isActive = existing?.status === s.key
            return (
              <button key={s.key} onClick={() => pick(s.key)} disabled={loading} style={{
                background: isActive ? `${s.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? s.color : 'rgba(255,255,255,0.08)'}`,
                color: isActive ? s.color : '#94A3B8',
                borderRadius: 10, padding: '10px 16px', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, textAlign: 'left',
                fontFamily: "'Be Vietnam Pro', sans-serif",
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s', opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = `${s.color}12`; e.currentTarget.style.borderColor = `${s.color}50`; e.currentTarget.style.color = s.color }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8' }}}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%',
                  background: s.color, flexShrink: 0 }} />
                {lang === 'vi' ? s.vi : s.en}
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 11 }}>✓</span>}
              </button>
            )
          })}
        </div>

        {/* Remove button if already in list */}
        {existing && (
          <button onClick={handleRemove} disabled={loading} style={{
            width: '100%', marginTop: 12,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', borderRadius: 10, padding: '9px 0', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
          }}>{T.remove}</button>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

// The button shown on each card
export function QuickAddButton({ itemId, itemType, title, coverUrl }) {
  const { user }          = useAuth()
  const { getEntry }      = useUserList()
  const [open, setOpen]   = useState(false)
  const { lang }          = useLang()

  if (!user) return null  // Only show when logged in

  const existing = getEntry(String(itemId), itemType)
  const item     = { item_id: String(itemId), item_type: itemType, title, cover_url: coverUrl }

  const label = existing
    ? (lang === 'vi' ? '✓ Danh sách' : '✓ Listed')
    : (lang === 'vi' ? '+ Danh sách' : '+ List')

  return (
    <>
      <button
        onClick={e => { e.stopPropagation(); setOpen(true) }}
        style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 10,
          background: existing ? 'rgba(74,222,94,0.2)' : 'rgba(139,92,246,0.85)',
          border: `1px solid ${existing ? 'rgba(74,222,94,0.5)' : 'rgba(139,92,246,0.6)'}`,
          color: existing ? '#4ADE80' : '#fff',
          borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
          fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}
      >
        {label}
      </button>

      {open && (
        <QuickAddPopup
          item={item}
          existing={existing}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
