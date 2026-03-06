import React, { useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON } from '../supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { AppHeader } from '../components/Shared.jsx'
import { useToast } from '../context/ToastContext.jsx'

const PURPLE = '#8B5CF6'
const CYAN   = '#06B6D4'
const ROSE   = '#F43F5E'
const GOLD   = '#F59E0B'
const GREEN  = '#4ADE80'

const api = async (token, path, method = 'GET', body = null) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : undefined,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204 || method === 'DELETE') return null
  const text = await res.text()
  if (!res.ok) throw new Error(text || `${res.status}`)
  return text ? JSON.parse(text) : null
}

// ── Tabs ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'series',        icon: '📚', label: 'Series Manager' },
  { id: 'links',         icon: '🔗', label: 'Series Links'   },
  { id: 'featured',      icon: '⭐', label: 'Featured'       },
  { id: 'announcements', icon: '📢', label: 'Announcements'  },
  { id: 'votes',         icon: '🗳️', label: 'Vote Manager'   },
  { id: 'users',         icon: '👥', label: 'Users'          },
]

// ── Shared input styles ───────────────────────────────────────────
const inp = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#f1f5f9', borderRadius: 8, padding: '8px 12px',
  fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 13, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
const btn = (color = PURPLE, outline = false) => ({
  background: outline ? 'transparent' : `${color}20`,
  border: `1px solid ${color}${outline ? '60' : '40'}`,
  color, borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
  fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, fontWeight: 700,
  transition: 'all 0.15s', whiteSpace: 'nowrap',
})

// ── Section wrapper ───────────────────────────────────────────────
function Section({ title, children, action }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14, fontWeight: 700, letterSpacing: 1, color: '#94A3B8',
          textTransform: 'uppercase' }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab: Series Manager — add/edit/delete anime, manga, novels
// ═══════════════════════════════════════════════════════════

const ANIME_STATUSES  = ['FINISHED','RELEASING','NOT_YET_RELEASED','CANCELLED','HIATUS']
const ANIME_FORMATS   = ['TV','TV_SHORT','MOVIE','SPECIAL','OVA','ONA','MUSIC','MANGA','NOVEL','ONE_SHOT']
const ANIME_SEASONS   = ['WINTER','SPRING','SUMMER','FALL']
const MANGA_STATUSES  = ['ongoing','completed','hiatus','cancelled']
const NOVEL_STATUSES  = ['publishing','finished','hiatus','cancelled']

const TAG_COLOR = { novel: PURPLE, anime: CYAN, manga: ROSE }

// Shared tag input for genres/themes arrays
function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('')
  const tags = Array.isArray(value) ? value : []
  const add = () => {
    const v = input.trim()
    if (v && !tags.includes(v)) { onChange([...tags, v]); setInput('') }
  }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {tags.map(t => (
          <span key={t} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20,
            padding: '2px 10px', fontSize: 11, color: '#94A3B8', display: 'flex',
            alignItems: 'center', gap: 4 }}>
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))}
              style={{ background: 'none', border: 'none', color: '#64748B',
                cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder || 'Add tag…'} style={{ ...inp, flex: 1 }} />
        <button style={btn(PURPLE)} onClick={add}>Add</button>
      </div>
    </div>
  )
}

