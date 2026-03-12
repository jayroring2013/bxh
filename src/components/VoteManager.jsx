import React, { useState, useEffect } from 'react'
import { Vote, Calendar, Search, Edit2, Trash2 } from 'lucide-react'
import { getVotes, updateVotes, deleteVotes } from '../../hooks/admin.js'

const PURPLE = '#8B5CF6'
const ROSE = '#F43F5E'

export function VoteManager({ token }) {
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getVotes(token, month, year)
      .then(setVotes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, month, year])

  const handleUpdateVote = async (id, currentCount) => {
    const newCount = prompt('Enter new vote count:', currentCount)
    if (!newCount || isNaN(newCount)) return
    try {
      await updateVotes(token, id, parseInt(newCount))
      setVotes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, vote_count: parseInt(newCount) } : v))
      )
    } catch (error) {
      console.error('Failed to update votes:', error)
    }
  }

  const handleDeleteVote = async (id) => {
    if (!confirm('Delete this vote record?')) return
    try {
      await deleteVotes(token, id)
      setVotes((prev) => prev.filter((v) => v.id !== id))
    } catch (error) {
      console.error('Failed to delete vote:', error)
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
        <Vote size={24} color={PURPLE} />
        Vote Management
      </h2>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
          }}
        >
          <Calendar size={18} color="#64748B" />
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            style={{
              background: 'none',
              border: 'none',
              color: '#f1f5f9',
              fontSize: 14,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1} style={{ background: '#13111a' }}>
                {new Date(2024, i).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
          }}
        >
          <span style={{ color: '#64748B', fontSize: 14 }}>Year:</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{
              width: 80,
              background: 'none',
              border: 'none',
              color: '#f1f5f9',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 200,
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
            placeholder="Search novels..."
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
      </div>

      {/* Votes Table */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                Rank
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
                Novel Title
              </th>
              <th
                style={{
                  padding: '14px 20px',
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Votes
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
                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                  Loading...
                </td>
              </tr>
            ) : votes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
                  No votes found for this period
                </td>
              </tr>
            ) : (
              votes.map((vote, index) => (
                <tr
                  key={vote.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <td
                    style={{
                      padding: '14px 20px',
                      color: '#f1f5f9',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    #{index + 1}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      color: '#f1f5f9',
                      fontSize: 14,
                    }}
                  >
                    {vote.novel_title}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      color: PURPLE,
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {vote.vote_count?.toLocaleString() || 0}
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      textAlign: 'right',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 8,
                    }}
                  >
                    <button
                      onClick={() => handleUpdateVote(vote.id, vote.vote_count)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 6,
                        color: PURPLE,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVote(vote.id)}
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
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
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