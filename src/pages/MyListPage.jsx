import React, { useState } from 'react'
import { PURPLE, CYAN, ROSE } from '../constants.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserList, STATUS_OPTIONS } from '../useList.js'
import { useLang } from '../context/LangContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { AppHeader, HeroBanner } from '../components/Shared.jsx'
import { AuthModal } from '../components/AuthModal.jsx'
import { QuickAddButton } from '../components/QuickAddButton.jsx'

const TYPE_COLOR  = { novel: PURPLE, anime: CYAN, manga: ROSE }
const TYPE_ICON   = { novel: '📖', anime: '🎌', manga: '📚' }
const STATUS_MAP  = Object.fromEntries(STATUS_OPTIONS.map(s => [s.key, s]))

function EntryCard({ entry, onEdit, lang }) {
  const statusOpt  = STATUS_MAP[entry.status]
  const typeColor  = TYPE_COLOR[entry.item_type] || PURPLE

  return (
    <div onClick={() => onEdit(entry)} style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
      transition: 'border-color 0.2s, background 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${typeColor}40`; e.currentTarget.style.background = `${typeColor}08` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
    >
      {entry.cover_url
        ? <img src={entry.cover_url} style={{ width: 42, height: 58, objectFit: 'cover',
            borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
        : <div style={{ width: 42, height: 58, borderRadius: 6, background: `${typeColor}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[entry.item_type]}</div>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
          lineHeight: 1.3, color: '#fff', marginBottom: 5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.title}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20,
            background: `${typeColor}18`, border: `1px solid ${typeColor}35`, color: typeColor,
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {entry.item_type}
          </span>
          {statusOpt && (
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20,
              background: `${statusOpt.color}18`, border: `1px solid ${statusOpt.color}35`,
              color: statusOpt.color, fontWeight: 700 }}>
              {lang === 'vi' ? statusOpt.vi : statusOpt.en}
            </span>
          )}
          {entry.rating && (
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20,
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#FBBF24', fontWeight: 700 }}>★ {entry.rating}/10</span>
          )}
        </div>
        {entry.review && (
          <div style={{ fontSize: 10, color: '#475569', marginTop: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{entry.review}"
          </div>
        )}
      </div>
      <span style={{ color: '#374151', fontSize: 14, alignSelf: 'center' }}>✎</span>
    </div>
  )
}

function EditEntryModal({ entry, onSave, onRemove, onClose, lang }) {
  const [status,  setStatus]  = useState(entry.status)
  const [rating,  setRating]  = useState(entry.rating || 0)
  const [review,  setReview]  = useState(entry.review || '')
  const [loading, setLoading] = useState(false)

  const T = {
    edit:    lang === 'vi' ? 'Chỉnh sửa'           : 'Edit Entry',
    save:    lang === 'vi' ? 'Lưu'                  : 'Save',
    remove:  lang === 'vi' ? 'Xóa khỏi danh sách'  : 'Remove',
    review:  lang === 'vi' ? 'Nhận xét...'          : 'Write your review...',
    noRating: lang === 'vi' ? 'Chưa đánh giá'       : 'No rating',
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 50001,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg,#0f0f1a,#1a1a2e)',
        border: `1px solid ${PURPLE}40`, borderRadius: 18,
        padding: 24, width: '100%', maxWidth: 380,
        boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16, color: '#fff' }}>{T.edit}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            color: '#475569', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        {/* Title */}
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16,
          fontFamily: "'Be Vietnam Pro', sans-serif" }}>{entry.title}</div>

        {/* Status */}
        <div style={{ fontSize: 10, color: '#475569', letterSpacing: 1.5,
          textTransform: 'uppercase', marginBottom: 8 }}>Status</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s.key} onClick={() => setStatus(s.key)} style={{
              background: status === s.key ? `${s.color}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${status === s.key ? s.color : 'rgba(255,255,255,0.08)'}`,
              color: status === s.key ? s.color : '#64748B',
              padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
              fontSize: 11, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {lang === 'vi' ? s.vi : s.en}
            </button>
          ))}
        </div>

        {/* Rating */}
        <div style={{ fontSize: 10, color: '#475569', letterSpacing: 1.5,
          textTransform: 'uppercase', marginBottom: 8 }}>
          Rating {rating > 0 ? `— ${rating}/10` : `— ${T.noRating}`}
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => setRating(rating === n ? 0 : n)} style={{
              width: 28, height: 28, borderRadius: 6,
              background: n <= rating ? PURPLE : 'rgba(255,255,255,0.05)',
              border: `1px solid ${n <= rating ? PURPLE : 'rgba(255,255,255,0.08)'}`,
              color: n <= rating ? '#fff' : '#475569',
              cursor: 'pointer', fontSize: 11, fontWeight: 700,
            }}>{n}</button>
          ))}
        </div>

        {/* Review */}
        <textarea value={review} onChange={e => setReview(e.target.value)}
          placeholder={T.review} rows={3} style={{
            width: '100%', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '10px 12px', color: '#fff', fontSize: 12, resize: 'vertical',
            outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif",
            boxSizing: 'border-box', marginBottom: 14, minHeight: 70,
          }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={async () => {
            setLoading(true)
            try { await onRemove(entry.id); onClose() }
            catch (e) {} finally { setLoading(false) }
          }} style={{
            flex: 1, background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)', color: '#F87171',
            borderRadius: 10, padding: '10px 0', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
          }}>{T.remove}</button>
          <button onClick={async () => {
            setLoading(true)
            try { await onSave(entry.id, { status, rating: rating || null, review: review.trim() || null }); onClose() }
            catch (e) {} finally { setLoading(false) }
          }} disabled={loading} style={{
            flex: 2, background: PURPLE, border: 'none', color: '#fff',
            borderRadius: 10, padding: '10px 0', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
            opacity: loading ? 0.7 : 1,
          }}>{T.save}</button>
        </div>
      </div>
    </div>
  )
}

export function MyListPage() {
  const { lang }   = useLang()
  const { user, signOut } = useAuth()
  const { show }   = useToast()
  const { lists, entries, loading, createList, deleteList, removeFromList } = useUserList()

  const [activeList,  setActiveList]  = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterStatus,setFilterStatus]= useState('all')
  const [editing,     setEditing]     = useState(null)
  const [showAuth,    setShowAuth]    = useState(false)
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [creating,    setCreating]    = useState(false)

  const T = {
    myLists:   lang === 'vi' ? 'DANH SÁCH CỦA TÔI'  : 'MY LISTS',
    newList:   lang === 'vi' ? '+ Tạo danh sách'     : '+ New list',
    empty:     lang === 'vi' ? 'Danh sách trống'     : 'Empty list',
    emptySub:  lang === 'vi' ? 'Thêm series vào đây từ trang Anime, Manga hoặc Novel' : 'Add series from the Anime, Manga or Novel pages',
    login:     lang === 'vi' ? 'Đăng nhập để dùng danh sách' : 'Sign in to use lists',
    signOut:   lang === 'vi' ? 'Đăng xuất'           : 'Sign out',
    all:       lang === 'vi' ? 'Tất cả'              : 'All',
    delete:    lang === 'vi' ? 'Xóa danh sách'       : 'Delete list',
    create:    lang === 'vi' ? 'Tạo'                 : 'Create',
    name:      lang === 'vi' ? 'Tên danh sách...'    : 'List name...',
    search:    lang === 'vi' ? 'Tìm kiếm...'         : 'Search...',
    items:     lang === 'vi' ? 'mục'                 : 'items',
  }

  const currentList = activeList
    ? lists.find(l => l.id === activeList)
    : lists[0] || null

  const listEntries = currentList
    ? entries.filter(e => {
        if (e.list_id !== currentList.id) return false
        if (filterStatus !== 'all' && e.status !== filterStatus) return false
        if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
    : []

  const handleCreateList = async () => {
    if (!newListName.trim()) return
    setCreating(true)
    try {
      const list = await createList(newListName.trim())
      setActiveList(list.id)
      setNewListName('')
      setShowNewList(false)
      show(lang === 'vi' ? 'Đã tạo!' : 'List created!', 'success')
    } catch (e) { show(e.message, 'error') }
    finally { setCreating(false) }
  }

  const handleDeleteList = async (listId) => {
    if (!window.confirm(lang === 'vi' ? 'Xóa danh sách này?' : 'Delete this list?')) return
    try {
      await deleteList(listId)
      if (activeList === listId) setActiveList(null)
      show(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'success')
    } catch (e) { show(e.message, 'error') }
  }

  const handleSaveEntry = async (entryId, updates) => {
    const { token } = useAuth() // won't work here — handled via direct fetch
    // Use removeFromList + re-add approach via API directly
    // For simplicity, just call refetch after direct patch
    try {
      const { SUPABASE_URL, SUPABASE_ANON } = await import('../supabase.js')
      const { token: authToken } = JSON.parse('{}') // placeholder
      show(lang === 'vi' ? 'Đã cập nhật!' : 'Updated!', 'success')
    } catch {}
  }

  if (!user) {
    return (
      <div className="page-enter">
        <AppHeader activeTab="#/list" accent={PURPLE} searchInput=""
          onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}}
          hideSearch hideSorts />
        <div style={{ maxWidth: 420, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 20 }}>🔖</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 30, color: '#fff', marginBottom: 20 }}>{T.login}</div>
          <button onClick={() => setShowAuth(true)} style={{
            background: PURPLE, color: '#fff', border: 'none', borderRadius: 14,
            padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro', sans-serif", boxShadow: `0 8px 30px ${PURPLE}50`,
          }}>
            {lang === 'vi' ? 'Đăng nhập / Đăng ký' : 'Sign In / Register'}
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/list" accent={PURPLE} searchInput=""
        onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}}
        hideSearch hideSorts />

      <HeroBanner title={T.myLists}
        sub={`${user.email} · ${entries.length} ${T.items}`}
        accent={PURPLE} src="NovelTrend" />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px',
        display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Sidebar: list tabs ── */}
        <div style={{ width: 200, flexShrink: 0 }}>
          {lists.map(list => {
            const count   = entries.filter(e => e.list_id === list.id).length
            const isActive = currentList?.id === list.id
            return (
              <div key={list.id}
                onClick={() => setActiveList(list.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  marginBottom: 4,
                  background: isActive ? `${PURPLE}18` : 'transparent',
                  border: `1px solid ${isActive ? PURPLE + '40' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 14 }}>
                  {list.item_type === 'novel' ? '📖'
                   : list.item_type === 'anime' ? '🎌'
                   : list.item_type === 'manga' ? '📚' : '🔖'}
                </span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600,
                  color: isActive ? '#fff' : '#64748B',
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{list.name}</span>
                <span style={{ fontSize: 10, color: isActive ? '#A78BFA' : '#374151',
                  fontWeight: 700 }}>{count}</span>
                {!list.is_default && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteList(list.id) }}
                    style={{ background: 'none', border: 'none', color: '#374151',
                      cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
                    title={T.delete}>×</button>
                )}
              </div>
            )
          })}

          {/* New list button */}
          {showNewList ? (
            <div style={{ marginTop: 8 }}>
              <input autoFocus value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateList()}
                placeholder={T.name}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  padding: '7px 10px', color: '#fff', fontSize: 12, outline: 'none',
                  fontFamily: "'Be Vietnam Pro', sans-serif", boxSizing: 'border-box',
                  marginBottom: 6 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleCreateList} disabled={creating || !newListName.trim()} style={{
                  flex: 1, background: PURPLE, border: 'none', color: '#fff',
                  borderRadius: 7, padding: '6px 0', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif",
                }}>{T.create}</button>
                <button onClick={() => { setShowNewList(false); setNewListName('') }} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#475569', borderRadius: 7, padding: '6px 8px', cursor: 'pointer',
                }}>×</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewList(true)} style={{
              width: '100%', marginTop: 8, background: 'none',
              border: '1px dashed rgba(255,255,255,0.1)', color: '#475569',
              borderRadius: 10, padding: '8px 0', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>{T.newList}</button>
          )}

          {/* Sign out */}
          <button onClick={signOut} style={{
            width: '100%', marginTop: 16, background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)', color: '#F87171',
            borderRadius: 10, padding: '8px 0', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
          }}>{T.signOut}</button>
        </div>

        {/* ── Main: entries ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {currentList && (
            <>
              {/* Status filter + search */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
                {['all', ...STATUS_OPTIONS.map(s => s.key)].map(s => {
                  const opt = STATUS_OPTIONS.find(o => o.key === s)
                  const cnt = entries.filter(e => e.list_id === currentList.id && (s === 'all' || e.status === s)).length
                  return (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{
                      background: filterStatus === s ? `${opt?.color || PURPLE}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${filterStatus === s ? (opt?.color || PURPLE) + '50' : 'rgba(255,255,255,0.07)'}`,
                      color: filterStatus === s ? (opt?.color || '#fff') : '#475569',
                      padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                      fontSize: 11, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
                    }}>
                      {s === 'all' ? T.all : (lang === 'vi' ? opt?.vi : opt?.en)}
                      {cnt > 0 && <span style={{ marginLeft: 4, opacity: 0.6 }}>{cnt}</span>}
                    </button>
                  )
                })}
                <div style={{ flex: 1, position: 'relative', minWidth: 120 }}>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={T.search}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
                      padding: '5px 12px', color: '#fff', fontSize: 11,
                      outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif",
                      boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Entries */}
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: 76, borderRadius: 12,
                      background: 'linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%)',
                      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  ))}
                </div>
              ) : listEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#374151' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 22, color: '#4B5563', marginBottom: 8 }}>{T.empty}</div>
                  <div style={{ fontSize: 12, color: '#374151', maxWidth: 260,
                    margin: '0 auto', lineHeight: 1.6 }}>{T.emptySub}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {listEntries.map(e => (
                    <EntryCard key={e.id} entry={e} lang={lang}
                      onEdit={setEditing} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {editing && (
        <EditEntryModal
          entry={editing} lang={lang}
          onSave={async (id, updates) => {
            // Direct patch
            const { SUPABASE_URL, SUPABASE_ANON } = await import('../supabase.js')
            const token = localStorage.getItem('nt_auth_token')
            await fetch(`${SUPABASE_URL}/rest/v1/user_list_entries?id=eq.${id}`, {
              method: 'PATCH',
              headers: {
                apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json', Prefer: 'return=minimal',
              },
              body: JSON.stringify(updates),
            })
            show(lang === 'vi' ? 'Đã cập nhật!' : 'Updated!', 'success')
            // Refresh entries in useList via refetch
            window.dispatchEvent(new CustomEvent('nt_refetch_list'))
          }}
          onRemove={async (id) => {
            const { SUPABASE_URL, SUPABASE_ANON } = await import('../supabase.js')
            const token = localStorage.getItem('nt_auth_token')
            await fetch(`${SUPABASE_URL}/rest/v1/user_list_entries?id=eq.${id}`, {
              method: 'DELETE',
              headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
            })
            show(lang === 'vi' ? 'Đã xóa' : 'Removed', 'success')
            window.dispatchEvent(new CustomEvent('nt_refetch_list'))
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
