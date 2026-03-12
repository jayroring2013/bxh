import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Activity, Calendar } from './icons.jsx'
import { getVoteTrends } from '../../hooks/admin.js'

const PURPLE = '#8B5CF6'
const CYAN = '#06B6D4'

export function AnalyticsView({ token }) {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getVoteTrends(token, 6)
      .then(setTrends)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const maxVotes = Math.max(...trends.map((t) => t.totalVotes), 1)

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
        <BarChart3 size={24} color={PURPLE} />
        Analytics & Reports
      </h2>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <TrendingUp size={20} color={PURPLE} />
            <span style={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
              Total Votes (6 months)
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#f1f5f9',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {loading ? '...' : trends.reduce((s, t) => s + t.totalVotes, 0).toLocaleString()}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Activity size={20} color={CYAN} />
            <span style={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
              Avg. Votes/Month
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#f1f5f9',
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {loading
              ? '...'
              : Math.round(trends.reduce((s, t) => s + t.totalVotes, 0) / (trends.length || 1)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            color: '#f1f5f9',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Calendar size={18} color={PURPLE} />
          Vote Trends (Last 6 Months)
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading...</div>
        ) : trends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>No data available</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, paddingTop: 20 }}>
            {trends.map((trend, index) => {
              const height = (trend.totalVotes / maxVotes) * 160
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(height, 4)}px`,
                      background: `linear-gradient(180deg, ${PURPLE} 0%, ${PURPLE}80 100%)`,
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.5s ease',
                      position: 'relative',
                    }}
                    title={`${trend.totalVotes.toLocaleString()} votes`}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 11,
                        color: '#94A3B8',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {trend.totalVotes > 0 ? trend.totalVotes.toLocaleString() : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    {trend.month}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}