function SeriesTab({ token, toast }) {
  const [seriesType, setSeriesType] = useState('anime')
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [editing,    setEditing]    = useState(null)   // null | 'new' | row
  const [form,       setForm]       = useState({})
  const [delConfirm, setDelConfirm] = useState(null)

  const F = (k, v) => setForm(p => ({...p, [k]: v}))

  const load = useCallback(async (q = '') => {
    setLoading(true)
    try {
      let url = ''
      const enc = encodeURIComponent(q)
      if (seriesType === 'anime') {
        url = q
          ? `anime?or=(title_english.ilike.%25${enc}%25,title_romaji.ilike.%25${enc}%25)&order=popularity.desc&limit=30`
          : `anime?order=popularity.desc&limit=30`
      } else if (seriesType === 'manga') {
        url = q
          ? `manga?or=(title_en.ilike.%25${enc}%25,title_ja_ro.ilike.%25${enc}%25)&order=follows.desc&limit=30`
          : `manga?order=follows.desc&limit=30`
      } else {
        url = q
          ? `novels?or=(title.ilike.%25${enc}%25,romaji.ilike.%25${enc}%25)&order=score.desc&limit=30`
          : `novels?order=score.desc&limit=30`
      }
      const data = await api(token, url)
      setItems(Array.isArray(data) ? data : [])
    } catch(e) { toast(`Load failed: ${e.message}`, false) }
    finally { setLoading(false) }
  }, [token, seriesType])

  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search, seriesType, load])

  const openNew = () => {
    if (seriesType === 'anime') {
      setForm({ id: '', title_english: '', title_romaji: '', title_native: '',
        cover_large: '', banner_image: '', description: '', genres: [],
        status: 'FINISHED', format: 'TV', episodes: '', duration: '',
        season: '', season_year: '', start_date: '', end_date: '',
        average_score: '', studio: '', site_url: '' })
    } else if (seriesType === 'manga') {
      setForm({ id: '', title_en: '', title_ja_ro: '', title_ja: '',
        cover_url: '', description_en: '', status: 'ongoing',
        author: '', year: '', chapters: '', volumes: '',
        last_chapter: '', genres: [], themes: [],
        demographic: '', rating: '' })
    } else {
      setForm({ id: '', title: '', romaji: '', title_orig: '',
        cover_url: '', description: '', publication_status: 'publishing',
        num_books: '', start_date: '', end_date: '',
        genres: [], score: '' })
    }
    setEditing('new')
  }

  const openEdit = (row) => {
    setForm({ ...row,
      genres: row.genres || [],
      themes: row.themes || [],
    })
    setEditing(row)
  }

  const getTable = () => seriesType === 'anime' ? 'anime' : seriesType === 'manga' ? 'manga' : 'novels'
  const getId    = () => seriesType === 'anime' ? form.id : seriesType === 'manga' ? form.id : form.id

  const save = async () => {
    try {
      const table = getTable()
      // Cast numeric fields
      const clean = { ...form }
      const numFields = ['id','episodes','duration','season_year','average_score','mean_score',
        'popularity','favourites','year','chapters','volumes','num_books',
        'start_date','end_date','score','score_count','follows']
      numFields.forEach(k => { if (clean[k] === '' || clean[k] === null) clean[k] = null
        else if (clean[k] !== undefined) clean[k] = isNaN(+clean[k]) ? clean[k] : +clean[k] })

      if (editing === 'new') {
        await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify(clean),
        }).then(async r => { if (!r.ok) throw new Error(await r.text()) })
        toast(`${seriesType} added ✓`)
      } else {
        await api(token, `${table}?id=eq.${editing.id}`, 'PATCH', clean)
        toast('Updated ✓')
      }
      setEditing(null); load(search)
    } catch(e) { toast(`Save failed: ${e.message}`, false) }
  }

  const del = async (row) => {
    try {
      await api(token, `${getTable()}?id=eq.${row.id}`, 'DELETE')
      toast('Deleted'); setDelConfirm(null); load(search)
    } catch(e) { toast(e.message, false) }
  }

  const getTitle = (row) => row.title_english || row.title_romaji ||
    row.title_en || row.title_ja_ro || row.title || row.romaji || '(no title)'
  const getCover = (row) => row.cover_large || row.cover_url || ''

  return (
    <div>
      <Section title="Series Manager"
        action={<button style={btn(GREEN)} onClick={openNew}>+ Add {seriesType}</button>}>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['anime','manga','novel'].map(t => (
            <button key={t} onClick={() => { setSeriesType(t); setSearch('') }} style={{
              ...btn(TAG_COLOR[t], seriesType !== t),
              padding: '6px 16px', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${seriesType} by title…`}
          style={{ ...inp, marginBottom: 12 }} />

        {loading ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: 24 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ color: '#374151', textAlign: 'center', padding: 24 }}>No results.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(row => (
              <div key={row.id} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                background: 'rgba(255,255,255,0.02)', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px',
              }}>
                {getCover(row) && (
                  <img src={getCover(row)} style={{ width: 28, height: 40, objectFit: 'cover',
                    borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#f1f5f9',
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getTitle(row)}
                  </div>
                  <div style={{ fontSize: 10, color: '#374151' }}>
                    ID: {row.id}
                    {row.status && <span style={{ marginLeft: 8, color: '#475569' }}>{row.status}</span>}
                    {(row.episodes || row.chapters || row.num_books) &&
                      <span style={{ marginLeft: 8, color: '#475569' }}>
                        {row.episodes ? `${row.episodes} eps` :
                         row.chapters ? `${row.chapters} ch` :
                         `${row.num_books} vols`}
                      </span>}
                  </div>
                </div>
                <button style={btn(CYAN, true)} onClick={() => openEdit(row)}>Edit</button>
                <button style={btn(ROSE, true)} onClick={() => setDelConfirm(row)}>×</button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Delete confirm */}
      {delConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 28,
            maxWidth: 380, width: '100%', border: '1px solid rgba(248,113,113,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18, color: '#f1f5f9', marginBottom: 8 }}>Delete Series?</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
              "{getTitle(delConfirm)}" will be permanently removed.
              It will reappear on the next sync if it's still in the source database.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button style={btn('#64748B', true)} onClick={() => setDelConfirm(null)}>Cancel</button>
              <button style={btn(ROSE)} onClick={() => del(delConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / New modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.1)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                {editing === 'new' ? `Add ${seriesType}` : `Edit: ${getTitle(form)}`}
              </div>
              <button onClick={() => setEditing(null)} style={{ background: 'none',
                border: 'none', color: '#475569', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            {/* ── ANIME FIELDS ── */}
            {seriesType === 'anime' && (<>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { k: 'id',            label: 'AniList ID *',    req: true  },
                  { k: 'title_english', label: 'English Title'               },
                  { k: 'title_romaji',  label: 'Romaji Title'                },
                  { k: 'title_native',  label: 'Native Title'                },
                  { k: 'studio',        label: 'Studio'                      },
                  { k: 'episodes',      label: 'Episodes'                    },
                  { k: 'duration',      label: 'Ep Duration (min)'           },
                  { k: 'average_score', label: 'Score (0–100)'               },
                  { k: 'season_year',   label: 'Year'                        },
                  { k: 'start_date',    label: 'Start Date (YYYY-MM-DD)'     },
                  { k: 'end_date',      label: 'End Date (YYYY-MM-DD)'       },
                  { k: 'site_url',      label: 'AniList URL'                 },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 10, color: f.req ? GREEN : '#64748B', fontWeight: 700 }}>{f.label}</label>
                    <input value={form[f.k] || ''} onChange={e => F(f.k, e.target.value)}
                      style={{ ...inp, marginTop: 3 }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Status</label>
                  <select value={form.status || ''} onChange={e => F('status', e.target.value)}
                    style={{ ...inp, marginTop: 3 }}>
                    {ANIME_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Format</label>
                  <select value={form.format || ''} onChange={e => F('format', e.target.value)}
                    style={{ ...inp, marginTop: 3 }}>
                    {ANIME_FORMATS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Season</label>
                  <select value={form.season || ''} onChange={e => F('season', e.target.value)}
                    style={{ ...inp, marginTop: 3 }}>
                    <option value="">—</option>
                    {ANIME_SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Cover URL</label>
                <input value={form.cover_large || ''} onChange={e => F('cover_large', e.target.value)}
                  style={{ ...inp, marginTop: 3 }} placeholder="https://…" />
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Description</label>
                <textarea value={form.description || ''} onChange={e => F('description', e.target.value)}
                  rows={3} style={{ ...inp, marginTop: 3, resize: 'vertical' }} />
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>Genres</label>
                <TagInput value={form.genres} onChange={v => F('genres', v)} placeholder="e.g. Action" />
              </div>
            </>)}

            {/* ── MANGA FIELDS ── */}
            {seriesType === 'manga' && (<>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { k: 'id',          label: 'MangaDex UUID *', req: true },
                  { k: 'title_en',    label: 'English Title'              },
                  { k: 'title_ja_ro', label: 'Romaji Title'               },
                  { k: 'title_ja',    label: 'Japanese Title'             },
                  { k: 'author',      label: 'Author'                     },
                  { k: 'year',        label: 'Year'                       },
                  { k: 'chapters',    label: 'Chapters'                   },
                  { k: 'volumes',     label: 'Volumes'                    },
                  { k: 'last_chapter',label: 'Latest Chapter'             },
                  { k: 'rating',      label: 'Rating (0–10)'              },
                  { k: 'follows',     label: 'Follows'                    },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 10, color: f.req ? GREEN : '#64748B', fontWeight: 700 }}>{f.label}</label>
                    <input value={form[f.k] || ''} onChange={e => F(f.k, e.target.value)}
                      style={{ ...inp, marginTop: 3 }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Status</label>
                  <select value={form.status || ''} onChange={e => F('status', e.target.value)}
                    style={{ ...inp, marginTop: 3 }}>
                    {MANGA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Demographic</label>
                  <select value={form.demographic || ''} onChange={e => F('demographic', e.target.value)}
                    style={{ ...inp, marginTop: 3 }}>
                    {['','shounen','shoujo','seinen','josei'].map(s => <option key={s} value={s}>{s || '—'}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Cover URL</label>
                <input value={form.cover_url || ''} onChange={e => F('cover_url', e.target.value)}
                  style={{ ...inp, marginTop: 3 }} placeholder="https://…" />
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Description</label>
                <textarea value={form.description_en || ''} onChange={e => F('description_en', e.target.value)}
                  rows={3} style={{ ...inp, marginTop: 3, resize: 'vertical' }} />
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>Genres</label>
                <TagInput value={form.genres} onChange={v => F('genres', v)} placeholder="e.g. Action" />
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>Themes</label>
                <TagInput value={form.themes} onChange={v => F('themes', v)} placeholder="e.g. Isekai" />
              </div>
            </>)}

            {/* ── NOVEL FIELDS ── */}
            {seriesType === 'novel' && (<>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { k: 'id',         label: 'RanobeDB ID *', req: true },
                  { k: 'title',      label: 'Title'                    },
                  { k: 'romaji',     label: 'Romaji Title'             },
                  { k: 'title_orig', label: 'Original Title'           },
                  { k: 'num_books',  label: 'Volumes'                  },
                  { k: 'start_date', label: 'Start Year'               },
                  { k: 'end_date',   label: 'End Year'                 },
                  { k: 'score',      label: 'Score (0–10)'             },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 10, color: f.req ? GREEN : '#64748B', fontWeight: 700 }}>{f.label}</label>
                    <input value={form[f.k] || ''} onChange={e => F(f.k, e.target.value)}
                      style={{ ...inp, marginTop: 3 }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Publication Status</label>
                <select value={form.publication_status || ''} onChange={e => F('publication_status', e.target.value)}
                  style={{ ...inp, marginTop: 3 }}>
                  {NOVEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Cover URL</label>
                <input value={form.cover_url || ''} onChange={e => F('cover_url', e.target.value)}
                  style={{ ...inp, marginTop: 3 }} placeholder="https://…" />
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Description</label>
                <textarea value={form.description || ''} onChange={e => F('description', e.target.value)}
                  rows={3} style={{ ...inp, marginTop: 3, resize: 'vertical' }} />
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700, display: 'block', marginBottom: 4 }}>Genres</label>
                <TagInput value={form.genres} onChange={v => F('genres', v)} placeholder="e.g. Fantasy" />
              </div>
            </>)}

            {/* Cover preview */}
            {(form.cover_large || form.cover_url) && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={form.cover_large || form.cover_url}
                  style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 6 }}
                  onError={e => e.target.style.display='none'} />
                <span style={{ fontSize: 11, color: '#475569' }}>Cover preview</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button style={btn('#64748B', true)} onClick={() => setEditing(null)}>Cancel</button>
              <button style={btn(GREEN)} onClick={save}>
                {editing === 'new' ? `Add ${seriesType}` : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Series search picker — searches novels/anime/manga live
// ═══════════════════════════════════════════════════════════
async function searchSeries(token, type, q) {
  // Direct fetch — bypasses api() error throwing
  const get = async (url) => {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${url}`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }
    })
    const text = await r.text()
    try { return JSON.parse(text) } catch { return [] }
  }
  const enc = encodeURIComponent(q)
  if (type === 'novel') {
    const [r1, r2] = await Promise.all([
      get(`novels?title=ilike.%25${enc}%25&select=id,title,romaji,cover_url&limit=6`),
      get(`novels?romaji=ilike.%25${enc}%25&select=id,title,romaji,cover_url&limit=6`),
    ])
    const seen = new Set()
    return [...(r1||[]),...(r2||[])].filter(r => { if(seen.has(r.id)) return false; seen.add(r.id); return true })
      .slice(0,8).map(r => ({ id: String(r.id), title: r.title || r.romaji, cover: r.cover_url, type: 'novel' }))
  } else if (type === 'anime') {
    const [r1, r2] = await Promise.all([
      get(`anime?title_english=ilike.%25${enc}%25&select=id,title_english,title_romaji,cover_large&limit=6`),
      get(`anime?title_romaji=ilike.%25${enc}%25&select=id,title_english,title_romaji,cover_large&limit=6`),
    ])
    const seen = new Set()
    return [...(r1||[]),...(r2||[])].filter(r => { if(seen.has(r.id)) return false; seen.add(r.id); return true })
      .slice(0,8).map(r => ({ id: String(r.id), title: r.title_english || r.title_romaji, cover: r.cover_large, type: 'anime' }))
  } else {
    const [r1, r2] = await Promise.all([
      get(`manga?title_en=ilike.%25${enc}%25&select=id,title_en,title_ja_ro,cover_url&limit=6`),
      get(`manga?title_ja_ro=ilike.%25${enc}%25&select=id,title_en,title_ja_ro,cover_url&limit=6`),
    ])
    const seen = new Set()
    return [...(r1||[]),...(r2||[])].filter(r => { if(seen.has(r.id)) return false; seen.add(r.id); return true })
      .slice(0,8).map(r => ({ id: String(r.id), title: r.title_en || r.title_ja_ro, cover: r.cover_url, type: 'manga' }))
  }
}

