import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LogOut, LogIn } from 'lucide-react'
import MetricCards from './components/MetricCards'
import TrendChart from './components/TrendChart'
import TestConsole from './components/TestConsole'
import PromptTable from './components/PromptTable'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import { ToastProvider } from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getMetrics, getPrompts, getHealth } from './api'

function Dashboard() {
  const { user, logout, token, setAuthModalOpen } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [prompts, setPrompts] = useState([])
  const [healthy, setHealthy] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMetrics = useCallback(async () => {
    try {
      const data = await getMetrics(24)
      setMetrics(data)
    } catch {
      setMetrics(null)
    }
  }, [])

  const refreshPrompts = useCallback(async () => {
    try {
      const data = await getPrompts()
      setPrompts(data)
    } catch {
      setPrompts([])
    }
  }, [])

  useEffect(() => {
    Promise.all([refreshMetrics(), refreshPrompts()]).finally(() => setLoading(false))
    getHealth()
      .then((h) => setHealthy(h.status === 'ok'))
      .catch(() => setHealthy(false))

    const interval = setInterval(refreshMetrics, 15000)
    return () => clearInterval(interval)
  }, [refreshMetrics, refreshPrompts])

  return (
    <div className="app-shell">
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="header-left">
          <span className="logo-emoji header-logo">🤖</span>
          <div>
            <h1>LLM Observability &amp; Evaluation Platform</h1>
            <div className="subtitle">cost · latency · quality — tracked per request</div>
          </div>
        </div>
        <div className="header-right">
          <div className="status-pill">
            <span className={`status-dot ${healthy ? 'ok' : 'bad'}`} />
            {healthy === null ? 'checking…' : healthy ? 'backend online' : 'backend unreachable'}
          </div>
          {token ? (
            <div className="user-pill">
              <span>{user?.name || user?.email}</span>
              <button className="secondary icon-btn" onClick={logout} title="Log out">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => setAuthModalOpen(true)}>
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </div>
      </motion.header>

      <MetricCards metrics={metrics} loading={loading} />
      <TrendChart timeseries={metrics?.timeseries} loading={loading} />
      <TestConsole onLogged={refreshMetrics} />
      <PromptTable prompts={prompts} onCreated={refreshPrompts} />
      <Footer />
      <AuthModal />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </AuthProvider>
  )
}