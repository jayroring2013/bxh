import React from 'react'
import { BookOpen, Tv, Book, Vote, Users, TrendingUp, Plus } from './icons.jsx'

const COLORS = {
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  rose: '#F43F5E',
  gold: '#F59E0B',
  green: '#4ADE80',
}

const WIDGETS = [
  { label: 'Total Novels', key: 'totalNovels', icon: BookOpen, color: COLORS.purple },
  { label: 'Total Anime', key: 'totalAnime', icon: Tv, color: COLORS.cyan },
  { label: 'Total Manga', key: 'totalManga', icon: Book, color: COLORS.rose },
  { label: 'Total Votes', key: 'totalVotes', icon: Vote, color: COLORS.gold },
  { label: 'Admin Users', key: 'totalAdmins', icon: Users, color: COLORS.green },
]

export function DashboardOverview({ stats, loading }) {
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
        <TrendingUp size={24} color={COLORS.purple} />
        Dashboard Overview
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {WIDGETS.map((widget) => {
          const Icon = widget.icon
          const value = stats[widget.key] ?? 0
          return (
            <div
              key={widget.key}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'transform 0.2s, border-color 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = widget.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: `${widget.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={24} color={widget.color} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748B',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  {widget.label}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: '#f1f5f9',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {loading ? <span style={{ color: '#64748B' }}>...</span> : value.toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: 20,
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
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: `${COLORS.purple}20`,
              border: `1px solid ${COLORS.purple}`,
              color: COLORS.purple,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.purple
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${COLORS.purple}20`
              e.currentTarget.style.color = COLORS.purple
            }}
          >
            <Plus size={18} />
            Add Novel
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: `${COLORS.cyan}20`,
              border: `1px solid ${COLORS.cyan}`,
              color: COLORS.cyan,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.cyan
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${COLORS.cyan}20`
              e.currentTarget.style.color = COLORS.cyan
            }}
          >
            <Plus size={18} />
            Add Anime
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: `${COLORS.rose}20`,
              border: `1px solid ${COLORS.rose}`,
              color: COLORS.rose,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.rose
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${COLORS.rose}20`
              e.currentTarget.style.color = COLORS.rose
            }}
          >
            <Plus size={18} />
            Add Manga
          </button>
        </div>
      </div>
    </div>
  )
}