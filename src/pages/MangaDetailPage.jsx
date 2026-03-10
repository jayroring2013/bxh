import React, { useRef, useState, useEffect } from 'react'
import { ROSE } from '../constants.js'
import { useLang } from '../context/LangContext.jsx'
import { useMangaById, useMangaRelated, useSeriesLinks, mangaUrl } from '../hooks.js'
import { AppHeader, PageFooter, ErrorBox } from '../components/Shared.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserList } from '../useList.js'
import { createPortal } from 'react-dom'

const ACCENT = ROSE
const BG_DARK = '#0c0408'

const STATUS_COLORS = {
  ongoing: 'rgba(100,200,255,0.9)', completed: 'rgba(100,200,100,0.8)',
  hiatus: 'rgba(200,150,50,0.8)',   cancelled: 'rgba(200,80,80,0.8)',
}

// ── Save button (manga) ───────────────────────────────────────────
function MangaSaveButton({ mangaId, title, coverUrl }) {
  const { user } = useAuth()
  const { lists, addToList, removeFromList, getItemEntries, createList } = useUserList()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('list')
  const [pickedList, setPickedList] = useState(null)
  const [busy, setBusy] = useState(false)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  if (!user) return null

  const entries = getItemEntries(String(mangaId), 'manga')
  const isSaved = entries.length > 0
  const relevantLists = lists.filter(l => l.item_type === 'manga' || l.item_type === 'all' || !l.item_type)

  const SC = { reading: '#22d3ee', completed: '#4ade80', 'plan-to-read': '#a78bfa', dropped: '#f87171', 'on-hold': '#fb923c' }
  const LV = { reading: 'Đang đọc', completed: 'Đã đọc', 'plan-to-read': 'Dự định đọc', dropped: 'Bỏ dở', 'on-hold': 'Tạm dừng' }
  const LE = { reading: 'Reading', completed: 'Completed', 'plan-to-read': 'Plan to read', dropped: 'Dropped', 'on-hold': 'On hold' }

  const close = () => { setOpen(false); setStep('list'); setPickedList(null); setShowNew(false); setNewName('') }

  const popup = open ? createPortal(
    <div onClick={close} style={{ position:'fixed', inset:0, zIndex:50000,
      background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:`linear-gradient(145deg,#140810,#1e0d18)`,
        border:`1px solid ${ACCENT}40`, borderRadius:18, padding:22, width:'100%', maxWidth:360,
        boxShadow:`0 24px 60px rgba(0,0,0,0.9), 0 0 40px ${ACCENT}15` }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:18 }}>
          {coverUrl && <img src={coverUrl} style={{ width:40, height:56, objectFit:'cover', borderRadius:7, flexShrink:0 }} onError={e=>e.target.style.display='none'} />}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', fontFamily:"'Barlow Condensed',sans-serif" }}>{title}</div>
            <div style={{ fontSize:10, color:'#5a2030', marginTop:3, textTransform:'uppercase', letterSpacing:1, fontFamily:"'Be Vietnam Pro',sans-serif" }}>
              {step==='list' ? (lang==='vi'?'Chọn danh sách':'Choose a list') : (lang==='vi'?'Trạng thái':'Set status')}
            </div>
          </div>
          <button onClick={close} style={{ background:'none', border:'none', color:'#5a2030', fontSize:20, cursor:'pointer' }}>×</button>
        </div>
        {step === 'list' && (<>
          <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
            {relevantLists.map(list => {
              const entry = entries.find(e => e.list_id === list.id)
              const sc = SC[entry?.status] || ACCENT
              return (
                <div key={list.id} onClick={()=>{ setPickedList(list); setStep('status') }} style={{
                  display:'flex', alignItems:'center', gap:10,
                  background: entry ? `${sc}12` : 'rgba(244,63,94,0.04)',
                  border:`1px solid ${entry ? sc+'40' : 'rgba(244,63,94,0.08)'}`,
                  borderRadius:10, padding:'9px 12px', cursor:'pointer' }}>
                  <span style={{ fontSize:14 }}>📚</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#fff', fontFamily:"'Be Vietnam Pro',sans-serif" }}>{list.name}</div>
                    {entry && <div style={{ fontSize:10, color:sc, marginTop:1 }}>{lang==='vi'?LV[entry.status]:LE[entry.status]}</div>}
                  </div>
                  {entry
                    ? <button onClick={e=>{ e.stopPropagation(); setBusy(true); removeFromList(entry.id).finally(()=>setBusy(false)) }}
                        style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#F87171', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:10, fontWeight:700 }}>
                        {lang==='vi'?'Xóa':'Remove'}
                      </button>
                    : <span style={{ color:'#5a2030', fontSize:16 }}>+</span>}
                </div>
              )
            })}
          </div>
          {showNew ? (
            <div style={{ display:'flex', gap:8 }}>
              <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(setBusy(true),createList(newName.trim(),'manga').then(()=>{setNewName('');setShowNew(false)}).finally(()=>setBusy(false)))}
                placeholder={lang==='vi'?'Tên danh sách...':'List name...'}
                style={{ flex:1, background:'rgba(244,63,94,0.06)', border:'1px solid rgba(244,63,94,0.15)', borderRadius:8, padding:'8px 10px', color:'#fff', fontSize:12, outline:'none', fontFamily:"'Be Vietnam Pro',sans-serif" }} />
              <button onClick={()=>{setBusy(true);createList(newName.trim(),'manga').then(()=>{setNewName('');setShowNew(false)}).finally(()=>setBusy(false))}} disabled={busy}
                style={{ background:ACCENT, border:'none', color:'#fff', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:12, fontWeight:700 }}>{lang==='vi'?'Tạo':'Create'}</button>
              <button onClick={()=>setShowNew(false)} style={{ background:'none', border:'1px solid rgba(255,255,255,0.1)', color:'#5a2030', borderRadius:8, padding:'8px 10px', cursor:'pointer' }}>×</button>
            </div>
          ) : (
            <button onClick={()=>setShowNew(true)} style={{ width:'100%', background:'none', border:'1px dashed rgba(244,63,94,0.15)', color:'#5a2030', borderRadius:10, padding:'9px 0', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:"'Be Vietnam Pro',sans-serif" }}>
              {lang==='vi'?'+ Tạo danh sách mới':'+ Create new list'}
            </button>
          )}
        </>)}
        {step === 'status' && (<>
          <button onClick={()=>setStep('list')} style={{ background:'none', border:'none', color:'#5a2030', cursor:'pointer', fontSize:12, marginBottom:12, fontFamily:"'Be Vietnam Pro',sans-serif", padding:0 }}>
            ← <span style={{ color:ACCENT }}>{pickedList?.name}</span>
          </button>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {Object.entries(LV).map(([key, viLabel]) => {
              const sc = SC[key] || '#94A3B8'
              return (
                <button key={key} onClick={()=>{ setBusy(true); addToList({ listId:pickedList.id, item_id:String(mangaId), item_type:'manga', title, cover_url:coverUrl, status:key }).then(close).finally(()=>setBusy(false)) }}
                  disabled={busy} style={{ background:'rgba(244,63,94,0.04)', border:'1px solid rgba(244,63,94,0.08)', color:'#e8a0b0', borderRadius:10, padding:'10px 14px', cursor:'pointer', fontSize:13, fontWeight:600, textAlign:'left', fontFamily:"'Be Vietnam Pro',sans-serif", display:'flex', alignItems:'center', gap:10, opacity:busy?0.6:1 }}
                  onMouseEnter={e=>{e.currentTarget.style.background=sc+'14';e.currentTarget.style.borderColor=sc+'50';e.currentTarget.style.color=sc}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(244,63,94,0.04)';e.currentTarget.style.borderColor='rgba(244,63,94,0.08)';e.currentTarget.style.color='#e8a0b0'}}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:sc, flexShrink:0 }} />
                  {lang==='vi'?viLabel:LE[key]}
                </button>
              )
            })}
          </div>
        </>)}
      </div>
    </div>, document.getElementById('modal-root')
  ) : null

  return (<>
    <button onClick={()=>setOpen(true)} style={{
      display:'flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:12, cursor:'pointer',
      fontSize:15, fontWeight:700, fontFamily:"'Be Vietnam Pro', sans-serif", border:'none',
      background: isSaved ? 'linear-gradient(135deg,#9d174d,#be185d)' : `linear-gradient(135deg,${ACCENT},#BE185D)`,
      color:'#fff', boxShadow: isSaved ? '0 6px 20px rgba(190,24,93,0.4)' : `0 6px 20px ${ACCENT}50`,
      transition:'all 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
      onMouseLeave={e=>e.currentTarget.style.transform=''}>
      {isSaved ? (lang==='vi'?'✓ Đã lưu':'✓ Saved') : (lang==='vi'?'+ Thêm vào danh sách':'+ Add to list')}
    </button>
    {popup}
  </>)
}

// ── Mini card ─────────────────────────────────────────────────────
function MiniCard({ item, url }) {
  return (
    <div onClick={()=>{ window.location.hash = url }}
      style={{ width:156, flexShrink:0, cursor:'pointer', display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ width:156, height:234, borderRadius:12, overflow:'hidden', background:'#100608',
        position:'relative', boxShadow:'0 4px 16px rgba(0,0,0,0.5)',
        transition:'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s' }}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow=`0 12px 32px ${ACCENT}44`}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.5)'}}>
        {item.cover_url
          ? <img src={item.cover_url} alt={item.title||''} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>📚</div>}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
        {item.rating && (
          <div style={{ position:'absolute', bottom:6, left:6, fontSize:10, fontWeight:700, color:'#FBBF24', fontFamily:"'Barlow Condensed',sans-serif" }}>★ {parseFloat(item.rating).toFixed(2)}</div>
        )}
      </div>
      <div style={{ fontSize:11, fontWeight:600, color:'#e2e8f0', lineHeight:1.35, fontFamily:"'Be Vietnam Pro',sans-serif",
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.title}</div>
    </div>
  )
}

