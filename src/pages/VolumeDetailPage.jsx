import React, { useState, useEffect } from 'react'
import { PURPLE } from '../constants.js'
import { useLang } from '../context/LangContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useSeriesById, useVolumeDetail, seriesUrl } from '../hooks.js'
import { AppHeader, PageFooter, ErrorBox } from '../components/Shared.jsx'

function useDetailStyles() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return {
    isLight,
    bg: isLight ? '#F1F5F9' : '#0f0b09',
    bgSurface: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,248,240,0.02)',
    border: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,248,240,0.06)',
    textBright: isLight ? '#0F172A' : '#f1f5f9',
    textPrimary: isLight ? '#1E293B' : '#e2e8f0',
    textSecondary: isLight ? '#64748B' : '#94A3B8',
    textMuted: isLight ? '#94A3B8' : '#6b4f35',
  }
}

const LINK_STYLES = {
  shop:     { color: '#F59E0B', label: 'Shop'       },
  buy:      { color: '#F59E0B', label: 'Mua sách'   },
  read:     { color: '#06B6D4', label: 'Đọc online' },
  official: { color: '#8B5CF6', label: 'Official'   },
  raw:      { color: '#7a6045', label: 'Raws'       },
  mal:      { color: '#2E51A2', label: 'MyAnimeList'},
  anilist:  { color: '#02A9FF', label: 'AniList'    },
  trailer:  { color: '#EF4444', label: 'Trailer'    },
}

