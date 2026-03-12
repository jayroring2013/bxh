import React from 'react'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Vote,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const MENU_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'content', icon: FolderOpen, label: 'Content' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'voting', icon: Vote, label: 'Voting' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'system', icon: Settings, label: 'System' },
]

const PURPLE = '#8B5CF6'

export function AdminSidebar({ activeMenu, setActiveMenu, collapsed, setCollapsed }) {
  return (
    <aside
      className="admin-sidebar"
      style={{
        width: collapsed ? 72 : 240,
        background: '#13111a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: collapsed ? '16px 0' : '20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 12,
          minHeight: 64,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${PURPLE}, #6366F1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Settings size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 18,
              fontWeight: 800,
              color: '#f1f5f9',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
            }}
          >
            NOVELTREND
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav
        style={{
          flex: 1,
          padding: '12px 8px',
          overflowY: 'auto',
        }}
      >
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeMenu === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '12px 0' : '12px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? `${PURPLE}20` : 'transparent',
                border: 'none',
                borderLeft: isActive ? `3px solid ${PURPLE}` : '3px solid transparent',
                color: isActive ? '#f1f5f9' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderRadius: '0 8px 8px 0',
                marginBottom: 4,
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} strokeWidth={2} />
              {!collapsed && (
                <span
                  style={{
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.03)',
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#64748B',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </aside>
  )
}