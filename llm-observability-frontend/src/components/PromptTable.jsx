import { useState } from 'react'
import { createPrompt } from '../api'

export default function PromptTable({ prompts, onCreated }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim() || !template.trim()) return
    setSaving(true)
    try {
      await createPrompt({ name, template })
      setName('')
      setTemplate('')
      setShowForm(false)
      onCreated?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="panel">
      <h2>
        Prompt Versions
        <button onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ New Version'}</button>
      </h2>

      {showForm && (
        <div style={{ marginBottom: 16 }}>
          <div className="console-row">
            <input
              placeholder="Version name (e.g. summarizer-v3)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <div className="console-row">
            <textarea
              placeholder="Prompt template — use {input} as a placeholder"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </div>
          <button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Version'}</button>
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="empty-state">No prompt versions registered yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Calls</th>
              <th>Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.call_count}</td>
                <td>{p.avg_score ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
