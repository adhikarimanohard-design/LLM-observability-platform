import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Plus, X, Trash2 } from 'lucide-react'
import { createPrompt, deletePrompt } from '../api'
import { useToast } from './Toast'
import { useAuth } from '../context/AuthContext'

export default function PromptTable({ prompts, onCreated, onSelectPrompt, selectedPromptId }) {
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

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!requireAuth()) return
    if (!confirm('Are you sure you want to delete this prompt version and all its logs?')) return
    
    try {
      await deletePrompt(id)
      onCreated?.()
      pushToast('Prompt deleted successfully.', 'success')
    } catch (err) {
      pushToast(`Failed to delete prompt: ${err.message}`, 'error')
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((p) => (
              <tr 
                key={p.id} 
                onClick={() => onSelectPrompt?.(p.id, p.template)}
                style={{ 
                  cursor: 'pointer', 
                  backgroundColor: selectedPromptId === p.id ? 'rgba(244, 114, 182, 0.1)' : 'transparent' 
                }}
              >
                <td style={{ color: '#f2f4f8' }}>{p.name}</td>
                <td>{p.call_count}</td>
                <td>{p.avg_score != null ? Math.round(p.avg_score) : '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="secondary icon-btn" 
                    onClick={(e) => handleDelete(e, p.id)}
                    title="Delete prompt"
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.div>
  )
}
