import React from 'react'
import { PURPLE } from '../constants.js'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#050508',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, fontFamily: "'Be Vietnam Pro', sans-serif",
        }}>
          <div style={{
            maxWidth: 480, textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 40,
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>⚠️</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 28, color: '#fff', marginBottom: 12, letterSpacing: 1,
            }}>
              Something went wrong
            </div>
            <div style={{ color: '#475569', fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </div>
            {this.state.info && (
              <details style={{ marginBottom: 24, textAlign: 'left' }}>
                <summary style={{ color: '#374151', fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
                  Technical details
                </summary>
                <pre style={{
                  background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 12,
                  fontSize: 10, color: '#64748B', overflow: 'auto',
                  maxHeight: 160, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>
                  {this.state.info.componentStack}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: PURPLE, border: 'none', color: '#fff',
                  borderRadius: 12, padding: '12px 28px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700,
                  boxShadow: `0 4px 20px ${PURPLE}50`,
                }}
              >
                Reload page
              </button>
              <button
                onClick={() => { window.location.hash = '#/'; window.location.reload() }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94A3B8', borderRadius: 12, padding: '12px 28px',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700,
                }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
