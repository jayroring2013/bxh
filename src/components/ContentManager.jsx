import React, { useState } from 'react'
import { BookOpen, Tv, Book, Link, Star, Search, Plus, Edit2, Trash2 } from 'lucide-react'

const PURPLE = '#8B5CF6'
const CYAN = '#06B6D4'
const ROSE = '#F43F5E'

const CONTENT_TABS = [
  { id: 'series', icon: BookOpen, label: 'Series' },
  { id: 'links', icon: Link, label: 'Links' },
  { id: 'featured', icon: Star, label: 'Featured' },
]

export function ContentManager({ token }) {
  const [activeTab, setActiveTab] = useState('series')
  const [seriesType, setSeriesType] = useState('novel')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'novel', icon: BookOpen, label: 'Novels', color: PURPLE },
    { id: 'anime', icon: Tv, label: 'Anime', color: CYAN },
    { id: 'manga', icon: Book, label: 'Manga', color: ROSE },
  ]

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 22,
          color: '#f1f5f9',
          marginBottom: 24,
        }}
      >
        Content Manager
      </h2>

      {/* Main Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 0,
        }}
      >
        {CONTENT_TABS.map((tab) => {
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
                transition: 'all 0.2s',
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Series Sub-tabs */}
      {activeTab === 'series' && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 20,
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = seriesType === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setSeriesType(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: isActive ? `${tab.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? tab.color : 'rgba(255,255,255,0.06)'}`,
                    color: isActive ? tab.color : '#64748B',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>

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
                placeholder={`Search ${seriesType}s...`}
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            >
              <Plus size={18} />
              Add {seriesType}
            </button>
          </div>

          {/* Placeholder Content */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: 40,
              textAlign: 'center',
            }}
          >
            <BookOpen size={48} color="#64748B" style={{ marginBottom: 16 }} />
            <p style={{ color: '#64748B', fontSize: 14 }}>
              Series list will load here. Connect to getSeries() from hooks/admin.js
            </p>
          </div>
        </div>
      )}

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <Link size={48} color="#64748B" style={{ marginBottom: 16 }} />
          <p style={{ color: '#64748B', fontSize: 14 }}>
            Item links manager. Connect to getItemLinks() from hooks/admin.js
          </p>
        </div>
      )}

      {/* Featured Tab */}
      {activeTab === 'featured' && (
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 40,
            textAlign: 'center',
          }}
        >
          <Star size={48} color="#64748B" style={{ marginBottom: 16 }} />
          <p style={{ color: '#64748B', fontSize: 14 }}>
            Featured items manager. Connect to getFeaturedItems() from hooks/admin.js
          </p>
        </div>
      )}
    </div>
  )
}