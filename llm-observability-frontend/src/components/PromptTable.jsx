import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Plus, X, Trash2, Loader2 } from 'lucide-react';
import { createPrompt, deletePrompt } from '../api';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

export default function PromptTable({ prompts, onCreated, onSelectPrompt, selectedPromptId }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track deletion per row
  const pushToast = useToast();
  const { requireAuth } = useAuth();

  const toggleForm = () => {
    if (!showForm && !requireAuth()) return;
    setShowForm(!showForm);
  };

  const save = async () => {
    if (!name.trim() || !template.trim()) {
      pushToast('Name and template are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await createPrompt({ name, template });
      setName('');
      setTemplate('');
      setShowForm(false);
      onCreated?.();
      pushToast('Prompt version created successfully.', 'success');
    } catch (err) {
      pushToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this version and all logs?')) return;
    
    setDeletingId(id);
    try {
      await deletePrompt(id);
      onCreated?.();
      pushToast('Deleted successfully.', 'success');
    } catch (err) {
      pushToast('Delete failed. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>
        <span className="icon-label">
          <GitBranch size={15} color="#f472b6" />
          Prompt Versions
        </span>
        <button className={showForm ? 'secondary' : ''} onClick={toggleForm}>
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
                placeholder="Version name (e.g., summarizer-v3)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="console-row">
              <textarea
                placeholder="Prompt template — use {input} as a placeholder"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={3}
              />
            </div>
            <button onClick={save} disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : 'Save Version'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <table className="prompt-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Calls</th>
            <th>Avg Score</th>
            <th style={{ width: '40px' }}></th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((p) => (
            <tr 
              key={p.id} 
              onClick={() => onSelectPrompt?.(p.id, p.template)}
              className={selectedPromptId === p.id ? 'active-row' : ''}
            >
              <td>{p.name}</td>
              <td>{p.call_count}</td>
              <td>{p.avg_score != null ? Math.round(p.avg_score) : '—'}</td>
              <td style={{ textAlign: 'right' }}>
                <button 
                  className="secondary icon-btn" 
                  onClick={(e) => handleDelete(e, p.id)}
                  disabled={deletingId === p.id}
                >
                  {deletingId === p.id ? (
                    <Loader2 size={14} className="spin" />
                  ) : (
                    <Trash2 size={14} color="#ef4444" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