/* Renders description with smart paragraph + section breaks */
function DescriptionText({ text, s }) {
  if (!text) return null

  // Normalize: convert \n, split on --- dividers and * bullet markers
  const raw = text.replace(/\\n/g, '\n')

  // Split into major sections on --- or * at start of a segment
  const sections = raw
    .split(/\n---+\n?|(?:^|\n)\s*\*\s+/)
    .map(s => s.trim())
    .filter(Boolean)

  return (
    <div style={{ maxWidth: 640 }}>
      {sections.map((section, si) => {
        // Within each section split into paragraphs on newline
        const paras = section.split(/\n+/).map(p => p.trim()).filter(Boolean)
        const isMeta = si > 0  // second section onward = series/product meta info

        return (
          <div key={si} style={{
            marginBottom: si < sections.length - 1 ? 20 : 0,
            paddingTop: isMeta ? 16 : 0,
            borderTop: isMeta ? `1px solid ${s?.border || 'rgba(255,248,240,0.06)'}` : 'none',
          }}>
            {paras.map((p, pi) => (
              <p key={pi} style={{
                fontSize: isMeta ? 12 : 14,
                color: isMeta ? (s?.textSecondary || '#8a7055') : (s?.textPrimary || '#c8a882'),
                lineHeight: isMeta ? 1.65 : 1.9,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                margin: '0 0 10px',
                letterSpacing: 0.15,
                fontStyle: isMeta ? 'italic' : 'normal',
              }}>{p}</p>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* Single stat chip like series page */
function StatChip({ label, value, s }) {
  return (
    <div style={{
      textAlign: 'center', background: s?.bgSurface || 'rgba(255,248,240,0.06)',
      border: `1px solid ${s?.border || 'rgba(255,248,240,0.14)'}`, borderRadius: 12,
      padding: '8px 16px', minWidth: 64,
    }}>
      <div style={{
        fontSize: 15, fontWeight: 800, color: '#C4B5FD',
        fontFamily: "'Barlow Condensed', sans-serif",
        whiteSpace: 'nowrap',
      }}>{value || '—'}</div>
      <div style={{
        fontSize: 10, color: s?.textSecondary || '#a08060', fontWeight: 700,
        letterSpacing: 0.8, textTransform: 'uppercase',
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>{label}</div>
    </div>
  )
}

export function VolumeDetailPage({ seriesId, volumeNumber }) {
  const { lang } = useLang()
  const s = useDetailStyles()
  const { series, loading: loadingS } = useSeriesById(seriesId)
  const { volume, links, loading: loadingV, error } = useVolumeDetail(seriesId, volumeNumber)

  const loading = loadingS || loadingV

  const [descExpanded, setDescExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  const goToSeries = () => {
    if (series) window.location.hash = seriesUrl(series)
    else window.history.back()
  }

  if (loading) return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput="" onSearch={() => {}}
        sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />
      <div style={{ textAlign: 'center', padding: '80px 20px', color: s.textMuted,
        fontFamily: "'Be Vietnam Pro',sans-serif" }}>Đang tải…</div>
    </div>
  )

  if (error || !volume) return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput="" onSearch={() => {}}
        sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />
      <div style={{ padding: 40 }}>
        <ErrorBox msg={error || 'Volume not found'} onRetry={() => window.location.reload()} color={PURPLE} />
      </div>
    </div>
  )

  const cover   = volume.cover_url || series?.cover_url
  const label   = volume.volume_label === 'Standalone' ? 'Tập 1' : (volume.volume_label || `Tập ${volumeNumber}`)
  const desc    = typeof volume.description === 'object'
    ? (volume.description?.vi || volume.description?.en || '')
    : (volume.description || '')
  const relDate = volume.release_date
    ? new Date(volume.release_date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // Detail fields from volume table
  const translator = volume.translator
  const pages      = volume.pages
  const format     = volume.format
  const weight     = volume.weight_g ? `${volume.weight_g}g` : null
  const dimensions = volume.dimensions
  const sku        = volume.sku
  const publisher  = series?.publisher || volume.publisher

  return (
    <div className="page-enter">
      <AppHeader activeTab="#/novels" accent={PURPLE} searchInput="" onSearch={() => {}}
        sorts={[]} activeSort="" onSort={() => {}} hideSearch hideSorts />

      {/* ── Hero — immersive blurred cover backdrop (AniList-style) ── */}
      <div style={{
        position: 'relative', overflow: 'hidden', minHeight: isMobile ? 'auto' : 340,
        background: s.isLight ? '#dde3ed' : '#110d0a',
      }}>
        {/* Layer 1: blurred cover fills entire hero as atmosphere */}
        {cover && (
          <div style={{
            position: 'absolute', inset: '-20px', zIndex: 0,
            backgroundImage: `url(${cover})`,
            backgroundSize: 'cover', backgroundPosition: 'center top',
            filter: s.isLight ? 'blur(18px) saturate(0.8) brightness(0.85)' : 'blur(18px) saturate(1.2) brightness(0.6)',
          }} />
        )}
        {/* Layer 2: gradient to darken edges and ensure readability */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: s.isLight ? 'linear-gradient(to right, rgba(215,222,232,0.95) 0%, rgba(215,222,232,0.55) 50%, rgba(215,222,232,0.85) 100%)' : 'linear-gradient(to right, rgba(8,13,26,0.85) 0%, rgba(8,13,26,0.35) 50%, rgba(8,13,26,0.7) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: s.isLight ? 'linear-gradient(to bottom, rgba(215,222,232,0.5) 0%, transparent 30%, transparent 70%, rgba(215,222,232,1) 100%)' : 'linear-gradient(to bottom, rgba(8,13,26,0.5) 0%, transparent 30%, transparent 70%, rgba(8,13,26,1) 100%)',
        }} />

        {/* Breadcrumb */}
        <div style={{ position: 'absolute', top: 14, left: 24, zIndex: 3,
          display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <button onClick={() => window.location.hash = '#/novels'} style={{
            background: 'none', border: 'none', color: s.isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)', cursor: 'pointer',
            fontSize: 11, fontFamily: "'Be Vietnam Pro',sans-serif", padding: 0,
          }}>Light Novel</button>
          <span style={{ color: s.isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)', fontSize: 11 }}>›</span>
          <button onClick={goToSeries} style={{
            background: 'none', border: 'none', color: s.isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.45)', cursor: 'pointer',
            fontSize: 11, fontFamily: "'Be Vietnam Pro',sans-serif", padding: 0,
            maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{series?.title || '…'}</button>
          <span style={{ color: s.isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)', fontSize: 11 }}>›</span>
          <span style={{ color: s.isLight ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600 }}>{label}</span>
        </div>

        {/* Content: cover card + info, both floating inside the atmospheric bg */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100,
          margin: '0 auto', padding: isMobile ? '48px 16px 28px' : '52px 24px 44px',
          display: 'flex', gap: isMobile ? 16 : 40,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-end' }}>

          {/* Cover card */}
          <div style={{ flexShrink: 0, marginTop: 0 }}>
            <div style={{
              width: isMobile ? 140 : 288, borderRadius: 16, overflow: 'hidden', aspectRatio: '2/3',
              background: '#1a1410',
              boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,248,240,0.07)`,
            }}>
              {cover
                ? <img src={cover} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => e.target.style.display = 'none'} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 52 }}>📖</div>
              }
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, paddingBottom: 4, width: isMobile ? '100%' : undefined, textAlign: isMobile ? 'center' : 'left' }}>

            {/* Series name link */}
            {series && (
              <button onClick={goToSeries} style={{
                background: 'none', border: 'none', color: '#7a6045', cursor: 'pointer',
                fontSize: 12, fontFamily: "'Be Vietnam Pro',sans-serif", padding: 0,
                marginBottom: 8, display: 'block',
              }}>{series.title} ›</button>
            )}

            {/* Volume label chip */}
            <div style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 12px',
              borderRadius: 20, background: `${PURPLE}20`, border: `1px solid ${PURPLE}40`,
              color: '#C4B5FD', marginBottom: 12, fontFamily: "'Be Vietnam Pro',sans-serif",
            }}>{label}</div>

            {/* Volume subtitle */}
            {volume.title && volume.title !== series?.title && (
              <h1 style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontSize: 'clamp(20px,3.5vw,36px)', fontWeight: 900,
                color: '#f1f5f9', margin: '0 0 8px', lineHeight: 1.15, letterSpacing: 0.5,
              }}>{volume.title}</h1>
            )}

            {/* ── Stat chips row (like series page) ── */}
            <div style={{ display: 'flex', gap: isMobile ? 8 : 12, flexWrap: 'wrap', margin: '12px 0 16px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {relDate && <StatChip label={lang === 'vi' ? 'Phát hành' : 'Released'} value={relDate} s={s} />}
              {publisher && <StatChip label="NPH" value={publisher} s={s} />}
              {pages     && <StatChip label={lang === 'vi' ? 'Trang' : 'Pages'} value={pages} s={s} />}
              {format    && <StatChip label={lang === 'vi' ? 'Bìa' : 'Format'} value={format} s={s} />}
              {weight    && <StatChip label={lang === 'vi' ? 'Khối lượng' : 'Weight'} value={weight} s={s} />}
              {dimensions && <StatChip label={lang === 'vi' ? 'Kích thước' : 'Size'} value={dimensions} s={s} />}
              {translator && <StatChip label={lang === 'vi' ? 'Dịch giả' : 'Translator'} value={translator} s={s} />}
            </div>

            {/* Description — collapsible */}
            {desc && (() => {
              const LIMIT = 380
              const isLong = desc.length > LIMIT
              const shown = (!isLong || descExpanded) ? desc : desc.slice(0, LIMIT) + '…'
              return (
                <div style={{ marginBottom: 16 }}>
                  <DescriptionText text={shown} s={s} />
                  {isLong && (
                    <button onClick={() => setDescExpanded(x => !x)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#8B5CF6', fontSize: 12, fontWeight: 600,
                      padding: '8px 0 0', display: 'block',
                      fontFamily: "'Be Vietnam Pro',sans-serif",
                    }}>{descExpanded ? '▲ Thu gọn' : '▼ Xem thêm'}</button>
                  )}
                </div>
              )
            })()}

            {/* ── Buy / external links ── */}
            {links.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 8, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#5a4a3a',
                  letterSpacing: 0.8, textTransform: 'uppercase',
                  fontFamily: "'Be Vietnam Pro',sans-serif",
                }}>{lang === 'vi' ? 'Mua sách:' : 'Buy:'}</span>
                {links.map((lnk, i) => {
                  const cfg = LINK_STYLES[lnk.link_type] || { color: '#7a6045', label: lnk.label || lnk.link_type }
                  return (
                    <a key={i} href={lnk.url} target="_blank" rel="noreferrer" style={{
                      fontSize: 12, fontWeight: 700, padding: '9px 18px', borderRadius: 11,
                      background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`,
                      color: cfg.color, textDecoration: 'none',
                      fontFamily: "'Be Vietnam Pro',sans-serif",
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${cfg.color}33` }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                    >{lnk.label || cfg.label} ↗</a>
                  )
                })}
              </div>
            )}

            {links.length === 0 && (
              <p style={{ fontSize: 12, color: s.textSecondary, fontStyle: 'italic',
                fontFamily: "'Be Vietnam Pro',sans-serif", marginTop: 4 }}>
                {lang === 'vi' ? 'Chưa có liên kết mua sách.' : 'No purchase links available yet.'}
              </p>
            )}

            {/* SKU */}
            {sku && (
              <p style={{ fontSize: 11, color: '#7a6045', marginTop: 16,
                fontFamily: "'Be Vietnam Pro',sans-serif" }}>
                ISBN / SKU: <span style={{ color: '#5a4a3a' }}>{sku}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Back to series */}
      <div style={{ maxWidth: 1100, margin: '16px auto 0', padding: isMobile ? '0 16px' : '0 24px' }}>
        <button onClick={goToSeries} style={{
          background: `${PURPLE}15`, border: `1px solid ${PURPLE}35`, borderRadius: 11,
          color: '#C4B5FD', fontSize: 12, fontWeight: 600, padding: '9px 18px',
          cursor: 'pointer', fontFamily: "'Be Vietnam Pro',sans-serif",
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← {lang === 'vi' ? `Về ${series?.title || 'series'}` : `Back to ${series?.title || 'series'}`}</button>
      </div>

      <PageFooter color={PURPLE} src="NovelTrend" />
    </div>
  )
}
