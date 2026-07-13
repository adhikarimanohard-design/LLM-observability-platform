import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Send, Loader2 } from 'lucide-react'
import { runComplete } from '../api'
import { useToast } from './Toast'
import { useAuth } from '../context/AuthContext'

export default function TestConsole({ onLogged }) {
  const [prompt, setPrompt] = useState('Explain what a vector database is in two sentences.')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const pushToast = useToast()
  const { requireAuth } = useAuth()

  const send = async () => {
    if (!requireAuth()) return
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const data = await runComplete({ prompt })
      setResult(data)
      onLogged?.()
      if (data.error) pushToast('Request logged, but the LLM call returned an error.', 'error')
      else pushToast('Request sent and logged successfully.', 'success')
    } catch (err) {
      setResult({ error: err.message, response_text: '' })
      pushToast(`Request failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2>
        <span className="icon-label">
          <Terminal size={15} color="#22d3ee" />
          Test Console
        </span>
      </h2>
      <div className="console-row" style={{ flexDirection: 'column' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to send through the observed LLM pipeline..."
        />
      </div>
      <button onClick={send} disabled={loading}>
        {loading ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
        {loading ? 'Sending…' : 'Send & Log Request'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 16, overflow: 'hidden' }}
          >
            {result.error && !result.response_text ? (
              <div className="response-box" style={{ color: '#fb7185' }}>{result.error}</div>
            ) : (
              <>
                <div className="response-box">{result.response_text}</div>
                <div style={{ marginTop: 6 }}>
                  <span className="tag issue">latency {result.latency_ms} ms</span>
                  <span className="tag issue">cost ${result.cost_usd.toFixed(6)}</span>
                  <span className={`tag ${result.evaluation.passed ? 'pass' : 'fail'}`}>
                    eval score {result.evaluation.score}
                  </span>
                  {result.evaluation.issues.map((issue) => (
                    <span className="tag issue" key={issue}>{issue}</span>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}