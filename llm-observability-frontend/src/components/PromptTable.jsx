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
  const [deletingId, setDeletingId] = useState(null);
  const pushToast = useToast();
  const { requireAuth } = useAuth();

  const toggleForm = () => {
    if (!showForm && !requireAuth()) return;
    setShowForm(!showForm);
  };

  const save = async () => {
    if (!name.trim() || !template.trim()) {
      pushToast('Name and template required', 'error');
      return;
    }
    setSaving(true);
    try {
      await createPrompt({ name, template });
      setName(''); setTemplate(''); setShowForm(false);
      onCreated?.();
      pushToast('Saved successfully', 'success');
    } catch (err) {
      pushToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this prompt and its logs?')) return;
    setDeletingId(id);
    try {
      await deletePrompt(id);
      onCreated?.();
      pushToast('Deleted', 'success');
    } catch (err) {
      pushToast('Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div className="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2>
        <span className="icon-label"><GitBranch size={15} /> Prompt Versions</span>
        <button onClick={toggleForm}>{showForm ? <X size={13} /> : <Plus size={13} />} {showForm ? 'Cancel' : 'New'}</button>
      </h2>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea placeholder="Template" value={template} onChange={(e) => setTemplate(e.target.value)} />
            <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </motion.div>
        )}
      </AnimatePresence>

      <table>
        <thead>
          <tr><th>Name</th><th>Calls</th><th>Avg Score</th><th>Action</th></tr>
        </thead>
        <tbody>
          {prompts.map((p) => (
            <tr key={p.id} onClick={() => onSelectPrompt?.(p.id, p.template)} className={selectedPromptId === p.id ? 'active' : ''}>
              <td>{p.name}</td>
              <td>{p.call_count}</td>
              <td>{p.avg_score != null ? Math.round(p.avg_score) : '—'}</td>
              <td>
                <button className="secondary" onClick={(e) => handleDelete(e, p.id)} disabled={deletingId === p.id}>
                  {deletingId === p.id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} color="#ef4444" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
