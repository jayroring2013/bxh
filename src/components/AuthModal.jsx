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
