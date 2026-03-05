import React, { useState } from 'react'
import { PURPLE, CYAN, ROSE } from '../constants.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserList, STATUS_LABELS } from '../useList.js'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader, HeroBanner } from '../components/Shared.jsx'
import { AddToListModal } from '../components/AddToListModal.jsx'
import { AuthModal } from '../components/AuthModal.jsx'

const TYPE_COLOR = { novel: PURPLE, anime: CYAN, manga: ROSE }
const TYPE_ICON  = { novel: '📖', anime: '🎌', manga: '📚' }

const STATUS_COLOR = {
  reading:   '#06B6D4', completed: '#4ADE80', planned: '#A78BFA',
  onhold:    '#F59E0B', dropped:   '#F87171',
}

function ListCard({ entry, onEdit, lang }) {
  const color  = TYPE_COLOR[entry.item_type] || PURPLE
  const statusColor = STATUS_COLOR[entry.status] || '#64748B'

  const statusLabel = {
    reading:   lang === 'vi' ? 'Đang đọc/xem' : 'Reading',
    completed: lang === 'vi' ? 'Hoàn thành'    : 'Completed',
    planned:   lang === 'vi' ? 'Dự định'       : 'Planned',
    onhold:    lang === 'vi' ? 'Tạm dừng'      : 'On Hold',
    dropped:   lang === 'vi' ? 'Bỏ dở'         : 'Dropped',
  }[entry.status] || entry.status

  return (
    <div onClick={() => onEdit(entry)} style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
      transition: 'border-color 0.2s, background 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08` }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
    >
      {/* Cover */}
      {entry.cover_url
        ? <img src={entry.cover_url} style={{ width: 46, height: 65, objectFit: 'cover',
            borderRadius: 7, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
        : <div style={{ width: 46, height: 65, borderRadius: 7, background: `${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0 }}>{TYPE_ICON[entry.item_type]}</div>
      }

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15,
          lineHeight: 1.3, color: '#fff', marginBottom: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.title}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {/* Type badge */}
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20,
            background: `${color}18`, border: `1px solid ${color}35`, color,
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {entry.item_type}
          </span>
          {/* Status badge */}
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20,
            background: `${statusColor}18`, border: `1px solid ${statusColor}35`,
            color: statusColor, fontWeight: 700 }}>
            {statusLabel}
          </span>
          {/* Rating */}
          {entry.rating && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20,
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
              color: '#FBBF24', fontWeight: 700 }}>
              ★ {entry.rating}/10
            </span>
          )}
        </div>
        {/* Review preview */}
        {entry.review && (
          <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{entry.review}"
          </div>
        )}
      </div>

      {/* Edit hint */}
      <div style={{ color: '#374151', fontSize: 16, flexShrink: 0, alignSelf: 'center' }}>✎</div>
    </div>
  )
}

export function MyListPage() {
  const { t, lang } = useLang()
  const { user, signOut } = useAuth()
  const { list, loading, addOrUpdate, remove, refetch } = useUserList()

  const [filterType,   setFilterType]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search,       setSearch]       = useState('')
  const [editing,      setEditing]      = useState(null)   // entry being edited
  const [showAuth,     setShowAuth]     = useState(false)

  const T = {
    title:     lang === 'vi' ? 'DANH SÁCH CỦA TÔI'  : 'MY LIST',
    empty:     lang === 'vi' ? 'Danh sách trống'     : 'Your list is empty',
    empty_sub: lang === 'vi' ? 'Mở một novel, anime hoặc manga và nhấn "+ Thêm vào danh sách"'
                             : 'Open any novel, anime or manga and click "+ Add to List"',
    login_prompt: lang === 'vi' ? 'Đăng nhập để lưu danh sách của bạn' : 'Sign in to save your list',
    logout:    lang === 'vi' ? 'Đăng xuất' : 'Sign out',
    search:    lang === 'vi' ? 'Tìm trong danh sách…' : 'Search your list…',
    all:       lang === 'vi' ? 'Tất cả'   : 'All',
    items:     lang === 'vi' ? 'mục'      : 'items',
  }

  const statusLabel = (key) => ({
    reading:   lang === 'vi' ? 'Đang đọc/xem' : 'Reading',
    completed: lang === 'vi' ? 'Hoàn thành'    : 'Completed',
    planned:   lang === 'vi' ? 'Dự định'       : 'Planned',
    onhold:    lang === 'vi' ? 'Tạm dừng'      : 'On Hold',
    dropped:   lang === 'vi' ? 'Bỏ dở'         : 'Dropped',
  })[key] || key

  const filtered = list.filter(e => {
    if (filterType   !== 'all' && e.item_type !== filterType)   return false
    if (filterStatus !== 'all' && e.status    !== filterStatus) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Group by status for display
  const grouped = {}
  filtered.forEach(e => {
    if (!grouped[e.status]) grouped[e.status] = []
    grouped[e.status].push(e)
  })

  const STATUS_ORDER = ['reading','planned','completed','onhold','dropped']

  if (!user) {
    return (
      <div className="page-enter">
        <AppHeader activeTab="#/list" accent={PURPLE} searchInput=""
          onSearch={() => {}} sorts={[]} activeSort="" onSort={() => {}}
          hideSearch hideSorts />
        <div style={{ maxWidth: 480, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔖</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32,
            marginBottom: 12, color: '#fff' }}>{T.login_prompt}</div>
          <button onClick={() => setShowAuth(true)} style={{
            background: PURPLE, color: '#fff', border: 'none', borderRadius: 14,
            padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro', sans-serif",
            boxShadow: `0 8px 30px ${PURPLE}50`,
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

      <HeroBanner title={T.title}
        sub={`${user.email} · ${list.length} ${T.items}`}
        accent={PURPLE} src="NovelTrend" />

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px' }}>

        {/* Sign out + filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap',
          alignItems: 'center', marginBottom: 20 }}>

          {/* Type filter */}
          {['all','novel','anime','manga'].map(tp => (
            <button key={tp} onClick={() => setFilterType(tp)} style={{
              background: filterType === tp ? PURPLE : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterType === tp ? PURPLE : 'rgba(255,255,255,0.08)'}`,
              color: filterType === tp ? '#fff' : '#64748B',
              padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {tp === 'all' ? T.all : `${TYPE_ICON[tp]} ${tp}`}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Sign out */}
          <button onClick={signOut} style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
          }}>{T.logout}</button>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {['all', ...STATUS_ORDER].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              background: filterStatus === s ? `${STATUS_COLOR[s] || PURPLE}25` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterStatus === s ? (STATUS_COLOR[s] || PURPLE) : 'rgba(255,255,255,0.07)'}`,
              color: filterStatus === s ? (STATUS_COLOR[s] || '#fff') : '#475569',
              padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
              fontSize: 11, fontWeight: 600, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              {s === 'all' ? T.all : statusLabel(s)}
              {s !== 'all' && list.filter(e => e.status === s).length > 0 && (
                <span style={{ marginLeft: 5, opacity: 0.6 }}>
                  {list.filter(e => (filterType === 'all' || e.item_type === filterType) && e.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={T.search}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
              padding: '10px 14px 10px 38px', color: '#fff', fontSize: 13,
              outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif", boxSizing: 'border-box',
            }} />
          <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12,
            top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none',
            color: '#64748B', cursor: 'pointer', fontSize: 18 }}>×</button>}
        </div>

        {/* List */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 82, borderRadius: 14,
                background: 'linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#4B5563' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔖</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, marginBottom: 8 }}>
              {T.empty}
            </div>
            <div style={{ fontSize: 14, color: '#374151', maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
              {T.empty_sub}
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          filterStatus === 'all'
            ? STATUS_ORDER.map(s => {
                const items = grouped[s]
                if (!items?.length) return null
                return (
                  <div key={s} style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
                        color: STATUS_COLOR[s], letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        {statusLabel(s)}
                      </div>
                      <div style={{ flex: 1, height: 1, background: `${STATUS_COLOR[s]}25` }} />
                      <div style={{ fontSize: 11, color: '#374151' }}>{items.length}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {items.map(e => <ListCard key={e.id} entry={e} onEdit={setEditing} lang={lang} />)}
                    </div>
                  </div>
                )
              })
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.map(e => <ListCard key={e.id} entry={e} onEdit={setEditing} lang={lang} />)}
              </div>
        )}
      </main>

      {/* Edit modal */}
      {editing && (
        <AddToListModal
          item={{ item_id: editing.item_id, item_type: editing.item_type,
            title: editing.title, cover_url: editing.cover_url }}
          existing={editing}
          onSave={addOrUpdate}
          onRemove={remove}
          onClose={() => setEditing(null)}
        />
      )}

      <footer className="page-footer">
        <span className="page-footer__brand" style={{ color: PURPLE }}>NOVELTREND</span>
        {` · ${list.length} ${T.items} · `}{new Date().getFullYear()}
      </footer>
    </div>
  )
}
