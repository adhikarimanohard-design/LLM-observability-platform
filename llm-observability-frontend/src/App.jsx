import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import MetricCards from './components/MetricCards'
import CountUp from './components/CountUp'
import TrendChart from './components/TrendChart'
import TestConsole from './components/TestConsole'
import PromptTable from './components/PromptTable'
import Landing from './components/Landing'
import AuthScreen from './components/AuthScreen'
import { ToastProvider } from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getMetrics, getPrompts, getHealth } from './api'

function Dashboard() {
  const { user, logout } = useAuth()
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
          <div className="user-pill">
            <span>{user?.name || user?.email}</span>
            <button className="secondary icon-btn" onClick={logout} title="Log out">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </motion.header>

      <MetricCards metrics={metrics} loading={loading} />
      <TrendChart timeseries={metrics?.timeseries} loading={loading} />
      <TestConsole onLogged={refreshMetrics} />
      <PromptTable prompts={prompts} onCreated={refreshPrompts} />
      <Footer />
    </div>
  )
}

function AuthGate() {
  const { token, checking } = useAuth()
  const [view, setView] = useState('landing') // 'landing' | 'auth'

  if (checking) {
    return (
      <div className="auth-shell">
        <div className="skeleton" style={{ width: 340, height: 420, borderRadius: 20 }} />
      </div>
    )
  }

  if (token) return <Dashboard />

  if (view === 'auth') {
    return <AuthScreen onBack={() => setView('landing')} />
  }

  return <Landing onGetStarted={() => setView('auth')} />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGate />
      </ToastProvider>
    </AuthProvider>
  )
}
