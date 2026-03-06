import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { PURPLE } from '../constants.js'

export function AuthModal({ onClose }) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const { lang } = useLang()
  const [mode,     setMode]     = useState('login')   // 'login' | 'register'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  const T = {
    login:       lang === 'vi' ? 'Đăng nhập'           : 'Sign In',
    register:    lang === 'vi' ? 'Đăng ký'              : 'Register',
    email:       lang === 'vi' ? 'Email'                : 'Email',
    password:    lang === 'vi' ? 'Mật khẩu'            : 'Password',
    google:      lang === 'vi' ? 'Đăng nhập với Google': 'Continue with Google',
    no_account:  lang === 'vi' ? 'Chưa có tài khoản?'  : "Don't have an account?",
    has_account: lang === 'vi' ? 'Đã có tài khoản?'    : 'Already have an account?',
    confirm:     lang === 'vi' ? 'Kiểm tra email để xác nhận tài khoản!' : 'Check your email to confirm your account!',
  }

  const submit = async () => {
    if (!email || !password) return
    setLoading(true); setError(null)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        onClose()
      } else {
        await signUp(email, password)
        setSuccess(true)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="nt-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(145deg,#0f0f1a,#1a1a2e)',
        border: `1px solid ${PURPLE}40`,
        borderRadius: 20, padding: 36, width: '100%', maxWidth: 400,
        boxShadow: `0 40px 100px rgba(0,0,0,0.9), 0 0 60px ${PURPLE}20`,
        position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', color: '#64748B',
          fontSize: 22, cursor: 'pointer', lineHeight: 1,
        }}>×</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28,
            letterSpacing: 2, color: '#fff' }}>
            NOVEL<span style={{ color: PURPLE }}>TREND</span>
          </div>
          <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
            {mode === 'login' ? T.login : T.register}
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#4ADE80', fontSize: 14 }}>
            ✓ {T.confirm}
          </div>
        ) : (
          <>
            {/* Google button */}
            <button onClick={async () => {
              setError(null)
              try { await signInWithGoogle() }
              catch(e) {
                setError(lang === 'vi'
                  ? 'Google chưa được bật. Vui lòng dùng email.'
                  : 'Google sign-in not enabled. Please use email.')
              }
            }} style={{
              width: '100%', background: '#fff', color: '#1a1a1a',
              border: 'none', borderRadius: 12, padding: '11px 0',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              marginBottom: 16, fontFamily: "'Be Vietnam Pro', sans-serif",
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {T.google}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ color: '#475569', fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Email + password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder={T.email} type="email"
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14,
                  outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif",
                }}
              />
              <input
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder={T.password} type="password"
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14,
                  outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif",
                }}
              />
            </div>

            {error && (
              <div style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button onClick={submit} disabled={loading} style={{
              width: '100%', background: PURPLE, color: '#fff', border: 'none',
              borderRadius: 12, padding: '12px 0', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: "'Be Vietnam Pro', sans-serif", marginBottom: 16,
              boxShadow: `0 4px 20px ${PURPLE}50`,
            }}>
              {loading ? '...' : mode === 'login' ? T.login : T.register}
            </button>

            <div style={{ textAlign: 'center', fontSize: 13, color: '#64748B' }}>
              {mode === 'login' ? T.no_account : T.has_account}{' '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
                style={{ background: 'none', border: 'none', color: PURPLE,
                  cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {mode === 'login' ? T.register : T.login}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  )
}
