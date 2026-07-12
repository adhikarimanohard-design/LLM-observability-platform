import { useState } from 'react'
import { runComplete } from '../api'

export default function TestConsole({ onLogged }) {
  const [prompt, setPrompt] = useState('Explain what a vector database is in two sentences.')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const send = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const data = await runComplete({ prompt })
      setResult(data)
      onLogged?.()
    } catch (err) {
      setResult({ error: err.message, response_text: '' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>Test Console</h2>
      <div className="console-row" style={{ flexDirection: 'column' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to send through the observed LLM pipeline..."
        />
      </div>
      <button onClick={send} disabled={loading}>
        {loading ? 'Sending…' : 'Send & Log Request'}
      </button>

      {result && (
        <div style={{ marginTop: 16 }}>
          {result.error ? (
            <div className="response-box" style={{ color: '#f0685e' }}>{result.error}</div>
          ) : (
            <>
              <div className="response-box">{result.response_text}</div>
              <div style={{ marginTop: 10 }}>
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
        </div>
      )}
    </div>
  )
}
