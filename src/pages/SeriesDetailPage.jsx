import React, { useRef, useState } from 'react'
import { PURPLE, novelStatusColor } from '../constants.js'
import { useLang } from '../context/LangContext.jsx'
import { useSeriesById, useSeriesVolumes, useSeriesLinks, useRelatedSeries, useSeriesNuData, seriesUrl } from '../hooks.js'
import { AppHeader, PageFooter, ErrorBox } from '../components/Shared.jsx'
import { QuickAddButton } from '../components/QuickAddButton.jsx'

const LINK_STYLES = {
  shop:     { color: '#F59E0B', label: 'Shop'        },
  buy:      { color: '#F59E0B', label: 'Mua sách'    },
  read:     { color: '#06B6D4', label: 'Đọc online'  },
  watch:    { color: '#06B6D4', label: 'Xem anime'   },
  trailer:  { color: '#EF4444', label: 'Trailer'     },
  official: { color: '#8B5CF6', label: 'Official'    },
  raw:      { color: '#64748B', label: 'Raws'        },
  anilist:  { color: '#02A9FF', label: 'AniList'     },
  mal:      { color: '#2E51A2', label: 'MyAnimeList' },
}

// ── Mini card for carousels ───────────────────────────────────────
function MiniCard({ series, accent }) {
  return (
    <div onClick={() => { window.location.hash = seriesUrl(series) }}
      style={{
        width: 130, flexShrink: 0, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
      <div style={{
        width: 130, height: 195, borderRadius: 12, overflow: 'hidden',
        background: '#0f172a', position: 'relative',
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
            fontSize: 9, fontWeight: 700, color: '#94A3B8',
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
      width: 130, flexShrink: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        width: 130, height: 195, borderRadius: 12, overflow: 'hidden',
        background: '#0f172a', position: 'relative',
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
        <div style={{ fontSize: 10, color: '#64748B', fontFamily: "'Be Vietnam Pro', sans-serif",
          textAlign: 'center' }}>
          {new Date(vol.release_date).toLocaleDateString('vi-VN', { month:'short', year:'numeric' })}
        </div>
      )}
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
            <span style={{ fontSize: 12, color: '#4B5563', fontWeight: 500,
              marginLeft: 10, textTransform: 'none' }}>({count})</span>
          )}
        </h2>
        <div style={{ display:'flex', gap: 6 }}>
          {['←','→'].map((a, i) => (
            <button key={a} onClick={() => scroll(i===0?-1:1)} style={{
              width: 28, height: 28, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: '#64748B',
              cursor: 'pointer', fontSize: 13, display:'flex',
              alignItems:'center', justifyContent:'center',
            }}>{a}</button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{
        display: 'flex', gap: 16, overflowX: 'auto',
        paddingBottom: 8, scrollbarWidth: 'none',
      }}>
        {children}
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────
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
  const goBack = () => window.history.back()

  if (loading) return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput="" onSearch={() => {}}
        sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />
      <div style={{ textAlign:'center', padding: '80px 20px', color: '#4B5563',
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
        background: 'linear-gradient(160deg,#0f0c29,#080d1a,#0a0a0f)',
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

        <div style={{ position:'relative', zIndex:2, maxWidth: 1100,
          margin: '0 auto', padding: '32px 24px 40px', display:'flex', gap: 36, alignItems:'flex-start' }}>

          {/* Back button */}
          <button onClick={goBack} style={{
            position:'absolute', top: 0, left: 24,
            background:'none', border:'none', color:'#4B5563', cursor:'pointer',
            fontSize: 12, fontWeight: 600, fontFamily:"'Be Vietnam Pro',sans-serif",
            display:'flex', alignItems:'center', gap: 4, padding: '4px 0',
          }}>← {lang === 'vi' ? 'Quay lại' : 'Back'}</button>

          {/* Cover */}
          <div style={{ flexShrink: 0, marginTop: 20 }}>
            <div style={{
              width: 220, borderRadius: 16, overflow: 'hidden',
              boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)`,
              aspectRatio: '2/3', background: '#0f172a',
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
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16,
                fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                {lang === 'vi' ? 'Tác giả: ' : 'Author: '}
                <span style={{ color: '#C4B5FD', fontWeight: 600 }}>{series.author}</span>
              </div>
            )}

            {/* Stats chips */}
            <div style={{ display:'flex', gap: 16, marginBottom: 20, flexWrap:'wrap' }}>
              {/* Volume count chip */}
              <div style={{
                textAlign:'center', background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                padding: '8px 16px', minWidth: 70,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#C4B5FD',
                  fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {loadingVols ? '…' : (volCount ?? '?')}
                </div>
                <div style={{ fontSize: 10, color: '#4B5563', fontWeight: 600, letterSpacing: 0.8,
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
                  textAlign:'center', background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                  padding: '8px 16px', minWidth: 70,
                  cursor: series.publisher ? 'pointer' : 'default',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { if (series.publisher) { e.currentTarget.style.background='rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.35)' }}}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)' }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: '#C4B5FD',
                  fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {series.publisher || '—'}
                </div>
                <div style={{ fontSize: 10, color: '#4B5563', fontWeight: 600, letterSpacing: 0.8,
                  textTransform:'uppercase', fontFamily:"'Be Vietnam Pro',sans-serif" }}>
                  NPH
                </div>
              </div>

              {/* NU Score chip */}
              <div style={{
                textAlign:'center', background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                padding: '8px 16px', minWidth: 70,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FBBF24',
                  fontFamily:"'Barlow Condensed',sans-serif" }}>
                  {series.score != null
                    ? `★ ${Number(series.score).toFixed(1)}`
                    : nuData?.nu_rating ? `★ ${nuData.nu_rating}` : 'N/A'}
                </div>
                <div style={{ fontSize: 10, color: '#4B5563', fontWeight: 600, letterSpacing: 0.8,
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
                    fontSize: 13, color: '#94A3B8', lineHeight: 1.8,
                    fontFamily:"'Be Vietnam Pro',sans-serif", margin: 0,
                    whiteSpace: 'pre-line',
                  }}>{shown}</p>
                  {isLong && (
                    <button onClick={() => setDescExpanded(x => !x)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#8B5CF6', fontSize: 12, fontWeight: 600, padding: '6px 0 0',
                      fontFamily:"'Be Vietnam Pro',sans-serif",
                    }}>
                      {descExpanded
                        ? (lang === 'vi' ? '▲ Thu gọn' : '▲ Show less')
                        : (lang === 'vi' ? '▼ Xem thêm' : '▼ Read more')}
                    </button>
                  )}
                </div>
              )
            })()}

            {/* Actions row */}
            <div style={{ display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center' }}>
              <QuickAddButton itemId={series.id} itemType="novel" title={title} coverUrl={cover} />

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
                const cfg = LINK_STYLES[lnk.link_type] || { color:'#64748B', label: lnk.label || lnk.link_type }
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
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Volumes carousel */}
        <SectionCarousel
          title={lang === 'vi' ? 'Danh sách tập' : 'Volumes'}
          count={volumes.length}>
          {loadingVols
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ width:130, height:195, borderRadius:12, flexShrink:0,
                  background:'linear-gradient(90deg,#1f2937 25%,#374151 50%,#1f2937 75%)',
                  backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
              ))
            : volumes.map(v => (
                <VolumeCard key={v.id} vol={v} seriesId={series.id} accent={PURPLE} />
              ))
          }
        </SectionCarousel>

        {/* Related series */}
        {related.length > 0 && (
          <SectionCarousel title={lang === 'vi' ? 'Series liên quan' : 'Related Series'}>
            {related.map(s => <MiniCard key={s.id} series={s} accent={PURPLE} />)}
          </SectionCarousel>
        )}

        {/* Recommendations */}
        {recs.length > 0 && (
          <SectionCarousel title={lang === 'vi' ? 'Có thể bạn thích' : 'You May Also Like'}>
            {recs.map(s => <MiniCard key={s.id} series={s} accent={PURPLE} />)}
          </SectionCarousel>
        )}

      </main>

      <PageFooter color={PURPLE} src="NovelTrend" />
    </div>
  )
}
