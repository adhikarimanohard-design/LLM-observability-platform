import { useEffect, useState, useCallback } from 'react'
import MetricCards from './components/MetricCards'
import TrendChart from './components/TrendChart'
import TestConsole from './components/TestConsole'
import PromptTable from './components/PromptTable'
import { getMetrics, getPrompts, getHealth } from './api'

export default function App() {
  const [metrics, setMetrics] = useState(null)
  const [prompts, setPrompts] = useState([])
  const [healthy, setHealthy] = useState(null)

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
    refreshMetrics()
    refreshPrompts()
    getHealth()
      .then((h) => setHealthy(h.status === 'ok'))
      .catch(() => setHealthy(false))

    const interval = setInterval(refreshMetrics, 15000)
    return () => clearInterval(interval)
  }, [refreshMetrics, refreshPrompts])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>LLM Observability &amp; Evaluation Platform</h1>
          <div className="subtitle">cost · latency · quality — tracked per request</div>
        </div>
        <div className="status-pill">
          <span className={`status-dot ${healthy ? 'ok' : 'bad'}`} />
          {healthy === null ? 'checking…' : healthy ? 'backend online' : 'backend unreachable'}
        </div>
      </header>

      <MetricCards metrics={metrics} />
      <TrendChart timeseries={metrics?.timeseries} />
      <TestConsole onLogged={refreshMetrics} />
      <PromptTable prompts={prompts} onCreated={refreshPrompts} />
    </div>
  )
}
