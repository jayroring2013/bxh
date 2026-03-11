import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { PURPLE } from '../constants.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserList, STATUS_OPTIONS } from '../useList.js'
import { useToast } from '../context/ToastContext.jsx'
import { useLang } from '../context/LangContext.jsx'

function QuickAddPopup({ itemId, itemType, title, coverUrl, onClose }) {
  const { user }                            = useAuth()
  const { lists, addToList, removeFromList, getItemEntries, createList } = useUserList()
  const { show }                            = useToast()
  const { lang }                            = useLang()

  const [step,       setStep]       = useState('list')   // 'list' | 'status'
  const [pickedList, setPickedList] = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [newListName,setNewListName]= useState('')
  const [showNew,    setShowNew]    = useState(false)

  const itemEntries = getItemEntries(itemId, itemType)
  // Lists relevant to this item type
  const relevantLists = lists.filter(l =>
    l.item_type === itemType || l.item_type === 'all' || !l.item_type
  )

  const T = {
    pickList:    lang === 'vi' ? 'Chọn danh sách'       : 'Choose a list',
    pickStatus:  lang === 'vi' ? 'Trạng thái'           : 'Set status',
    newList:     lang === 'vi' ? '+ Tạo danh sách mới'  : '+ Create new list',
    create:      lang === 'vi' ? 'Tạo'                   : 'Create',
    placeholder: lang === 'vi' ? 'Tên danh sách...'     : 'List name...',
    inList:      lang === 'vi' ? 'Đã có'                 : 'Added',
    remove:      lang === 'vi' ? 'Xóa'                   : 'Remove',
    back:        lang === 'vi' ? '← Quay lại'            : '← Back',
    success:     lang === 'vi' ? 'Đã thêm vào danh sách!' : 'Added to list!',
    already:     lang === 'vi' ? 'Đã có trong danh sách!' : 'Already in this list!',
    updated:     lang === 'vi' ? 'Đã cập nhật!'           : 'Updated!',
    removed:     lang === 'vi' ? 'Đã xóa'                 : 'Removed',
  }

  const statusLabel = (s) => lang === 'vi' ? s.vi : s.en

  const handleCreateList = async () => {
    if (!newListName.trim()) return
    setLoading(true)
    try {
      await createList(newListName.trim(), itemType)
      setNewListName('')
      setShowNew(false)
      show(lang === 'vi' ? 'Đã tạo danh sách!' : 'List created!', 'success')
    } catch (e) { show(e.message, 'error') }
    finally { setLoading(false) }
  }

  const handlePickList = (list) => {
    setPickedList(list)
    setStep('status')
  }

  const handlePickStatus = async (status) => {
    setLoading(true)
    try {
      const result = await addToList({
        listId: pickedList.id,
        item_id: itemId, item_type: itemType,
        title, cover_url: coverUrl, status,
      })
      show(result.wasExisting ? T.updated : T.success, 'success')
      onClose()
    } catch (e) { show(e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleRemove = async (entryId) => {
    setLoading(true)
    try {
      await removeFromList(entryId)
      show(T.removed, 'success')
      if (itemEntries.length <= 1) onClose()
    } catch (e) { show(e.message, 'error') }
    finally { setLoading(false) }
  }

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg,#0f0f1a,#1a1a2e)',
        border: `1px solid ${PURPLE}40`, borderRadius: 18,
        padding: 22, width: '100%', maxWidth: 360,
        boxShadow: `0 24px 60px rgba(0,0,0,0.85), 0 0 40px ${PURPLE}15`,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
          {coverUrl && (
            <img src={coverUrl} style={{ width: 40, height: 56, objectFit: 'cover',
              borderRadius: 7, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
              color: '#fff', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 3,
              textTransform: 'uppercase', letterSpacing: 1 }}>
              {step === 'list' ? T.pickList : T.pickStatus}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            color: '#475569', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        {/* Step 1: pick list */}
        {step === 'list' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
              {relevantLists.map(list => {
                const entry = itemEntries.find(e => e.list_id === list.id)
                const statusOpt = STATUS_OPTIONS.find(s => s.key === entry?.status)
                return (
                  <div key={list.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: entry ? `${statusOpt?.color || PURPLE}12` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${entry ? (statusOpt?.color || PURPLE) + '40' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10, padding: '9px 12px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => handlePickList(list)}
                  onMouseEnter={e => !entry && (e.currentTarget.style.borderColor = `${PURPLE}50`)}
                  onMouseLeave={e => !entry && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                  >
                    {/* List icon */}
                    <span style={{ fontSize: 14 }}>
                      {list.item_type === 'novel' ? '📖'
                       : list.item_type === 'anime' ? '🎌'
                       : list.item_type === 'manga' ? '📚' : '🔖'}
                    </span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff',
                        fontFamily: "'Be Vietnam Pro', sans-serif" }}>{list.name}</div>
                      {entry && (
                        <div style={{ fontSize: 10, color: statusOpt?.color || '#64748B', marginTop: 1 }}>
                          {lang === 'vi' ? statusOpt?.vi : statusOpt?.en}
                        </div>
                      )}
                    </div>

                    {entry ? (
                      <button
                        onClick={e => { e.stopPropagation(); handleRemove(entry.id) }}
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                          color: '#F87171', borderRadius: 6, padding: '3px 8px',
                          cursor: 'pointer', fontSize: 10, fontWeight: 700,
                          fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                        {T.remove}
                      </button>
                    ) : (
                      <span style={{ color: '#374151', fontSize: 16 }}>+</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Create new list */}
            {showNew ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  autoFocus value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateList()}
                  placeholder={T.placeholder}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                    padding: '8px 10px', color: '#fff', fontSize: 12,
                    outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif" }}
                />
                <button onClick={handleCreateList} disabled={loading || !newListName.trim()} style={{
                  background: PURPLE, border: 'none', color: '#fff',
                  borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                }}>{T.create}</button>
                <button onClick={() => setShowNew(false)} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#475569', borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                }}>×</button>
              </div>
            ) : (
              <button onClick={() => setShowNew(true)} style={{
                width: '100%', background: 'none',
                border: '1px dashed rgba(255,255,255,0.12)', color: '#475569',
                borderRadius: 10, padding: '9px 0', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${PURPLE}60`; e.currentTarget.style.color = '#A78BFA' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#475569' }}
              >{T.newList}</button>
            )}
          </>
        )}

        {/* Step 2: pick status */}
        {step === 'status' && (
          <>
            <button onClick={() => setStep('list')} style={{
              background: 'none', border: 'none', color: '#475569',
              cursor: 'pointer', fontSize: 12, marginBottom: 12,
              fontFamily: "'Be Vietnam Pro', sans-serif", padding: 0,
            }}>{T.back} <span style={{ color: '#A78BFA' }}>{pickedList?.name}</span></button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s.key} onClick={() => handlePickStatus(s.key)}
                  disabled={loading} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  color: '#94A3B8', borderRadius: 10, padding: '10px 14px',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'left',
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.15s', opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${s.color}14`; e.currentTarget.style.borderColor = `${s.color}50`; e.currentTarget.style.color = s.color }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8' }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%',
                    background: s.color, flexShrink: 0 }} />
                  {statusLabel(s)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

// ── Auth prompt shown to guests ──────────────────────────────────
function GuestAuthPrompt({ onClose }) {
  const { lang } = useLang()
  const T = {
    title:   lang === 'vi' ? 'Bạn chưa đăng nhập'               : 'You\'re not signed in',
    body:    lang === 'vi' ? 'Đăng nhập hoặc tạo tài khoản để lưu danh sách của bạn.' : 'Sign in or create an account to save series to your list.',
    login:   lang === 'vi' ? 'Đăng nhập'                         : 'Sign In',
    signup:  lang === 'vi' ? 'Đăng ký'                           : 'Sign Up',
  }

  const go = (mode) => {
    onClose()
    // Fires a custom event that AppHeader listens for to open its AuthModal
    window.dispatchEvent(new CustomEvent('nt:open-auth', { detail: { mode } }))
  }

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg,#0e0520,#120828)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 20, padding: '32px 28px', width: 320, textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
          background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 20,
          fontWeight: 700, color: '#f1f5f9', marginBottom: 10, letterSpacing: 0.5 }}>
          {T.title}
        </div>
        <div style={{ fontFamily: "'Be Vietnam Pro',sans-serif", fontSize: 13,
          color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
          {T.body}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => go('login')} style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid rgba(139,92,246,0.4)',
            background: 'rgba(139,92,246,0.12)', color: '#A78BFA',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro',sans-serif", transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}
          >{T.login}</button>
          <button onClick={() => go('register')} style={{
            flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro',sans-serif",
            boxShadow: '0 4px 16px rgba(124,58,237,0.4)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >{T.signup}</button>
        </div>

        <button onClick={onClose} style={{
          marginTop: 14, background: 'none', border: 'none',
          color: '#4b5563', fontSize: 12, cursor: 'pointer',
          fontFamily: "'Be Vietnam Pro',sans-serif",
        }}>
          {lang === 'vi' ? 'Để sau' : 'Maybe later'}
        </button>
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export function QuickAddButton({ itemId, itemType, title, coverUrl }) {
  const { user }           = useAuth()
  const { getItemEntries } = useUserList()
  const [open, setOpen]    = useState(false)
  const [authPrompt, setAuthPrompt] = useState(false)

  // Always render — guests see the button too
  const entries = user ? getItemEntries(String(itemId), itemType) : []
  const isAdded = entries.length > 0
  const label   = isAdded ? '✓' : '+'

  const handleClick = (e) => {
    e.stopPropagation()
    if (!user) { setAuthPrompt(true) }
    else       { setOpen(true) }
  }

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 10,
          background: isAdded ? 'rgba(74,222,94,0.2)' : 'rgba(139,92,246,0.85)',
          border: `1px solid ${isAdded ? 'rgba(74,222,94,0.5)' : 'rgba(139,92,246,0.6)'}`,
          color: isAdded ? '#4ADE80' : '#fff',
          borderRadius: 7, width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 15, fontWeight: 700,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          transition: 'all 0.2s', padding: 0,
        }}
      >{label}</button>

      {open && (
        <QuickAddPopup
          itemId={String(itemId)} itemType={itemType}
          title={title} coverUrl={coverUrl}
          onClose={() => setOpen(false)}
        />
      )}

      {authPrompt && <GuestAuthPrompt onClose={() => setAuthPrompt(false)} />}
    </>
  )
}
