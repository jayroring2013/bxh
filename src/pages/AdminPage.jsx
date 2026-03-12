// src/pages/AdminPage.jsx
// Complete Admin Panel with Sidebar Layout

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { checkAdmin, getDashboardStats } from '../hooks/admin.js'

// Admin Components
import { AdminSidebar } from '../components/admin/AdminSidebar.jsx'
import { AdminHeader } from '../components/admin/AdminHeader.jsx'
import { DashboardOverview } from '../components/admin/DashboardOverview.jsx'
import { ContentManager } from '../components/admin/ContentManager.jsx'
import { UserManager } from '../components/admin/UserManager.jsx'
import { VoteManager } from '../components/admin/VoteManager.jsx'
import { AnalyticsView } from '../components/admin/AnalyticsView.jsx'
import { SystemSettings } from '../components/admin/SystemSettings.jsx'

// Lucide Icons
import { ShieldAlert, Loader2, LogOut } from 'lucide-react'

// Colors
const BG_DARK = '#0f0b09'
const PURPLE = '#8B5CF6'
const ROSE = '#F43F5E'

// ═══════════════════════════════════════════════════════════
// Main AdminPage Component
// ═══════════════════════════════════════════════════════════
export function AdminPage() {
  const { user, token, logout } = useAuth()
  const { lang } = useLang()
  const { show: showToast } = useToast()

  // Admin state
  const [isAdmin, setIsAdmin] = useState(null)
  const [adminLoading, setAdminLoading] = useState(true)

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [notificationCount, setNotificationCount] = useState(0)

  // Dashboard stats
  const [stats, setStats] = useState({
    totalNovels: 0,
    totalAnime: 0,
    totalManga: 0,
    totalVotes: 0,
    totalAdmins: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const toast = (msg, ok = true) => showToast(msg, ok)

  // ── Check Admin Permissions ────────────────────────────────
  useEffect(() => {
    if (!token || !user?.id) {
      setIsAdmin(false)
      setAdminLoading(false)
      return
    }

    setAdminLoading(true)
    checkAdmin(token, user.id)
      .then((result) => {
        setIsAdmin(result)
        if (!result) {
          toast('Access denied: Admin privileges required', false)
        }
      })
      .catch((error) => {
        console.error('Admin check failed:', error)
        setIsAdmin(false)
        toast('Failed to verify admin status', false)
      })
      .finally(() => setAdminLoading(false))
  }, [token, user?.id, toast])

  // ── Load Dashboard Stats ───────────────────────────────────
  useEffect(() => {
    if (!isAdmin || !token) return

    setStatsLoading(true)
    getDashboardStats(token)
      .then((data) => {
        setStats(data)
        // Simulate notification count based on data
        setNotificationCount(data.totalVotes > 1000 ? 5 : 0)
      })
      .catch((error) => {
        console.error('Failed to load dashboard stats:', error)
        toast('Failed to load dashboard statistics', false)
      })
      .finally(() => setStatsLoading(false))
  }, [isAdmin, token, toast])

  // ── Handle Logout ──────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await logout()
      toast('Logged out successfully')
      // Redirect will be handled by AuthContext
    } catch (error) {
      console.error('Logout failed:', error)
      toast('Logout failed', false)
    }
  }

  // ── Render Content Based on Active Menu ───────────────────
  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return <DashboardOverview stats={stats} loading={statsLoading} />

      case 'content':
        return <ContentManager token={token} />

      case 'users':
        return <UserManager token={token} />

      case 'voting':
        return <VoteManager token={token} />

      case 'analytics':
        return <AnalyticsView token={token} />

      case 'system':
        return <SystemSettings token={token} />

      default:
        return (
          <div
            style={{
              textAlign: 'center',
              padding: 60,
              color: '#64748B',
            }}
          >
            <ShieldAlert size={48} style={{ marginBottom: 16 }} />
            <p>Unknown menu section</p>
          </div>
        )
    }
  }

  // ── Loading State ──────────────────────────────────────────
  if (adminLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BG_DARK,
          gap: 16,
        }}
      >
        <Loader2 size={40} color={PURPLE} className="spin" />
        <p
          style={{
            color: '#94A3B8',
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontSize: 14,
          }}
        >
          Verifying admin permissions...
        </p>
      </div>
    )
  }

  // ── Not Logged In ──────────────────────────────────────────
  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BG_DARK,
          gap: 20,
          padding: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${ROSE}, ${PURPLE})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={32} color="#fff" />
        </div>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 28,
            color: '#f1f5f9',
            margin: 0,
          }}
        >
          Login Required
        </h1>
        <p
          style={{
            color: '#64748B',
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontSize: 14,
            textAlign: 'center',
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          You must be logged in to access the admin panel. Please sign in with
          an admin account.
        </p>
        <a
          href="#/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: PURPLE,
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
        >
          ← Go Home
        </a>
      </div>
    )
  }

  // ── Not Admin ──────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: BG_DARK,
          gap: 20,
          padding: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${ROSE}, #EF4444)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={32} color="#fff" />
        </div>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 28,
            color: '#F87171',
            margin: 0,
          }}
        >
          Access Denied
        </h1>
        <p
          style={{
            color: '#64748B',
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontSize: 14,
            textAlign: 'center',
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          This account does not have administrator privileges. Please contact
          the site owner to request admin access.
        </p>
        <a
          href="#/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }}
        >
          ← Go Home
        </a>
      </div>
    )
  }

  // ── Admin Panel (Main Layout) ─────────────────────────────
  return (
    <div
      className="admin-panel"
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: BG_DARK,
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Top Header */}
        <AdminHeader user={user} onLogout={handleLogout} notificationCount={notificationCount} />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: 24,
            overflowY: 'auto',
            background: `linear-gradient(135deg, rgba(139,92,246,0.03) 0%, rgba(6,182,212,0.02) 100%)`,
          }}
        >
          <div
            style={{
              maxWidth: 1400,
              margin: '0 auto',
            }}
          >
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        .admin-panel {
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .admin-panel h1,
        .admin-panel h2,
        .admin-panel h3,
        .admin-panel h4 {
          font-family: 'Barlow Condensed', sans-serif;
        }
        /* Custom scrollbar */
        .admin-panel main::-webkit-scrollbar {
          width: 8px;
        }
        .admin-panel main::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        .admin-panel main::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .admin-panel main::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
        /* Smooth transitions */
        .admin-panel * {
          transition: background-color 0.2s ease, border-color 0.2s ease, 
                      color 0.2s ease, transform 0.2s ease;
        }
      `}</style>
    </div>
  )
}

export default AdminPage
