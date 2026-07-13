import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Plus, X } from 'lucide-react'
import { createPrompt } from '../api'
import { useToast } from './Toast'
import { useAuth } from '../context/AuthContext'

export default function PromptTable({ prompts, onCreated }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')
  const [saving, setSaving] = useState(false)
  const pushToast = useToast()
  const { requireAuth } = useAuth()

  const openForm = () => {
    if (!requireAuth()) return
    setShowForm((s) => !s)
  }

  const save = async () => {
    if (!requireAuth()) return
    if (!name.trim() || !template.trim()) return
    setSaving(true)
    try {
      await createPrompt({ name, template })
      setName('')
      setTemplate('')
      setShowForm(false)
      onCreated?.()
      pushToast('Prompt version saved.', 'success')
    } catch (err) {
      pushToast(`Failed to save prompt: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <h2>
        <span className="icon-label">
          <GitBranch size={15} color="#f472b6" />
          Prompt Versions
        </span>
        <button className={showForm ? 'secondary' : ''} onClick={openForm}>
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'New Version'}
        </button>
      </h2>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 16 }}
          >
            <div className="console-row">
              <input
                placeholder="Version name (e.g. summarizer-v3)"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
          </motion.div>
        )}
      </AnimatePresence>

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
                <td style={{ color: '#f2f4f8' }}>{p.name}</td>
                <td>{p.call_count}</td>
                <td>{p.avg_score ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  )
}