function SeriesPicker({ token, onPick }) {
  const [query,   setQuery]   = useState('')
  const [type,    setType]    = useState('novel')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      const data = await searchSeries(token, type, query.trim())
      if (!cancelled) { setResults(data); setLoading(false) }
    }, 300)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query, type, token])

  const TYPE_COLOR = { novel: PURPLE, anime: CYAN, manga: ROSE }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {['novel','anime','manga'].map(t => (
          <button key={t} onClick={() => { setType(t); setResults([]) }} style={{
            ...btn(TYPE_COLOR[t], type !== t),
            padding: '6px 14px', fontSize: 11, textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>
      <input value={query} onChange={e => setQuery(e.target.value)}
        placeholder={`Search ${type} by title…`} style={inp} autoFocus />
      {loading && <div style={{ color: '#475569', fontSize: 12, padding: '8px 0' }}>Searching…</div>}
      {results.length > 0 && (
        <div style={{ marginTop: 6, border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
          {results.map(r => (
            <div key={r.id} onClick={() => onPick(r)}
              style={{ display: 'flex', gap: 10, alignItems: 'center',
                padding: '8px 12px', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              {r.cover && <img src={r.cover} style={{ width: 28, height: 38, objectFit: 'cover',
                borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display='none'} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#f1f5f9', fontFamily: "'Barlow Condensed', sans-serif",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                <div style={{ fontSize: 10, color: '#475569' }}>ID: {r.id}</div>
              </div>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                background: `${TYPE_COLOR[r.type]}20`, color: TYPE_COLOR[r.type],
                textTransform: 'uppercase' }}>{r.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab: Series Links
// ═══════════════════════════════════════════════════════════
function LinksTab({ token, toast }) {
  const [links,     setLinks]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState({})
  const [listSearch,setListSearch]= useState('')
  const [showPicker,setShowPicker]= useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api(token, 'item_links?order=updated_at.desc&limit=200')
      setLinks(Array.isArray(data) ? data : [])
    } catch(e) { toast(e.message, false) }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  const openNew = () => { setShowPicker(true) }

  const pickSeries = (series) => {
    // series = { id, title, cover, type } from SeriesPicker
    setShowPicker(false)
    setForm({ item_id: series.id, item_type: series.type, title: series.title,
      cover_url: series.cover || '', shop: '', youtube: '', official: '', raw: '', anilist: '', mangadex: '' })
    setEditing('new')
  }

  const openEdit = async (row) => {
    setForm({ ...row })
    setEditing(row)
  }

  const save = async () => {
    try {
      // Only send columns that exist in item_links table
      const COLS = ['item_id','item_type','title','shop','youtube','official','raw','anilist','mangadex']
      const clean = Object.fromEntries(
        COLS.map(k => [k, form[k] === '' ? null : (form[k] || null)])
      )
      console.log('[Admin] saving:', clean)
      if (editing === 'new') {
        // Upsert — if item_id+item_type already exists, update it instead
        await fetch(`${SUPABASE_URL}/rest/v1/item_links`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON, Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(clean),
        }).then(async r => { if (!r.ok) throw new Error(await r.text()) })
        toast('Links saved ✓')
      } else {
        await api(token, `item_links?id=eq.${editing.id}`, 'PATCH', clean)
        toast('Links updated ✓')
      }
      setEditing(null); load()
    } catch(e) {
      console.error('[Admin] save error:', e)
      toast(`Save failed: ${e.message}`, false)
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this link entry?')) return
    await api(token, `item_links?id=eq.${id}`, 'DELETE')
    toast('Deleted'); load()
  }

  const filtered = links.filter(l =>
    !listSearch || l.title?.toLowerCase().includes(listSearch.toLowerCase()) ||
    l.item_id?.includes(listSearch)
  )

  const LINK_FIELDS = [
    { key: 'shop',     label: '🛒 Shop',     color: GOLD       },
    { key: 'youtube',  label: '▶ YouTube',  color: '#EF4444'  },
    { key: 'official', label: '🔗 Official', color: CYAN       },
    { key: 'raw',      label: '📄 Raw',      color: '#94A3B8'  },
    { key: 'anilist',  label: '📊 AniList',  color: '#02a9ff'  },
    { key: 'mangadex', label: '📖 MangaDex', color: ROSE       },
  ]

  const TYPE_COLOR = { novel: PURPLE, anime: CYAN, manga: ROSE }

  return (
    <div>
      <Section title="Series Link Manager"
        action={<button style={btn(GREEN)} onClick={openNew}>+ Add Links</button>}>

        {/* Filter existing entries */}
        <input value={listSearch} onChange={e => setListSearch(e.target.value)}
          placeholder="Filter saved entries by title or ID…" style={{ ...inp, marginBottom: 14 }} />

        {loading ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: 32 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>
            {listSearch ? 'No matching entries.' : 'No entries yet. Click "+ Add Links" to attach links to a series.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(row => (
              <div key={row.id} style={{
                display: 'flex', gap: 12, alignItems: 'center',
                background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px',
              }}>
                {row.cover_url && (
                  <img src={row.cover_url} style={{ width: 28, height: 38, objectFit: 'cover',
                    borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20,
                    background: `${TYPE_COLOR[row.item_type] || PURPLE}20`,
                    color: TYPE_COLOR[row.item_type] || PURPLE,
                    fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'inline-block' }}>
                    {row.item_type}
                  </div>
                  <div style={{ fontSize: 10, color: '#374151', marginTop: 2 }}>ID: {row.item_id}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.title || '(no title)'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {LINK_FIELDS.filter(f => row[f.key]).map(f => (
                      <span key={f.key} style={{ fontSize: 9, color: f.color,
                        background: `${f.color}15`, border: `1px solid ${f.color}30`,
                        borderRadius: 4, padding: '1px 6px', fontWeight: 700 }}>{f.label}</span>
                    ))}
                  </div>
                </div>
                <button style={btn(CYAN, true)} onClick={() => openEdit(row)}>Edit</button>
                <button style={btn(ROSE, true)} onClick={() => del(row.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Series picker modal */}
      {showPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setShowPicker(false)}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 500, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
              Search & Select a Series
            </div>
            <SeriesPicker token={token} onPick={pickSeries} />
            <button style={{ ...btn('#64748B', true), marginTop: 14, width: '100%' }}
              onClick={() => setShowPicker(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit / New modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 9001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* Selected series header */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20,
              background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
              {form.cover_url && (
                <img src={form.cover_url} style={{ width: 36, height: 50, objectFit: 'cover',
                  borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
              )}
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{form.title}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>
                  {form.item_type} · ID: {form.item_id}
                </div>
              </div>
            </div>

            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15, fontWeight: 700, color: '#94A3B8', letterSpacing: 1,
              textTransform: 'uppercase', marginBottom: 14 }}>Link URLs</div>

            {LINK_FIELDS.map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: f.color }}>{f.label} URL</label>
                <input value={form[f.key] || ''} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  placeholder="https://…" style={{ ...inp, marginTop: 4 }} />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button style={btn('#64748B', true)} onClick={() => setEditing(null)}>Cancel</button>
              <button style={btn(GREEN)} onClick={save}>
                {editing === 'new' ? 'Save Links' : 'Update Links'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab: Featured Items
// ═══════════════════════════════════════════════════════════
function FeaturedTab({ token, toast }) {
  const [items,   setItems]   = useState([])
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})

  const load = useCallback(async () => {
    const data = await api(token, 'featured_items?order=sort_order.asc')
    setItems(Array.isArray(data) ? data : [])
  }, [token])

  useEffect(() => { load() }, [load])

  const [showPicker, setShowPicker] = useState(false)

  const openNew = () => { setShowPicker(true) }

  const pickSeries = (series) => {
    setShowPicker(false)
    setForm({ item_id: series.id, item_type: series.type, title: series.title,
      cover_url: series.cover || '', reason: '', sort_order: items.length, active: true })
    setEditing('new')
  }

  const save = async () => {
    try {
      if (editing === 'new') { await api(token, 'featured_items', 'POST', form); toast('Featured item added ✓') }
      else { await api(token, `featured_items?id=eq.${editing.id}`, 'PATCH', form); toast('Updated ✓') }
      setEditing(null); load()
    } catch(e) { toast(e.message, false) }
  }

  const toggle = async (row) => {
    await api(token, `featured_items?id=eq.${row.id}`, 'PATCH', { active: !row.active })
    load()
  }

  const del = async (id) => {
    if (!confirm('Remove featured item?')) return
    await api(token, `featured_items?id=eq.${id}`, 'DELETE')
    load()
  }

  return (
    <Section title="Featured Series"
      action={<button style={btn(GOLD)} onClick={openNew}>+ Add Featured</button>}>
      {/* Series picker */}
      {showPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setShowPicker(false)}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 500, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
              Search & Select a Series
            </div>
            <SeriesPicker token={token} onPick={pickSeries} />
            <button style={{ ...btn('#64748B', true), marginTop: 14, width: '100%' }}
              onClick={() => setShowPicker(false)}>Cancel</button>
          </div>
        </div>
      )}
      {items.length === 0 ? (
        <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>No featured items.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(row => (
            <div key={row.id} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              background: row.active ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
              borderRadius: 10, border: `1px solid ${row.active ? GOLD+'30' : 'rgba(255,255,255,0.06)'}`,
              padding: '10px 14px', opacity: row.active ? 1 : 0.5,
            }}>
              {row.cover_url && (
                <img src={row.cover_url} style={{ width: 32, height: 44, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600,
                  fontFamily: "'Barlow Condensed', sans-serif" }}>{row.title}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{row.item_type} · {row.reason}</div>
              </div>
              <div style={{ fontSize: 11, color: '#374151' }}>#{row.sort_order}</div>
              <button style={btn(row.active ? GOLD : GREEN, true)} onClick={() => toggle(row)}>
                {row.active ? 'Hide' : 'Show'}
              </button>
              <button style={btn(CYAN, true)} onClick={() => { setForm({...row}); setEditing(row) }}>Edit</button>
              <button style={btn(ROSE, true)} onClick={() => del(row.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 480, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
              {editing === 'new' ? '+ Add Featured Item' : 'Edit Featured Item'}
            </div>
            {/* Series info (read-only, set by picker) */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16,
              background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
              {form.cover_url && <img src={form.cover_url} style={{ width: 32, height: 44,
                objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: 14, color: '#f1f5f9', fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700 }}>{form.title}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{form.item_type} · ID: {form.item_id}</div>
              </div>
            </div>
            {[
              { key: 'reason',    label: 'REASON',     ph: "Editor's Pick, Trending…" },
              { key: 'sort_order',label: 'SORT ORDER', ph: '0 = first' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>{f.label}</label>
                <input value={form[f.key] || ''} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  placeholder={f.ph} style={{ ...inp, marginTop: 4 }} />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input type="checkbox" checked={form.active !== false}
                onChange={e => setForm(p => ({...p, active: e.target.checked}))} id="active_chk" />
              <label htmlFor="active_chk" style={{ fontSize: 13, color: '#94A3B8' }}>Active (visible to users)</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={btn('#64748B', true)} onClick={() => setEditing(null)}>Cancel</button>
              <button style={btn(GOLD)} onClick={save}>{editing === 'new' ? 'Add' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab: Announcements
// ═══════════════════════════════════════════════════════════
function AnnouncementsTab({ token, toast }) {
  const [items,   setItems]   = useState([])
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})

  const load = useCallback(async () => {
    const data = await api(token, 'site_announcements?order=created_at.desc')
    setItems(Array.isArray(data) ? data : [])
  }, [token])

  useEffect(() => { load() }, [load])

  const TYPE_COLOR = { info: CYAN, warning: GOLD, success: GREEN }

  const save = async () => {
    try {
      if (editing === 'new') { await api(token, 'site_announcements', 'POST', form); toast('Announcement created ✓') }
      else { await api(token, `site_announcements?id=eq.${editing.id}`, 'PATCH', form); toast('Updated ✓') }
      setEditing(null); load()
    } catch(e) { toast(e.message, false) }
  }

  const toggle = async (row) => {
    await api(token, `site_announcements?id=eq.${row.id}`, 'PATCH', { active: !row.active })
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete announcement?')) return
    await api(token, `site_announcements?id=eq.${id}`, 'DELETE'); load()
  }

  return (
    <Section title="Site Announcements"
      action={<button style={btn(CYAN)} onClick={() => { setForm({ message_en: '', message_vi: '', type: 'info', active: true }); setEditing('new') }}>
        + New Announcement
      </button>}>
      {items.length === 0 ? (
        <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>No announcements.</div>
      ) : items.map(row => {
        const c = TYPE_COLOR[row.type] || CYAN
        return (
          <div key={row.id} style={{
            background: `${c}08`, border: `1px solid ${c}25`, borderRadius: 10,
            padding: '10px 14px', marginBottom: 8, opacity: row.active ? 1 : 0.4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: c, fontWeight: 700, marginBottom: 4 }}>
                  [{row.type.toUpperCase()}] {row.active ? '● LIVE' : '○ Hidden'}
                </div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>{row.message_en}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{row.message_vi}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button style={btn(row.active ? GOLD : GREEN, true)} onClick={() => toggle(row)}>
                  {row.active ? 'Hide' : 'Show'}
                </button>
                <button style={btn(CYAN, true)} onClick={() => { setForm({...row}); setEditing(row) }}>Edit</button>
                <button style={btn(ROSE, true)} onClick={() => del(row.id)}>×</button>
              </div>
            </div>
          </div>
        )
      })}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#111827', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 500, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
              {editing === 'new' ? '+ New Announcement' : 'Edit Announcement'}
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>TYPE</label>
              <select value={form.type || 'info'} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                style={{ ...inp, marginTop: 4 }}>
                <option value="info">ℹ Info</option>
                <option value="warning">⚠ Warning</option>
                <option value="success">✓ Success</option>
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>MESSAGE (English)</label>
              <textarea value={form.message_en || ''} onChange={e => setForm(p => ({...p, message_en: e.target.value}))}
                placeholder="Enter message in English…" rows={3}
                style={{ ...inp, marginTop: 4, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>MESSAGE (Vietnamese)</label>
              <textarea value={form.message_vi || ''} onChange={e => setForm(p => ({...p, message_vi: e.target.value}))}
                placeholder="Nhập nội dung bằng tiếng Việt…" rows={3}
                style={{ ...inp, marginTop: 4, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input type="checkbox" checked={form.active !== false}
                onChange={e => setForm(p => ({...p, active: e.target.checked}))} id="ann_active" />
              <label htmlFor="ann_active" style={{ fontSize: 13, color: '#94A3B8' }}>Show immediately (active)</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={btn('#64748B', true)} onClick={() => setEditing(null)}>Cancel</button>
              <button style={btn(CYAN)} onClick={save}>{editing === 'new' ? 'Publish' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab: Vote Manager
// ═══════════════════════════════════════════════════════════
function VotesTab({ token, toast }) {
  const [votes,   setVotes]   = useState([])
  const [month,   setMonth]   = useState(new Date().getMonth() + 1)
  const [year,    setYear]    = useState(new Date().getFullYear())

  const load = useCallback(async () => {
    const data = await api(token, `novel_votes?month=eq.${month}&year=eq.${year}&order=vote_count.desc`)
    setVotes(Array.isArray(data) ? data : [])
  }, [token, month, year])

  useEffect(() => { load() }, [load])

  const resetVotes = async (id) => {
    if (!confirm('Reset this series vote count to 0?')) return
    await api(token, `novel_votes?id=eq.${id}`, 'PATCH', { vote_count: 0 })
    toast('Vote count reset'); load()
  }

  const deleteEntry = async (id) => {
    if (!confirm('Delete this vote entry entirely?')) return
    await api(token, `novel_votes?id=eq.${id}`, 'DELETE')
    toast('Entry deleted'); load()
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <Section title="Vote Manager">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={month} onChange={e => setMonth(+e.target.value)} style={{ ...inp, width: 'auto' }}>
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)} style={{ ...inp, width: 'auto' }}>
          {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center' }}>
          {votes.length} entries · {votes.reduce((s,v) => s + v.vote_count, 0)} total votes
        </div>
      </div>

      {votes.length === 0 ? (
        <div style={{ color: '#374151', textAlign: 'center', padding: 32 }}>No votes this month.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {votes.map((row, i) => (
            <div key={row.id} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              background: 'rgba(255,255,255,0.02)', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.05)', padding: '8px 12px',
            }}>
              <span style={{ width: 24, color: '#374151', fontSize: 12, fontWeight: 700 }}>#{i+1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: "'Barlow Condensed', sans-serif",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.novel_title}
                </div>
                <div style={{ fontSize: 10, color: '#374151' }}>ID: {row.novel_id}</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: PURPLE,
                fontFamily: "'Barlow Condensed', sans-serif", minWidth: 32, textAlign: 'right' }}>
                {row.vote_count}
              </div>
              <button style={btn(GOLD, true)} onClick={() => resetVotes(row.id)}>Reset</button>
              <button style={btn(ROSE, true)} onClick={() => deleteEntry(row.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════
// Tab: Users
// ═══════════════════════════════════════════════════════════
function UsersTab({ token, toast, currentUserId }) {
  const [admins,  setAdmins]  = useState([])
  const [newUid,  setNewUid]  = useState('')

  const load = useCallback(async () => {
    const data = await api(token, 'admin_users?select=user_id,granted_at')
    setAdmins(Array.isArray(data) ? data : [])
  }, [token])

  useEffect(() => { load() }, [load])

  const grantAdmin = async () => {
    if (!newUid.trim()) return
    try {
      await api(token, 'admin_users', 'POST', { user_id: newUid.trim(), granted_by: currentUserId })
      toast('Admin granted ✓'); setNewUid(''); load()
    } catch(e) { toast(e.message, false) }
  }

  const revokeAdmin = async (uid) => {
    if (uid === currentUserId) { toast("Can't revoke yourself", false); return }
    if (!confirm('Revoke admin for this user?')) return
    await api(token, `admin_users?user_id=eq.${uid}`, 'DELETE')
    toast('Admin revoked'); load()
  }

  return (
    <Section title="Admin Users">
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={newUid} onChange={e => setNewUid(e.target.value)}
          placeholder="User UUID to grant admin…" style={{ ...inp, flex: 1 }} />
        <button style={btn(GREEN)} onClick={grantAdmin}>Grant Admin</button>
      </div>
      <div style={{ fontSize: 11, color: '#374151', marginBottom: 14 }}>
        Find user UUIDs in Supabase Dashboard → Authentication → Users
      </div>
      {admins.map(row => (
        <div key={row.user_id} style={{
          display: 'flex', gap: 12, alignItems: 'center',
          background: 'rgba(255,255,255,0.02)', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', marginBottom: 6,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{row.user_id}</div>
            <div style={{ fontSize: 10, color: '#374151' }}>Granted: {new Date(row.granted_at).toLocaleDateString()}</div>
          </div>
          {row.user_id === currentUserId && (
            <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>YOU</span>
          )}
          <button style={btn(ROSE, true)} onClick={() => revokeAdmin(row.user_id)}>Revoke</button>
        </div>
      ))}
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════
// Main AdminPage
// ═══════════════════════════════════════════════════════════
export function AdminPage() {
  const { user, token } = useAuth()
  const { lang }        = useLang()
  const { show: showToast } = useToast()
  const [isAdmin, setIsAdmin]   = useState(null)   // null=checking
  const [activeTab, setActiveTab] = useState('series')

  const toast = (msg, ok = true) => showToast(msg, ok)

  useEffect(() => {
    if (!token) { setIsAdmin(false); return }
    fetch(`${SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${user?.id}&select=user_id`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setIsAdmin(Array.isArray(data) && data.length > 0))
      .catch(() => setIsAdmin(false))
  }, [token, user?.id])

  if (isAdmin === null) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#475569',
      fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      Checking permissions…
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 24, color: '#f1f5f9' }}>Login Required</div>
      <a href="#/" style={{ color: PURPLE, textDecoration: 'none', fontSize: 14 }}>← Go home</a>
    </div>
  )

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 48 }}>⛔</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 24, color: '#F87171' }}>Access Denied</div>
      <div style={{ color: '#475569', fontSize: 14 }}>This account does not have admin privileges.</div>
      <a href="#/" style={{ color: PURPLE, textDecoration: 'none', fontSize: 14 }}>← Go home</a>
    </div>
  )

  return (
    <div className="page-enter" style={{ minHeight: '100vh' }}>
      <AppHeader activeTab="#/admin" accent={PURPLE}
        searchInput="" onSearch={() => {}} sorts={[]}
        activeSort="" onSort={() => {}} hideSearch hideSorts />

      {/* Admin header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 100%)',
        borderBottom: '1px solid rgba(139,92,246,0.2)', padding: '28px 24px 0',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `linear-gradient(135deg, ${PURPLE}, #6366F1)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>⚙️</div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 26, fontWeight: 900, color: '#f1f5f9', letterSpacing: 1 }}>
                ADMIN PANEL
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Logged in as {user.email}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: activeTab === tab.id ? `${PURPLE}20` : 'transparent',
                border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${PURPLE}` : '2px solid transparent',
                color: activeTab === tab.id ? PURPLE : '#475569',
                padding: '10px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                fontFamily: "'Be Vietnam Pro', sans-serif", whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {activeTab === 'series'        && <SeriesTab token={token} toast={toast} />}
        {activeTab === 'links'         && <LinksTab token={token} toast={toast} />}
        {activeTab === 'featured'      && <FeaturedTab token={token} toast={toast} />}
        {activeTab === 'announcements' && <AnnouncementsTab token={token} toast={toast} />}
        {activeTab === 'votes'         && <VotesTab token={token} toast={toast} />}
        {activeTab === 'users'         && <UsersTab token={token} toast={toast} currentUserId={user?.id} />}
      </main>
    </div>
  )
}
