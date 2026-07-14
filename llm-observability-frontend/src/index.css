import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, LogIn, UserPlus, Loader2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const close = () => {
    setAuthModalOpen(false)
    setError('')
  }

  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [authModalOpen])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="auth-card modal-card"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="secondary auth-back modal-close" onClick={close} type="button">
              <X size={14} />
            </button>

            <div className="auth-logo">
              <span className="logo-emoji">🤖</span>
              <div>
                <div className="auth-title">Sign in required</div>
                <div className="auth-subtitle">log in to continue this action</div>
              </div>
            </div>

            <div className="auth-tabs">
              <button
                className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => setMode('login')}
                type="button"
              >
                Sign In
              </button>
              <button
                className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => setMode('signup')}
                type="button"
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={submit}>
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="auth-field">
                      <User size={15} />
                      <input
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="auth-field">
                <Mail size={15} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <Lock size={15} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? (
                  <Loader2 size={14} className="spin" />
                ) : mode === 'login' ? (
                  <LogIn size={14} />
                ) : (
                  <UserPlus size={14} />
                )}
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'login' ? (
                <>Don't have an account? <span onClick={() => setMode('signup')}>Sign up</span></>
              ) : (
                <>Already have an account? <span onClick={() => setMode('login')}>Sign in</span></>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
