import React, { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Shield, ShieldCheck, Search } from 'lucide-react'
import { getAdminUsers, grantAdmin, revokeAdmin } from '../../hooks/admin.js'

const PURPLE = '#8B5CF6'
const ROSE = '#F43F5E'

export function UserManager({ token }) {
  const [adminUsers, setAdminUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getAdminUsers(token)
      .then(setAdminUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const handleRevokeAdmin = async (userId) => {
    if (!confirm('Revoke admin privileges from this user?')) return
    try {
      await revokeAdmin(token, userId)
      setAdminUsers((prev) => prev.filter((u) => u.user_id !== userId))
    } catch (error) {
      console.error('Failed to revoke admin:', error)
    }
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 22,
          color: '#f1f5f9',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Users size={24} color={PURPLE} />
        User Management
      </h2>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
          }}
        >
          <Search size={18} color="#64748B" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: '#f1f5f9',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: PURPLE,
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Plus size={18} />
          Grant Admin
        </button>
      </div>

      {/* Admin Users Table */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <th
                style={{
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 12,
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                User ID
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  textAlign: 'left',
                  fontSize: 12,
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Granted At
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  textAlign: 'right',
                  fontSize: 12,
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                  Loading...
                </td>
              </tr>
            ) : adminUsers.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                  No admin users found
                </td>
              </tr>
            ) : (
              adminUsers.map((user) => (
                <tr
                  key={user.user_id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <td
                    style={{
                      padding: '14px 20px',
                      color: '#f1f5f9',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <ShieldCheck size={16} color={PURPLE} />
                    {user.user_id.slice(0, 8)}...{user.user_id.slice(-8)}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      color: '#94A3B8',
                      fontSize: 14,
                    }}
                  >
                    {user.granted_at
                      ? new Date(user.granted_at).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      textAlign: 'right',
                    }}
                  >
                    <button
                      onClick={() => handleRevokeAdmin(user.user_id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        background: 'rgba(244,63,94,0.1)',
                        border: '1px solid rgba(244,63,94,0.3)',
                        borderRadius: 6,
                        color: ROSE,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = ROSE
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(244,63,94,0.1)'
                        e.currentTarget.style.color = ROSE
                      }}
                    >
                      <Trash2 size={14} />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}