import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 620)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 620)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export function ModalShell({ onClose, accentColor, bg, children }) {
  const mobile = useIsMobile()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)',
    display: 'flex',
    alignItems: mobile ? 'flex-end' : 'center',
    justifyContent: 'center',
    padding: mobile ? 0 : 20,
    animation: 'fadeIn 0.2s ease',
  }

  const modalStyle = {
    position: 'relative',
    borderRadius: mobile ? '20px 20px 0 0' : 24,
    overflow: 'hidden',
    overflowY: 'auto',
    maxWidth: mobile ? '100vw' : 860,
    width: '100%',
    maxHeight: mobile ? '92vh' : 'calc(100vh - 40px)',
    background: bg,
    border: `1px solid ${accentColor}30`,
    boxShadow: '0 40px 100px rgba(0,0,0,0.9)',
    animation: 'slideUp 0.3s ease',
  }

  return createPortal(
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', width: 34, height: 34, borderRadius: '50%',
          cursor: 'pointer', fontSize: 18, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>×</button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}

export function ModalBody({ cover, coverBg, accentColor, coverEmoji, children }) {
  const mobile = useIsMobile()

  if (mobile) {
    // Mobile: cover as tall banner on top, content below
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Cover banner */}
        <div style={{ position: 'relative', height: 240, flexShrink: 0,
          background: coverBg || '#050810', overflow: 'hidden' }}>
          {cover
            ? <img src={cover} alt="" style={{ width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                onError={e => e.target.style.display='none'} />
            : <div style={{ width: '100%', height: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
                {coverEmoji}
              </div>
          }
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none' }} />
        </div>
        {/* Content */}
        <div style={{ padding: '20px 18px 32px' }}>
          {children}
        </div>
      </div>
    )
  }

  // Desktop: cover left, content right
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', minHeight: 360 }}>
      <div style={{ width: 185, minWidth: 185, flexShrink: 0,
        background: coverBg || '#050810', overflow: 'hidden', position: 'relative' }}>
        {cover
          ? <img src={cover} alt="" style={{ width: '100%', height: '100%',
              objectFit: 'cover', display: 'block', minHeight: 360 }}
              onError={e => e.target.style.display='none'} />
          : <div style={{ width: '100%', minHeight: 360, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
              {coverEmoji}
            </div>
        }
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 55%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '24px 24px 20px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
