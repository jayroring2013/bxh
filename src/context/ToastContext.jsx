import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  text: '#4ADE80' },
    warning: { bg: 'rgba(234,179,8,0.15)',  border: 'rgba(234,179,8,0.4)',  text: '#FDE047' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  text: '#FCA5A5' },
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.success
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              color: c.text, borderRadius: 12, padding: '12px 18px',
              fontSize: 13, fontWeight: 600, maxWidth: 300,
              fontFamily: "'Be Vietnam Pro', sans-serif",
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              animation: 'slideInRight 0.25s ease',
              backdropFilter: 'blur(12px)',
            }}>
              {t.type === 'success' ? '✓ ' : t.type === 'warning' ? '⚠ ' : '✕ '}{t.msg}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
