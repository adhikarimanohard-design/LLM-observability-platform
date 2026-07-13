import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Send, Loader2, X } from 'lucide-react'
import { runComplete } from '../api'
import { useToast } from './Toast'
import { useAuth } from '../context/AuthContext'

export default function TestConsole({ onLogged, selectedPromptId, selectedPromptTemplate, onClearSelection }) {
  const [prompt, setPrompt] = useState('Explain what a vector database is in two sentences.')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const pushToast = useToast()
  const { requireAuth } = useAuth()

  useEffect(() => {
    if (selectedPromptId) {
      setPrompt('')
    }
  }, [selectedPromptId])

  const send = async () => {
    if (!requireAuth()) return
    if (!prompt.trim() && !selectedPromptId) return
    setLoading(true)
    try {
      const payload = selectedPromptId
        ? { 
            model: "llama-3.1-8b-instant", 
            prompt_version_id: selectedPromptId, 
            input_variables: { input: prompt } 
          }
        : { 
            model: "llama-3.1-8b-instant", 
            prompt 
          }

      const data = await runComplete(payload)
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>
          <span className="icon-label">
            <Terminal size={15} color="#22d3ee" />
            Test Console
          </span>
        </h2>
        {selectedPromptId && (
          <button className="secondary" onClick={onClearSelection} style={{ padding: '4px 8px', fontSize: '12px' }}>
            <X size={12} style={{ marginRight: '4px' }} /> Clear Selection
          </button>
        )}
      </div>

      {selectedPromptId && (
        <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderRadius: '4px', fontSize: '13px', color: '#22d3ee' }}>
          <strong>Template:</strong> {selectedPromptTemplate}
        </div>
      )}

      <div className="console-row" style={{ flexDirection: 'column' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={selectedPromptId ? "Enter text for the {input} variable..." : "Enter a prompt to send through the observed LLM pipeline..."}
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
                  <span className="tag issue">cost ${result.cost_usd?.toFixed(6)}</span>
                  <span className={`tag ${result.evaluation?.passed ? 'pass' : 'fail'}`}>
                    eval score {result.evaluation?.score}
                  </span>
                  {result.evaluation?.issues?.map((issue) => (
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
