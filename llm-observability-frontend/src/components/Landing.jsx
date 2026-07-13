import { motion } from 'framer-motion'
import { Activity, GitBranch, Gauge, ArrowRight } from 'lucide-react'

const features = [
  { icon: Activity, label: 'Real-time cost & latency tracking' },
  { icon: Gauge, label: 'p50 / p95 / p99 latency percentiles' },
  { icon: GitBranch, label: 'Prompt versioning & regression testing' },
]

export default function Landing({ onGetStarted }) {
  return (
    <div className="landing-shell">
      <motion.div
        className="landing-logo-row"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="logo-emoji">🤖</span>
        <span className="landing-brand">LLM Observability</span>
      </motion.div>

      <motion.div
        className="landing-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="landing-title">
          Know exactly how your<br />LLM is performing
        </h1>
        <p className="landing-subtitle">
          Cost, latency, and quality — tracked on every request. Catch regressions
          before your users do.
        </p>

        <button className="landing-cta" onClick={onGetStarted}>
          Get Started
          <ArrowRight size={16} />
        </button>
      </motion.div>

      <motion.div
        className="landing-features"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div className="landing-feature-card" key={f.label}>
              <Icon size={18} color="#8b5cf6" />
              <span>{f.label}</span>
            </div>
          )
        })}
      </motion.div>

      <footer className="app-footer landing-footer">
        Built by <span>Adhikari Manohar Dash</span> 👨‍💻
      </footer>
    </div>
  )
}