import React, { useState, useEffect } from 'react'
import {
  Settings,
  Bell,
  Globe,
  Save,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from './icons.jsx'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../hooks/admin.js'

const PURPLE = '#8B5CF6'
const ROSE = '#F43F5E'
const GREEN = '#4ADE80'

const SYSTEM_TABS = [
  { id: 'announcements', icon: Bell, label: 'Announcements' },
  { id: 'settings', icon: Settings, label: 'Site Settings' },
]

export function SystemSettings({ token }) {
  const [activeTab, setActiveTab] = useState('announcements')
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', active: true })

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getAnnouncements(token)
      .then(setAnnouncements)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return
    try {
      const created = await createAnnouncement(token, newAnnouncement)
      setAnnouncements((prev) => [created, ...prev])
      setNewAnnouncement({ title: '', content: '', active: true })
    } catch (error) {
      console.error('Failed to create announcement:', error)
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      await updateAnnouncement(token, id, { active: !currentActive })
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !currentActive } : a))
      )
    } catch (error) {
      console.error('Failed to toggle announcement:', error)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(token, id)
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } catch (error) {
      console.error('Failed to delete announcement:', error)
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
        <Settings size={24} color={PURPLE} />
        System Settings
      </h2>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {SYSTEM_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                background: isActive ? `${PURPLE}20` : 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${PURPLE}` : '2px solid transparent',
                color: isActive ? '#f1f5f9' : '#64748B',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Icon size={18} color={isActive ? '#f1f5f9' : '#64748B'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div>
          {/* Create New */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h3
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 16,
                color: '#f1f5f9',
                marginBottom: 16,
              }}
            >
              Create Announcement
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <textarea
                placeholder="Content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement((prev) => ({ ...prev, content: e.target.value }))}
                rows={3}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  color: '#f1f5f9',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                }}
              />
              <button
                onClick={handleCreateAnnouncement}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: PURPLE,
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                }}
              >
                <Plus size={18} color="#fff" />
                Create Announcement
              </button>
            </div>
          </div>

          {/* Announcements List */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading...</div>
            ) : announcements.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No announcements yet</div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: 16,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h4 style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 600, margin: 0 }}>
                        {ann.title}
                      </h4>
                      {ann.active ? (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 8px',
                            background: `${GREEN}20`,
                            color: GREEN,
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 8px',
                            background: '#64748B30',
                            color: '#64748B',
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          Inactive
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#94A3B8', margin: '4px 0 0 0' }}>{ann.content}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleToggleActive(ann.id, ann.active)}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: '#64748B',
                        cursor: 'pointer',
                      }}
                      title={ann.active ? 'Deactivate' : 'Activate'}
                    >
                      {ann.active ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(244,63,94,0.1)',
                        border: '1px solid rgba(244,63,94,0.3)',
                        borderRadius: 6,
                        color: ROSE,
                        cursor: 'pointer',
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} color={ROSE} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Site Settings Tab */}
      {activeTab === 'settings' && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <Globe size={48} color="#64748B" style={{ marginBottom: 16 }} />
          <p style={{ color: '#64748B', fontSize: 14 }}>Site configuration settings coming soon</p>
        </div>
      )}
    </div>
  )
}