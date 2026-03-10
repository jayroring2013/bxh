import React, { useRef, useState, useEffect } from 'react'
import { PURPLE, novelStatusColor } from '../constants.js'
import { useLang } from '../context/LangContext.jsx'
import { useSeriesById, useSeriesVolumes, useSeriesLinks, useRelatedSeries, useSeriesNuData, seriesUrl } from '../hooks.js'
import { AppHeader, PageFooter, ErrorBox } from '../components/Shared.jsx'
import { QuickAddButton } from '../components/QuickAddButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserList } from '../useList.js'
import { createPortal } from 'react-dom'

const LINK_STYLES = {
  shop:     { color: '#F59E0B', label: 'Shop'        },
  buy:      { color: '#F59E0B', label: 'Mua sách'    },
  read:     { color: '#06B6D4', label: 'Đọc online'  },
  watch:    { color: '#06B6D4', label: 'Xem anime'   },
  trailer:  { color: '#EF4444', label: 'Trailer'     },
  official: { color: '#8B5CF6', label: 'Official'    },
  raw:      { color: '#7a6045', label: 'Raws'        },
  anilist:  { color: '#02A9FF', label: 'AniList'     },
  mal:      { color: '#2E51A2', label: 'MyAnimeList' },
}

// ── Large inline save button for series detail page ─────────────
function SeriesSaveButton({ seriesId, title, coverUrl }) {
  const { user } = useAuth()
  const { lists, addToList, removeFromList, getItemEntries, createList } = useUserList()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('list')
  const [pickedList, setPickedList] = useState(null)
  const [loading2, setLoading2] = useState(false)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  if (!user) return null

  const entries = getItemEntries(String(seriesId), 'novel')
  const isSaved = entries.length > 0
  const relevantLists = lists.filter(l => l.item_type === 'novel' || l.item_type === 'all' || !l.item_type)

  const STATUS_COLORS = { reading: '#22d3ee', completed: '#4ade80', 'plan-to-read': '#a78bfa', dropped: '#f87171', 'on-hold': '#fb923c' }
  const STATUS_LABELS_VI = { reading: 'Đang đọc', completed: 'Đã đọc', 'plan-to-read': 'Dự định đọc', dropped: 'Bỏ dở', 'on-hold': 'Tạm dừng' }
  const STATUS_LABELS_EN = { reading: 'Reading', completed: 'Completed', 'plan-to-read': 'Plan to read', dropped: 'Dropped', 'on-hold': 'On hold' }

  const closePopup = () => { setOpen(false); setStep('list'); setPickedList(null); setShowNew(false); setNewName('') }

  const handlePickList = (list) => { setPickedList(list); setStep('status') }

  const handlePickStatus = async (statusKey) => {
    setLoading2(true)
    try {
      await addToList({ listId: pickedList.id, item_id: String(seriesId), item_type: 'novel', title, cover_url: coverUrl, status: statusKey })
      closePopup()
    } catch (e) { console.error(e) }
    finally { setLoading2(false) }
  }

  const handleRemove = async (entryId) => {
    setLoading2(true)
    try { await removeFromList(entryId) } catch (e) { console.error(e) }
    finally { setLoading2(false) }
  }

  const handleCreateList = async () => {
    if (!newName.trim()) return
    setLoading2(true)
    try { await createList(newName.trim(), 'novel'); setNewName(''); setShowNew(false) } catch (e) { console.error(e) }
    finally { setLoading2(false) }
  }

  const popup = open ? createPortal(
    <div onClick={closePopup} style={{ position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg,#1a130c,#221a12)',
        border: `1px solid ${PURPLE}40`, borderRadius: 18,
        padding: 22, width: '100%', maxWidth: 360,
        boxShadow: `0 24px 60px rgba(0,0,0,0.85), 0 0 40px ${PURPLE}15` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
          {coverUrl && <img src={coverUrl} style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'Barlow Condensed',sans-serif" }}>{title}</div>
            <div style={{ fontSize: 10, color: '#a08060', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Be Vietnam Pro',sans-serif" }}>
              {step === 'list' ? (lang === 'vi' ? 'Chọn danh sách' : 'Choose a list') : (lang === 'vi' ? 'Trạng thái' : 'Set status')}
            </div>
          </div>
          <button onClick={closePopup} style={{ background: 'none', border: 'none', color: '#a08060', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        {step === 'list' && (<>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            {relevantLists.map(list => {
              const entry = entries.find(e => e.list_id === list.id)
              const sc = STATUS_COLORS[entry?.status] || PURPLE
              return (
                <div key={list.id} onClick={() => handlePickList(list)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: entry ? `${sc}12` : 'rgba(255,248,240,0.04)',
                  border: `1px solid ${entry ? sc + '40' : 'rgba(255,248,240,0.08)'}`,
                  borderRadius: 10, padding: '9px 12px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => !entry && (e.currentTarget.style.borderColor = PURPLE + '50')}
                  onMouseLeave={e => !entry && (e.currentTarget.style.borderColor = 'rgba(255,248,240,0.08)')}>
                  <span style={{ fontSize: 14 }}>📖</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: "'Be Vietnam Pro',sans-serif" }}>{list.name}</div>
                    {entry && <div style={{ fontSize: 10, color: sc, marginTop: 1 }}>{lang === 'vi' ? STATUS_LABELS_VI[entry.status] : STATUS_LABELS_EN[entry.status]}</div>}
                  </div>
                  {entry
                    ? <button onClick={e => { e.stopPropagation(); handleRemove(entry.id) }} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>{lang === 'vi' ? 'Xóa' : 'Remove'}</button>
                    : <span style={{ color: '#a08060', fontSize: 16 }}>+</span>}
                </div>
              )
            })}
          </div>
          {showNew ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateList()}
                placeholder={lang === 'vi' ? 'Tên danh sách...' : 'List name...'}
                style={{ flex: 1, background: 'rgba(255,248,240,0.06)', border: '1px solid rgba(255,248,240,0.12)', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 12, outline: 'none', fontFamily: "'Be Vietnam Pro',sans-serif" }} />
              <button onClick={handleCreateList} disabled={loading2} style={{ background: PURPLE, border: 'none', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{lang === 'vi' ? 'Tạo' : 'Create'}</button>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#a08060', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>×</button>
            </div>
          ) : (
            <button onClick={() => setShowNew(true)} style={{ width: '100%', background: 'none', border: '1px dashed rgba(255,255,255,0.12)', color: '#a08060', borderRadius: 10, padding: '9px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: "'Be Vietnam Pro',sans-serif", transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = PURPLE + '60'; e.currentTarget.style.color = '#A78BFA' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a08060' }}>
              {lang === 'vi' ? '+ Tạo danh sách mới' : '+ Create new list'}
            </button>
          )}
        </>)}
        {step === 'status' && (<>
          <button onClick={() => setStep('list')} style={{ background: 'none', border: 'none', color: '#a08060', cursor: 'pointer', fontSize: 12, marginBottom: 12, fontFamily: "'Be Vietnam Pro',sans-serif", padding: 0 }}>
            ← <span style={{ color: '#A78BFA' }}>{pickedList?.name}</span>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {Object.entries(STATUS_LABELS_VI).map(([key, viLabel]) => {
              const sc = STATUS_COLORS[key] || '#94A3B8'
              return (
                <button key={key} onClick={() => handlePickStatus(key)} disabled={loading2} style={{
                  background: 'rgba(255,248,240,0.04)', border: '1px solid rgba(255,248,240,0.08)',
                  color: '#c8a882', borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, textAlign: 'left', fontFamily: "'Be Vietnam Pro',sans-serif",
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s', opacity: loading2 ? 0.6 : 1 }}
                  onMouseEnter={e => { e.currentTarget.style.background = sc + '14'; e.currentTarget.style.borderColor = sc + '50'; e.currentTarget.style.color = sc }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,248,240,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,248,240,0.08)'; e.currentTarget.style.color = '#c8a882' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                  {lang === 'vi' ? viLabel : STATUS_LABELS_EN[key]}
                </button>
              )
            })}
          </div>
        </>)}
      </div>
    </div>,
    document.getElementById('modal-root')
  ) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', borderRadius: 12, cursor: 'pointer',
          fontSize: 15, fontWeight: 700,
          fontFamily: "'Be Vietnam Pro', sans-serif",
          border: 'none',
          background: isSaved
            ? 'linear-gradient(135deg, #16a34a, #22c55e)'
            : `linear-gradient(135deg, ${PURPLE}, #6366F1)`,
          color: '#fff',
          boxShadow: isSaved
            ? '0 6px 20px rgba(34,197,94,0.35)'
            : `0 6px 20px ${PURPLE}50`,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = '' }}
      >
        {isSaved
          ? (lang === 'vi' ? '✓ Đã lưu' : '✓ Saved')
          : (lang === 'vi' ? '+ Thêm vào danh sách' : '+ Add to list')
        }
      </button>
      {popup}
    </>
  )
}

// ── Mini card for carousels ───────────────────────────────────────
function MiniCard({ series, accent }) {
  return (
    <div onClick={() => { window.location.hash = seriesUrl(series) }}
      style={{
        width: 156, flexShrink: 0, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
      <div style={{
        width: 156, height: 234, borderRadius: 12, overflow: 'hidden',
        background: '#1a1410', position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}44` }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
      >
        {series.cover_url
          ? <img src={series.cover_url} alt={series.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 32 }}>📖</div>
        }
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
        {series.publisher && (
          <div style={{
            position: 'absolute', bottom: 6, left: 6, right: 6,
            fontSize: 9, fontWeight: 700, color: '#b09070',
            fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: 0.5, textTransform: 'uppercase',
          }}>{series.publisher}</div>
        )}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.35,
        fontFamily: "'Be Vietnam Pro', sans-serif",
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>{series.title}</div>
    </div>
  )
}

// ── Volume card ───────────────────────────────────────────────────
function VolumeCard({ vol, seriesId, accent }) {
  const label = vol.volume_label === 'Standalone' ? 'Tập 1' : (vol.volume_label || `Tập ${vol.volume_number}`)
  const handleClick = () => {
    // Navigate to volume detail page - keep series slug from current hash
    const cur = window.location.hash
    const base = cur.replace(/\/volume\/\d+$/, '')
    window.location.hash = `${base}/volume/${vol.volume_number}`
  }

  return (
    <div onClick={handleClick} style={{
      width: 156, flexShrink: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        width: 156, height: 234, borderRadius: 12, overflow: 'hidden',
        background: '#1a1410', position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}44` }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
      >
        {vol.cover_url
          ? <img src={vol.cover_url} alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.style.display='none'} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize: 32 }}>📖</div>
        }
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />
        <div style={{
          position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff',
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5,
        }}>{label}</div>
      </div>
      {vol.release_date && (
        <div style={{ fontSize: 10, color: '#7a6045', fontFamily: "'Be Vietnam Pro', sans-serif",
          textAlign: 'center' }}>
          {new Date(vol.release_date).toLocaleDateString('vi-VN', { month:'short', year:'numeric' })}
        </div>
      )}
    </div>
  )
}

// ── Placeholder panel for empty tab content ─────────────────────
function PlaceholderPanel({ icon, text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 12,
      border: '1px dashed rgba(255,248,240,0.1)', borderRadius: 16,
    }}>
      <span style={{ fontSize: 36, opacity: 0.4 }}>{icon}</span>
      <p style={{
        fontSize: 13, color: '#7a6045', margin: 0,
        fontFamily: "'Be Vietnam Pro',sans-serif", textAlign: 'center',
      }}>{text}</p>
    </div>
  )
}

// ── Horizontal scroll carousel ────────────────────────────────────
function SectionCarousel({ title, children, count }) {
  const ref = useRef(null)
  const scroll = dir => ref.current?.scrollBy({ left: dir * 700, behavior: 'smooth' })
  if (!children || (Array.isArray(children) && children.length === 0)) return null

  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom: 16 }}>
        <h2 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize: 18,
          fontWeight: 800, letterSpacing: 1.5, color: '#f1f5f9', margin: 0,
          textTransform: 'uppercase' }}>
          {title}
          {count != null && (
            <span style={{ fontSize: 12, color: '#a08060', fontWeight: 500,
              marginLeft: 10, textTransform: 'none' }}>({count})</span>
          )}
        </h2>
        <div style={{ display:'flex', gap: 6 }}>
          {['←','→'].map((a, i) => (
            <button key={a} onClick={() => scroll(i===0?-1:1)} style={{
              width: 28, height: 28, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,248,240,0.04)', color: '#7a6045',
              cursor: 'pointer', fontSize: 13, display:'flex',
              alignItems:'center', justifyContent:'center',
            }}>{a}</button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{
        display: 'flex', gap: 16, overflowX: 'auto', overflowY: 'visible',
        padding: '8px 8px 20px', scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {children}
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────
function TabPanelContent({ activeTab, lang, series, volumes, related, PURPLE, MiniCard, PlaceholderPanel }) {
  const headingStyle = {
    fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18,
    fontWeight: 800, letterSpacing: 1.5, color: '#f1f5f9', margin: '0 0 20px',
    textTransform: 'uppercase',
  }
  if (activeTab === 'info') return (
    <div>
      <h3 style={headingStyle}>{lang === 'vi' ? 'Thông tin' : 'Information'}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        {[
          { label: lang === 'vi' ? 'Tên gốc'      : 'Original title', value: series?.title_orig || '—' },
          { label: lang === 'vi' ? 'Tác giả'       : 'Author',         value: series?.author || '—' },
          { label: lang === 'vi' ? 'Nhà xuất bản'  : 'Publisher',      value: series?.publisher || '—' },
          { label: lang === 'vi' ? 'Trạng thái'    : 'Status',         value: series?.status || '—' },
          { label: lang === 'vi' ? 'Số tập'        : 'Volumes',        value: volumes.length ? `${volumes.length} tập` : '—' },
          { label: 'NovelUpdates Score',                                 value: series?.score != null ? `★ ${Number(series.score).toFixed(1)}` : '—' },
          { label: lang === 'vi' ? 'Thể loại'      : 'Genres',         value: (series?.genres || []).join(', ') || '—' },
        ].map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,248,240,0.05)' }}>
            <td style={{ padding: '9px 16px 9px 0', width: '38%', fontSize: 12, color: '#a08060',
              fontWeight: 600, fontFamily: "'Be Vietnam Pro',sans-serif",
              textTransform: 'uppercase', letterSpacing: 0.6, verticalAlign: 'top' }}>{row.label}</td>
            <td style={{ padding: '9px 0', fontSize: 13, color: '#c8a882',
              fontFamily: "'Be Vietnam Pro',sans-serif" }}>{row.value}</td>
          </tr>
        ))}
      </table>
    </div>
  )
  if (activeTab === 'relations') return (
    <div>
      <h3 style={headingStyle}>{lang === 'vi' ? 'Series liên quan' : 'Related Series'}</h3>
      {related.length > 0
        ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {related.map(s => <MiniCard key={s.id} series={s} accent={PURPLE} />)}
          </div>
        : <PlaceholderPanel icon="🔗" text={lang === 'vi' ? 'Chưa có dữ liệu về series liên quan' : 'No relation data yet'} />
      }
    </div>
  )
  if (activeTab === 'ranking') return (
    <div>
      <h3 style={headingStyle}>{lang === 'vi' ? 'Lịch sử xếp hạng' : 'Ranking History'}</h3>
      <PlaceholderPanel icon="🏆" text={lang === 'vi' ? 'Dữ liệu xếp hạng đang được cập nhật' : 'Ranking data coming soon'} />
    </div>
  )
  return null
}

export function SeriesDetailPage({ seriesId }) {
  const { lang } = useLang()
  const { series, loading, error } = useSeriesById(seriesId)
  const { volumes, loading: loadingVols } = useSeriesVolumes(seriesId)
  const links = useSeriesLinks(seriesId)
  const { nuData } = useSeriesNuData(series?.title)
  const { related, recs } = useRelatedSeries(
    seriesId,
    series?.genres,
    series?.publisher
  )

  const [descExpanded, setDescExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('volumes')
  const goBack = () => window.history.back()

  if (loading) return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput="" onSearch={() => {}}
        sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />
      <div style={{ textAlign:'center', padding: '80px 20px', color: '#a08060',
        fontFamily:"'Be Vietnam Pro',sans-serif" }}>Đang tải…</div>
    </div>
  )

  if (error || !series) return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput="" onSearch={() => {}}
        sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />
      <div style={{ padding: 40 }}>
        <ErrorBox msg={error || 'Series not found'} onRetry={() => window.location.reload()} color={PURPLE} />
      </div>
    </div>
  )

  // Max volume by volume_number — used for cover and volume count
  const maxVol = volumes.length
    ? volumes.reduce((a, b) => ((b.volume_number || 0) > (a.volume_number || 0) ? b : a), volumes[0])
    : null
  const volCount = maxVol?.volume_number ?? (volumes.length || null)
  const cover  = maxVol?.cover_url || series.cover_url
  const title  = series.title || 'Unknown'
  const genres = (() => {
    if (Array.isArray(series.genres) && series.genres.length) return series.genres
    if (nuData?.genres) return nuData.genres.split(',').map(g => g.trim()).filter(Boolean)
    return []
  })()
  const desc   = typeof series.description === 'object'
    ? (series.description?.vi || series.description?.en || '')
    : (series.description || '')
  const status = series.status
  const statusColor = novelStatusColor(status)

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput="" onSearch={() => {}}
        sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />


      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(160deg,#140f08,#110d0a,#0f0b09)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Blurred bg from cover */}
        {cover && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${cover})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(40px) saturate(0.4)', opacity: 0.18,
          }} />
        )}
        <div style={{ position:'absolute', inset:0, zIndex:1,
          background:'linear-gradient(to bottom, rgba(8,13,26,0.5) 0%, rgba(8,13,26,0.95) 100%)' }} />

        <div style={{ position:'relative', zIndex:2,
          padding: isMobile ? '20px 16px 28px' : '32px 32px 40px', paddingLeft: isMobile ? 16 : 228,
          display:'flex', gap: isMobile ? 14 : 36, alignItems:'flex-start' }}>

          {/* Back button */}
          <button onClick={goBack} style={{
            position:'absolute', top: 0, left: 228,
            background:'none', border:'none', color:'#5a4a3a', cursor:'pointer',
            fontSize: 12, fontWeight: 600, fontFamily:"'Be Vietnam Pro',sans-serif",
            display:'flex', alignItems:'center', gap: 4, padding: '4px 0',
          }}>← {lang === 'vi' ? 'Quay lại' : 'Back'}</button>

          {/* Cover */}
          <div style={{ flexShrink: 0, marginTop: 20 }}>
            <div style={{
              width: isMobile ? 110 : 264, borderRadius: 16, overflow: 'hidden',
              boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,248,240,0.07)`,
              aspectRatio: '2/3', background: '#1a1410',
            }}>
              {cover
                ? <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => e.target.style.display='none'} />
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize: 48 }}>📖</div>
              }
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, paddingTop: 24 }}>

            {/* Genre + status tags */}
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6, marginBottom: 12 }}>
              {genres.slice(0, 5).map(g => (
                <span key={g}
                  onClick={() => {
                    window.location.hash = '#/novels'
                    setTimeout(() => window.dispatchEvent(new CustomEvent('nt:filter', {
                      detail: { genre: g }
                    })), 80)
                  }}
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    background: `${PURPLE}20`, border: `1px solid ${PURPLE}40`,
                    color: '#C4B5FD', fontFamily:"'Be Vietnam Pro',sans-serif",
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background=`${PURPLE}40`}
                  onMouseLeave={e => e.currentTarget.style.background=`${PURPLE}20`}
                >{g}</span>
              ))}
              {status && status !== 'ongoing' && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: `${statusColor.replace(/[\d.]+\)$/, '0.2)')}`,
                  border: `1px solid ${statusColor.replace(/[\d.]+\)$/, '0.4)')}`,
                  color: '#fff', textTransform: 'capitalize',
                  fontFamily:"'Be Vietnam Pro',sans-serif",
                }}>{status}</span>
              )}
            </div>

            <h1 style={{
              fontFamily:"'Barlow Condensed', sans-serif", fontSize:'clamp(24px,4vw,42px)',
              fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px', lineHeight: 1.1, letterSpacing: 1,
            }}>{title}</h1>

            {series.author && (
              <div style={{ fontSize: 13, color: '#b09070', marginBottom: 16,
                fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                {lang === 'vi' ? 'Tác giả: ' : 'Author: '}
                <span style={{ color: '#C4B5FD', fontWeight: 600 }}>{series.author}</span>
              </div>
            )}

            {/* Stats chips */}
            <div style={{ display:'flex', gap: 16, marginBottom: 20, flexWrap:'wrap' }}>
              {/* Volume count chip */}
              <div style={{
                textAlign:'center', background:'rgba(255,248,240,0.04)',
                border:'1px solid rgba(255,248,240,0.08)', borderRadius: 12,
                padding: '8px 16px', minWidth: 70,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#C4B5FD',
                  fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {loadingVols ? '…' : (volCount ?? '?')}
                </div>
                <div style={{ fontSize: 10, color: '#a08060', fontWeight: 600, letterSpacing: 0.8,
                  textTransform:'uppercase', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                  {lang==='vi'?'Tập':'Volumes'}
                </div>
              </div>

              {/* Publisher chip — clickable → filter by publisher */}
              <div onClick={() => {
                  window.location.hash = '#/novels'
                  setTimeout(() => window.dispatchEvent(new CustomEvent('nt:filter', {
                    detail: { publisher: series.publisher }
                  })), 80)
                }}
                style={{
                  textAlign:'center', background:'rgba(255,248,240,0.04)',
                  border:'1px solid rgba(255,248,240,0.08)', borderRadius: 12,
                  padding: '8px 16px', minWidth: 70,
                  cursor: series.publisher ? 'pointer' : 'default',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { if (series.publisher) { e.currentTarget.style.background='rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.35)' }}}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,248,240,0.04)'; e.currentTarget.style.borderColor='rgba(255,248,240,0.08)' }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: '#C4B5FD',
                  fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {series.publisher || '—'}
                </div>
                <div style={{ fontSize: 10, color: '#a08060', fontWeight: 600, letterSpacing: 0.8,
                  textTransform:'uppercase', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                  NPH
                </div>
              </div>

              {/* NU Score chip */}
              <div style={{
                textAlign:'center', background:'rgba(255,248,240,0.04)',
                border:'1px solid rgba(255,248,240,0.08)', borderRadius: 12,
                padding: '8px 16px', minWidth: 70,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FBBF24',
                  fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {series.score != null
                    ? `★ ${Number(series.score).toFixed(1)}`
                    : nuData?.nu_rating ? `★ ${nuData.nu_rating}` : 'N/A'}
                </div>
                <div style={{ fontSize: 10, color: '#a08060', fontWeight: 600, letterSpacing: 0.8,
                  textTransform:'uppercase', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                  NU_SCORE
                </div>
              </div>
            </div>

            {/* Description */}
            {desc && (() => {
              const LIMIT = 320
              const isLong = desc.length > LIMIT
              const shown = (!isLong || descExpanded) ? desc : desc.slice(0, LIMIT) + '…'
              return (
                <div style={{ maxWidth: 640, marginBottom: 20 }}>
                  <p style={{
                    fontSize: 13, color: '#c8a882', lineHeight: 1.8,
                    fontFamily:"'Be Vietnam Pro',sans-serif", margin: 0,
                    whiteSpace: 'pre-line',
                  }}>{shown}</p>
                  {isLong && (
                    <button onClick={() => setDescExpanded(x => !x)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#8B5CF6', fontSize: 12, fontWeight: 600,
                      padding: '8px 0 0', display: 'block',
                      fontFamily:"'Be Vietnam Pro',sans-serif",
                    }}>{descExpanded
                      ? (lang === 'vi' ? '▲ Thu gọn' : '▲ Show less')
                      : (lang === 'vi' ? '▼ Xem thêm' : '▼ Read more')
                    }</button>
                  )}
                </div>
              )
            })()}

            {/* Actions row */}
            <div style={{ display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center' }}>
              <SeriesSaveButton seriesId={series.id} title={title} coverUrl={cover} />

              {series.external_id && (
                <a href={`https://ranobedb.org/series/${series.external_id}`}
                  target="_blank" rel="noreferrer" style={{
                    fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 10,
                    background: `${PURPLE}18`, border: `1px solid ${PURPLE}40`,
                    color: '#C4B5FD', textDecoration:'none',
                    fontFamily:"'Be Vietnam Pro',sans-serif",
                  }}>RanobeDB ↗</a>
              )}

              {links.map((lnk, i) => {
                const cfg = LINK_STYLES[lnk.link_type] || { color:'#7a6045', label: lnk.label || lnk.link_type }
                return (
                  <a key={i} href={lnk.url} target="_blank" rel="noreferrer" style={{
                    fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 10,
                    background: `${cfg.color}18`, border: `1px solid ${cfg.color}35`,
                    color: cfg.color, textDecoration:'none',
                    fontFamily:"'Be Vietnam Pro',sans-serif",
                  }}>{lnk.label || cfg.label} ↗</a>
                )
              })}
            </div>
          </div>
        </div>
      </div>{/* end hero */}

      {/* ── Below hero: sidebar | content ── */}
      {isMobile ? (
        /* ── MOBILE layout ── */
        <div style={{ padding: '0 0 48px' }}>
          {/* Mobile tab pills */}
          <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0', overflowX: 'auto' }}>
            {[
              { key: 'info',      icon: 'ℹ️',  vi: 'Thông tin',       en: 'Info'      },
              { key: 'relations', icon: '🔗',  vi: 'Liên quan',        en: 'Relations', badge: related.length || null },
              { key: 'ranking',   icon: '🏆',  vi: 'Xếp hạng',        en: 'Rankings'  },
            ].map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button key={tab.key} onClick={() => toggleTab(tab.key)} style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20,
                  background: isActive ? PURPLE : 'rgba(255,248,240,0.07)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  color: isActive ? '#fff' : '#a08060',
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                }}>
                  <span>{tab.icon}</span>
                  <span>{lang === 'vi' ? tab.vi : tab.en}</span>
                  {tab.badge > 0 && <span style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '0 5px', fontSize: 10 }}>{tab.badge}</span>}
                </button>
              )
            })}
          </div>

          {/* Mobile tab panel */}
          {activeTab && (
            <div style={{ padding: '20px 16px 4px' }}>
              <TabPanelContent activeTab={activeTab} lang={lang} series={series} volumes={volumes} related={related} PURPLE={PURPLE} MiniCard={MiniCard} PlaceholderPanel={PlaceholderPanel} />
            </div>
          )}

          {/* Mobile carousels */}
          <div style={{ padding: '24px 0 0' }}>
            <SectionCarousel title={lang === 'vi' ? 'Danh sách tập' : 'Volumes'} count={volumes.length}>
              {loadingVols
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ width:120, height:180, borderRadius:10, flexShrink:0,
                      background:'linear-gradient(90deg,#221a12 25%,#3d2e1e 50%,#221a12 75%)',
                      backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
                  ))
                : volumes.map(v => <VolumeCard key={v.id} vol={v} seriesId={series.id} accent={PURPLE} />)
              }
            </SectionCarousel>
            {recs.length > 0 && (
              <SectionCarousel title={lang === 'vi' ? 'Có thể bạn thích' : 'You May Also Like'}>
                {recs.map(s => <MiniCard key={s.id} series={s} accent={PURPLE} />)}
              </SectionCarousel>
            )}
          </div>
        </div>
      ) : (
        /* ── DESKTOP layout ── */
        <div>

        {/* ── Collapsible tab panel: appears BESIDE sidebar, above carousels ── */}
        {activeTab && !isMobile && (
          <div style={{
            borderBottom: '1px solid rgba(255,248,240,0.08)',
            background: 'rgba(255,248,240,0.02)',
          }}>
            {/* sidebar-width spacer so content aligns with right column */}
            <div style={{ display: 'flex' }}>
              <div style={{ width: 196, flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '24px 32px 28px', minWidth: 0 }}>
                <TabPanelContent activeTab={activeTab} lang={lang} series={series} volumes={volumes} related={related} PURPLE={PURPLE} MiniCard={MiniCard} PlaceholderPanel={PlaceholderPanel} />
              </div>
            </div>
          </div>
        )}

          {/* Sidebar + right column */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <aside style={{
              width: 196, flexShrink: 0,
              position: 'sticky', top: 56, alignSelf: 'flex-start',
              borderRight: '1px solid rgba(255,248,240,0.08)',
              background: '#0f0b09',
              zIndex: 10,
              paddingTop: 24,
            }}>
              {[
                { key: 'info',      icon: 'ℹ️',  vi: 'Thông tin',        en: 'Information'  },
                { key: 'relations', icon: '🔗',  vi: 'Series liên quan',  en: 'Relations',   badge: related.length || null },
                { key: 'ranking',   icon: '🏆',  vi: 'Xếp hạng',         en: 'Rankings'     },
              ].map(tab => {
                const isActive = activeTab === tab.key
                return (
                  <button key={tab.key} onClick={() => toggleTab(tab.key)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: isActive ? `${PURPLE}18` : 'none',
                    border: 'none',
                    borderRight: isActive ? `3px solid ${PURPLE}` : '3px solid transparent',
                    borderRadius: '8px 0 0 8px',
                    cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2,
                    textAlign: 'left',
                  }}
                    onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,248,240,0.04)')}
                    onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{tab.icon}</span>
                    <span style={{
                      flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#C4B5FD' : '#a08060',
                      fontFamily: "'Be Vietnam Pro', sans-serif",
                    }}>{lang === 'vi' ? tab.vi : tab.en}</span>
                    {tab.badge != null && tab.badge > 0 && (
                      <span style={{
                        background: isActive ? PURPLE : 'rgba(255,248,240,0.1)',
                        color: isActive ? '#fff' : '#a08060',
                        fontSize: 10, fontWeight: 700,
                        padding: '1px 6px', borderRadius: 10,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}>{tab.badge}</span>
                    )}
                  </button>
                )
              })}
            </aside>

            {/* Carousels in right column */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', padding: '32px 16px 48px' }}>
              <SectionCarousel title={lang === 'vi' ? 'Danh sách tập' : 'Volumes'} count={volumes.length}>
                {loadingVols
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} style={{ width:156, height:234, borderRadius:12, flexShrink:0,
                        background:'linear-gradient(90deg,#221a12 25%,#3d2e1e 50%,#221a12 75%)',
                        backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
                    ))
                  : volumes.map(v => <VolumeCard key={v.id} vol={v} seriesId={series.id} accent={PURPLE} />)
                }
              </SectionCarousel>
              {recs.length > 0 && (
                <SectionCarousel title={lang === 'vi' ? 'Có thể bạn thích' : 'You May Also Like'}>
                  {recs.map(s => <MiniCard key={s.id} series={s} accent={PURPLE} />)}
                </SectionCarousel>
              )}
            </div>
          </div>
        </div>
      )}

      <PageFooter color={PURPLE} src="NovelTrend" />
    </div>
  )
}