// ── Placeholder ───────────────────────────────────────────────────
function Placeholder({ icon, text }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'60px 20px', gap:12, border:'1px dashed rgba(244,63,94,0.1)', borderRadius:16 }}>
      <span style={{ fontSize:36, opacity:0.4 }}>{icon}</span>
      <p style={{ fontSize:13, color:'#5a2030', margin:0, fontFamily:"'Be Vietnam Pro',sans-serif", textAlign:'center' }}>{text}</p>
    </div>
  )
}

// ── Carousel ─────────────────────────────────────────────────────
function SectionCarousel({ title, children }) {
  const ref = useRef(null)
  const scroll = dir => ref.current?.scrollBy({ left: dir * 700, behavior:'smooth' })
  if (!children || (Array.isArray(children) && children.length === 0)) return null
  return (
    <section style={{ marginBottom:48 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:800, letterSpacing:1.5, color:'#f1f5f9', margin:0, textTransform:'uppercase' }}>{title}</h2>
        <div style={{ display:'flex', gap:6 }}>
          {['←','→'].map((a,i) => (
            <button key={a} onClick={()=>scroll(i===0?-1:1)} style={{ width:28, height:28, borderRadius:8, border:'1px solid rgba(244,63,94,0.1)', background:'rgba(244,63,94,0.04)', color:'#5a2030', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>{a}</button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{ display:'flex', gap:16, overflowX:'auto', overflowY:'visible', padding:'8px 8px 20px', scrollbarWidth:'none', msOverflowStyle:'none' }}>
        {children}
      </div>
    </section>
  )
}

// ── Tab content ───────────────────────────────────────────────────
function TabContent({ activeTab, lang, manga, related }) {
  const h = { fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:800, letterSpacing:1.5, color:'#f1f5f9', margin:'0 0 20px', textTransform:'uppercase' }
  const themes = manga.themes || []

  if (activeTab === 'info') {
    const rows = [
      { label: lang==='vi'?'Tên gốc':'Original title',     value: manga.title_ja || manga.title_ja_ro || '—' },
      { label: lang==='vi'?'Tác giả':'Author',              value: manga.author || '—' },
      { label: lang==='vi'?'Đối tượng':'Demographic',       value: manga.demographic ? manga.demographic.charAt(0).toUpperCase()+manga.demographic.slice(1) : '—' },
      { label: lang==='vi'?'Trạng thái':'Status',           value: manga.status ? manga.status.charAt(0).toUpperCase()+manga.status.slice(1) : '—' },
      { label: lang==='vi'?'Năm':'Year',                    value: manga.year || '—' },
      { label: lang==='vi'?'Số chapter':'Chapters',         value: manga.chapters || manga.last_chapter || '—' },
      { label: lang==='vi'?'Số volume':'Volumes',           value: manga.volumes || manga.last_volume || '—' },
      { label: lang==='vi'?'Ngôn ngữ gốc':'Original lang', value: (manga.original_language||'ja').toUpperCase() },
      { label: lang==='vi'?'Thể loại':'Genres',             value: (manga.genres||[]).join(', ') || '—' },
      { label: 'MangaDex Rating',                            value: manga.rating ? `★ ${parseFloat(manga.rating).toFixed(2)}` : '—' },
      { label: lang==='vi'?'Lượt theo dõi':'Follows',       value: manga.follows ? manga.follows.toLocaleString() : '—' },
    ]
    return (
      <div>
        <h3 style={h}>{lang==='vi'?'Thông tin':'Information'}</h3>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          {rows.map((row,i) => (
            <tr key={i} style={{ borderBottom:'1px solid rgba(244,63,94,0.05)' }}>
              <td style={{ padding:'9px 16px 9px 0', width:'38%', fontSize:12, color:'#5a2030', fontWeight:600, fontFamily:"'Be Vietnam Pro',sans-serif", textTransform:'uppercase', letterSpacing:0.6, verticalAlign:'top' }}>{row.label}</td>
              <td style={{ padding:'9px 0', fontSize:13, color:'#e8a0b0', fontFamily:"'Be Vietnam Pro',sans-serif" }}>{row.value}</td>
            </tr>
          ))}
        </table>
        {themes.length > 0 && (
          <div style={{ marginTop:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#5a2030', letterSpacing:1, textTransform:'uppercase', marginBottom:10, fontFamily:"'Be Vietnam Pro',sans-serif" }}>THEMES</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {themes.slice(0,12).map(t => (
                <span key={t} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', color:'#FDA4AF', fontFamily:"'Be Vietnam Pro',sans-serif" }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  if (activeTab === 'relations') return (
    <div>
      <h3 style={h}>{lang==='vi'?'Series liên quan':'Related Series'}</h3>
      {related.length > 0
        ? <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
            {related.map(r => <MiniCard key={r.id} item={{ cover_url: r.cover_url, title: r.title||r.title_en, rating: null }} url={mangaUrl({ id: r.external_id||r.id, title_en: r.title||r.title_en, title_ja_ro: '' })} />)}
          </div>
        : <Placeholder icon="🔗" text={lang==='vi'?'Chưa có dữ liệu liên quan':'No relation data yet'} />}
    </div>
  )
  if (activeTab === 'ranking') return (
    <div>
      <h3 style={h}>{lang==='vi'?'Lịch sử xếp hạng':'Ranking History'}</h3>
      <Placeholder icon="🏆" text={lang==='vi'?'Dữ liệu xếp hạng đang được cập nhật':'Ranking data coming soon'} />
    </div>
  )
  return null
}

// ── Main page ─────────────────────────────────────────────────────
export function MangaDetailPage({ mangaId }) {
  const { lang } = useLang()
  const { manga, loading, error } = useMangaById(mangaId)
  const { related, recs } = useMangaRelated(mangaId, manga?.genres)

  const [descExpanded, setDescExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const toggleTab = key => setActiveTab(prev => prev === key ? null : key)

  if (loading) return (
    <div className="page-enter">
      <AppHeader activeTab="#/manga" accent={ACCENT} searchInput="" onSearch={()=>{}} sorts={[]} activeSort="" onSort={()=>{}} hideSearch hideSorts />
      <div style={{ textAlign:'center', padding:'80px 20px', color:'#5a2030', fontFamily:"'Be Vietnam Pro',sans-serif" }}>Đang tải…</div>
    </div>
  )
  if (error || !manga) return (
    <div className="page-enter">
      <AppHeader activeTab="#/manga" accent={ACCENT} searchInput="" onSearch={()=>{}} sorts={[]} activeSort="" onSort={()=>{}} hideSearch hideSorts />
      <div style={{ padding:40 }}><ErrorBox msg={error||'Manga not found'} onRetry={()=>window.location.reload()} color={ACCENT} /></div>
    </div>
  )

  const cover   = manga.cover_url
  const title   = manga.title_en || manga.title_ja_ro || '—'
  const genres  = manga.genres || []
  const status  = manga.status
  const statusColor = STATUS_COLORS[status] || 'rgba(150,150,150,0.8)'
  const mdUrl   = `https://mangadex.org/title/${manga.id}`
  const desc    = (manga.description_en || '').replace(/\[.*?\]/g,'').trim()
  const LIMIT   = 380

  const TABS = [
    { key:'info',      icon:'ℹ️', vi:'Thông tin',      en:'Information' },
    { key:'relations', icon:'🔗', vi:'Series liên quan', en:'Relations', badge: related.length || null },
    { key:'ranking',   icon:'🏆', vi:'Xếp hạng',        en:'Rankings'  },
  ]

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/manga" accent={ACCENT} searchInput="" onSearch={()=>{}} sorts={[]} activeSort="" onSort={()=>{}} hideSearch hideSorts />

      {/* ── Hero ── */}
      <div style={{ background:'linear-gradient(160deg,#0f040a,#180810,#0c0408)', position:'relative', overflow:'hidden' }}>
        {cover && (
          <div style={{ position:'absolute', inset:0, zIndex:0, backgroundImage:`url(${cover})`, backgroundSize:'cover', backgroundPosition:'center', filter:'blur(40px) saturate(0.4)', opacity:0.15 }} />
        )}
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(to bottom, rgba(12,4,8,0.5) 0%, rgba(12,4,8,0.95) 100%)' }} />

        <div style={{ position:'relative', zIndex:2, padding: isMobile ? '20px 16px 28px' : '32px 32px 40px', paddingLeft: isMobile ? 16 : 228,
          display:'flex', gap: isMobile ? 14 : 32, alignItems:'flex-start' }}>
          {/* Back */}
          <button onClick={()=>window.history.back()} style={{ position:'absolute', top: isMobile?8:16, left: isMobile?16:228,
            background:'none', border:'none', color:'#3a1020', cursor:'pointer',
            fontSize:12, fontWeight:600, fontFamily:"'Be Vietnam Pro',sans-serif", display:'flex', alignItems:'center', gap:4 }}>
            ← {lang==='vi'?'Quay lại':'Back'}
          </button>

          {/* Cover */}
          <div style={{ flexShrink:0, marginTop: isMobile?28:20 }}>
            <div style={{ width: isMobile ? 110 : 200, borderRadius:14, overflow:'hidden',
              boxShadow:`0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(244,63,94,0.08)`,
              aspectRatio:'2/3', background:'#100608' }}>
              {cover
                ? <img src={cover} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>📚</div>}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex:1, paddingTop: isMobile?32:16 }}>
            {/* Tags */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
              {genres.slice(0,5).map(g => (
                <span key={g} style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20,
                  background:`${ACCENT}20`, border:`1px solid ${ACCENT}40`, color:'#FDA4AF',
                  fontFamily:"'Be Vietnam Pro',sans-serif" }}>{g}</span>
              ))}
              {status && (
                <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20,
                  background: statusColor.replace(/[\d.]+\)$/,'0.15)'), border:`1px solid ${statusColor.replace(/[\d.]+\)$/,'0.4)')}`,
                  color:'#fff', textTransform:'capitalize', fontFamily:"'Be Vietnam Pro',sans-serif" }}>{status}</span>
              )}
              {manga.demographic && (
                <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20,
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                  color:'#94A3B8', textTransform:'capitalize', fontFamily:"'Be Vietnam Pro',sans-serif" }}>{manga.demographic}</span>
              )}
            </div>

            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(22px,4vw,40px)',
              fontWeight:900, color:'#f1f5f9', margin:'0 0 4px', lineHeight:1.1, letterSpacing:1 }}>{title}</h1>

            {manga.title_ja_ro && manga.title_ja_ro !== title && (
              <div style={{ fontSize:13, color:'#5a2030', marginBottom:4, fontFamily:"'Be Vietnam Pro',sans-serif" }}>{manga.title_ja_ro}</div>
            )}
            {manga.title_ja && (
              <div style={{ fontSize:13, color:'#3a1020', marginBottom:4, fontFamily:"'Be Vietnam Pro',sans-serif" }}>{manga.title_ja}</div>
            )}
            {manga.author && (
              <div style={{ fontSize:13, color:'#3a1020', marginBottom:16, fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                {lang==='vi'?'Tác giả: ':'Author: '}<span style={{ color:'#FDA4AF', fontWeight:600 }}>{manga.author}</span>
              </div>
            )}

            {/* Stats chips */}
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
              {[
                { label: 'SCORE',    value: manga.rating ? `★ ${parseFloat(manga.rating).toFixed(2)}` : 'N/A', color:'#FBBF24' },
                { label: lang==='vi'?'CHAPTER':'CHAPTERS', value: manga.chapters||manga.last_chapter||'?', color:ACCENT },
                { label: lang==='vi'?'VOLUME':'VOLUMES',   value: manga.volumes||manga.last_volume||'?', color:'#FDA4AF' },
                { label: lang==='vi'?'NĂM':'YEAR',         value: manga.year || '?', color:'#94A3B8' },
                { label: lang==='vi'?'THEO DÕI':'FOLLOWS', value: manga.follows ? (manga.follows/1000).toFixed(0)+'k' : '?', color:'#86EFAC' },
              ].map(chip => (
                <div key={chip.label} style={{ textAlign:'center', background:'rgba(244,63,94,0.04)',
                  border:'1px solid rgba(244,63,94,0.08)', borderRadius:12, padding:'8px 14px', minWidth:60 }}>
                  <div style={{ fontSize:16, fontWeight:800, color:chip.color, fontFamily:"'Barlow Condensed',sans-serif" }}>{chip.value}</div>
                  <div style={{ fontSize:9, color:'#3a1020', fontWeight:600, letterSpacing:0.8, textTransform:'uppercase', fontFamily:"'Be Vietnam Pro',sans-serif", marginTop:2 }}>{chip.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {desc && (() => {
              const isLong = desc.length > LIMIT
              const shown = (!isLong || descExpanded) ? desc : desc.slice(0, LIMIT) + '…'
              return (
                <div style={{ maxWidth:600, marginBottom:20 }}>
                  <p style={{ fontSize:13, color:'#8a4050', lineHeight:1.8, fontFamily:"'Be Vietnam Pro',sans-serif", margin:0 }}>{shown}</p>
                  {isLong && (
                    <button onClick={()=>setDescExpanded(x=>!x)} style={{ background:'none', border:'none', cursor:'pointer', color:ACCENT, fontSize:12, fontWeight:600, padding:'8px 0 0', display:'block', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                      {descExpanded ? (lang==='vi'?'▲ Thu gọn':'▲ Show less') : (lang==='vi'?'▼ Xem thêm':'▼ Read more')}
                    </button>
                  )}
                </div>
              )
            })()}

            {/* Action buttons */}
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
              <MangaSaveButton mangaId={manga.id} title={title} coverUrl={cover} />
              <a href={mdUrl} target="_blank" rel="noreferrer" style={{ fontSize:12, fontWeight:600, padding:'8px 14px', borderRadius:10,
                background:`${ACCENT}18`, border:`1px solid ${ACCENT}40`, color:'#FDA4AF', textDecoration:'none', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                MangaDex ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Below hero ── */}
      {isMobile ? (
        <div style={{ padding:'0 0 48px' }}>
          <div style={{ display:'flex', gap:8, padding:'16px 16px 0', overflowX:'auto' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button key={tab.key} onClick={()=>toggleTab(tab.key)} style={{ flexShrink:0, display:'flex', alignItems:'center', gap:6,
                  padding:'7px 14px', borderRadius:20, background: isActive ? ACCENT : 'rgba(255,248,240,0.07)',
                  border:'none', cursor:'pointer', color: isActive ? '#fff' : '#a08060',
                  fontSize:12, fontWeight: isActive ? 700 : 500, fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                  <span>{tab.icon}</span><span>{lang==='vi'?tab.vi:tab.en}</span>
                  {tab.badge > 0 && <span style={{ background:'rgba(0,0,0,0.25)', borderRadius:10, padding:'0 5px', fontSize:10 }}>{tab.badge}</span>}
                </button>
              )
            })}
          </div>
          {activeTab && (
            <div style={{ padding:'20px 16px 4px' }}>
              <TabContent activeTab={activeTab} lang={lang} manga={manga} related={related} />
            </div>
          )}
          <div style={{ padding:'24px 0 0' }}>
            {recs.length > 0 && (
              <SectionCarousel title={lang==='vi'?'Có thể bạn thích':'You May Also Like'}>
                {recs.map(r => <MiniCard key={r.id} item={{ cover_url: r.cover_url, title: r.title_en||r.title_ja_ro, rating: r.rating }} url={mangaUrl({ id: r.id, title_en: r.title_en, title_ja_ro: r.title_ja_ro })} />)}
              </SectionCarousel>
            )}
          </div>
        </div>
      ) : (
        <div>
          {activeTab && (
            <div style={{ borderBottom:'1px solid rgba(255,248,240,0.08)', background:'rgba(255,248,240,0.02)' }}>
              <div style={{ display:'flex' }}>
                <div style={{ width:196, flexShrink:0 }} />
                <div style={{ flex:1, padding:'24px 32px 28px', minWidth:0 }}>
                  <TabContent activeTab={activeTab} lang={lang} manga={manga} related={related} />
                </div>
              </div>
            </div>
          )}
          <div style={{ display:'flex', alignItems:'flex-start' }}>
            <aside style={{ width:196, flexShrink:0, position:'sticky', top:56, alignSelf:'flex-start',
              borderRight:'1px solid rgba(255,248,240,0.08)', background:'#0f0b09', zIndex:10, paddingTop:24 }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key
                return (
                  <button key={tab.key} onClick={()=>toggleTab(tab.key)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10,
                    padding:'10px 14px', background: isActive ? `${ACCENT}18` : 'none', border:'none',
                    borderRight: isActive ? `3px solid ${ACCENT}` : '3px solid transparent',
                    borderRadius:'8px 0 0 8px', cursor:'pointer', transition:'all 0.15s', marginBottom:2, textAlign:'left' }}
                    onMouseEnter={e=>!isActive&&(e.currentTarget.style.background='rgba(255,248,240,0.04)')}
                    onMouseLeave={e=>!isActive&&(e.currentTarget.style.background='none')}>
                    <span style={{ fontSize:14, flexShrink:0 }}>{tab.icon}</span>
                    <span style={{ flex:1, fontSize:13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#FDA4AF' : '#a08060', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                      {lang==='vi'?tab.vi:tab.en}
                    </span>
                    {tab.badge > 0 && (
                      <span style={{ background: isActive ? ACCENT : 'rgba(255,248,240,0.1)',
                        color: isActive ? '#fff' : '#a08060', fontSize:10, fontWeight:700,
                        padding:'1px 6px', borderRadius:10, fontFamily:"'Barlow Condensed',sans-serif" }}>{tab.badge}</span>
                    )}
                  </button>
                )
              })}
            </aside>
            <div style={{ flex:1, minWidth:0, overflow:'hidden', padding:'32px 16px 48px' }}>
              {recs.length > 0 && (
                <SectionCarousel title={lang==='vi'?'Có thể bạn thích':'You May Also Like'}>
                  {recs.map(r => <MiniCard key={r.id} item={{ cover_url: r.cover_url, title: r.title_en||r.title_ja_ro, rating: r.rating }} url={mangaUrl({ id: r.id, title_en: r.title_en, title_ja_ro: r.title_ja_ro })} />)}
                </SectionCarousel>
              )}
              {recs.length === 0 && (
                <Placeholder icon="📚" text={lang==='vi'?'Đang tải gợi ý...':'Loading recommendations…'} />
              )}
            </div>
          </div>
        </div>
      )}

      <PageFooter color={ACCENT} src="MangaDex" />
    </div>
  )
}
