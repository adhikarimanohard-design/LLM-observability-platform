import { motion } from 'framer-motion'
import { Activity, DollarSign, AlertTriangle, Gauge } from 'lucide-react'
import CountUp from './CountUp'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function MetricCards({ metrics, loading }) {
  if (loading) {
    return (
      <div className="metric-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="metric-card" key={i}>
            <div className="skeleton" style={{ height: 11, width: '60%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: '45%' }} />
          </div>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const errorClass = metrics.error_rate > 0.1 ? 'bad' : metrics.error_rate > 0.02 ? 'warn' : 'good'
  const latencyClass = metrics.latency_p95_ms > 3000 ? 'bad' : metrics.latency_p95_ms > 1200 ? 'warn' : 'good'

  const cards = [
    { label: 'Total Calls (24h)', value: metrics.total_calls, decimals: 0, icon: Activity, cls: '' },
    { label: 'Total Cost (USD)', value: metrics.total_cost_usd, decimals: 4, prefix: '$', cls: '', icon: DollarSign },
    { label: 'Error Rate', value: metrics.error_rate * 100, decimals: 1, suffix: '%', cls: errorClass, icon: AlertTriangle },
    { label: 'p95 Latency', value: metrics.latency_p95_ms, decimals: 0, suffix: ' ms', cls: latencyClass, icon: Gauge },
  ]

  return (
    <motion.div className="metric-grid" variants={container} initial="hidden" animate="show">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <motion.div className="metric-card" key={c.label} variants={item}>
            <div className="label">
              <span className="icon-label">
                <Icon size={12} />
                {c.label}
              </span>
            </div>
            <div className={`value ${c.cls}`}>
              <CountUp value={c.value} decimals={c.decimals} prefix={c.prefix || ''} suffix={c.suffix || ''} />
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}