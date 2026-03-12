import React from 'react'
import { Bell, LogOut, Shield } from 'lucide-react'

const PURPLE = '#8B5CF6'
const ROSE = '#F43F5E'

export function AdminHeader({ user, onLogout, notificationCount = 0 }) {
  return (
    <header
      style={{
        height: 64,
        background: 'rgba(19,17,26,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Shield size={20} color={PURPLE} />
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: '#f1f5f9',
          }}
        >
          Admin Panel
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notifications */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            position: 'relative',
            padding: 8,
            borderRadius: 8,
            transition: 'background 0.2s',
          }}
          title="Notifications"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 18,
                height: 18,
                borderRadius: '50%',
                background: ROSE,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${PURPLE}, #06B6D4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span
            style={{
              fontSize: 14,
              color: '#94A3B8',
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontWeight: 500,
            }}
          >
            {user?.email?.split('@')[0] || 'User'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          title="Logout"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = ROSE
            e.currentTarget.style.background = 'rgba(244,63,94,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748B'
            e.currentTarget.style.background = 'none'
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}