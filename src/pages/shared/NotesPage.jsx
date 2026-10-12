import { useState, useEffect } from 'react';
import { NotebookPen, Send, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { notesApi } from '../../api/notes';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime, getToday, getDaysAgo } from '../../utils/formatters';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('today'); // today, week, all, custom
  const [customRange, setCustomRange] = useState({ from: getToday(), to: getToday() });
  const toast = useToast();

  const loadNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterPeriod === 'today') {
        params.date = getToday();
      } else if (filterPeriod === 'week') {
        params.from = getDaysAgo(7);
        params.to = getToday();
      } else if (filterPeriod === 'custom') {
        params.from = customRange.from;
        params.to = customRange.to;
      }
      const data = await notesApi.getAll(params);
      setNotes(data);
    } catch (err) {
      toast.error('Failed to load notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [filterPeriod]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) {
      toast.error('Please write something in your note.');
      return;
    }

    setSubmitting(true);
    try {
      await notesApi.create(newContent.trim());
      toast.success('Note added successfully!');
      setNewContent('');
      loadNotes();
    } catch (err) {
      toast.error('Failed to save note: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    if (role === 'SUPER_ADMIN') {
      return { background: 'var(--color-purple-light, rgba(168, 85, 247, 0.15))', color: '#9333ea', border: '1px solid rgba(168, 85, 247, 0.3)' };
    }
    if (role === 'ADMIN') {
      return { background: 'var(--color-info-light)', color: 'var(--color-info)', border: '1px solid var(--color-info)' };
    }
    return { background: 'var(--color-success-light)', color: 'var(--color-success)', border: '1px solid var(--color-success)' };
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Daily Notes & Logs</h1>
        <p className="page-subtitle">Record daily handover notes, customer requests, and shop logs</p>
      </div>

      {/* Add Note Section */}
      <div className="card mb-6" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <NotebookPen size={20} className="text-accent" />
            <h2 className="text-base font-semi m-0">Write a Note</h2>
          </div>
          <span className="text-xs text-muted">
            Auto-dated: <strong>{getToday()}</strong>
          </span>
        </div>

        <form onSubmit={handleCreateNote}>
          <div className="mb-3">
            <textarea
              className="form-input"
              rows={3}
              placeholder="Record any shop activity, customer return, supplier communication, or shift handover notes..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              disabled={submitting}
              style={{ resize: 'vertical', minHeight: '80px', width: '100%' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted">
              Posting as: <strong className="text-body">{user?.fullName}</strong> ({user?.role})
            </span>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={submitting || !newContent.trim()}
            >
              {submitting ? (
                <span className="spinner spinner-sm" />
              ) : (
                <>
                  <Send size={16} /> Post Note
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar mb-4">
        <div className="flex gap-2">
          {['today', 'week', 'all', 'custom'].map((p) => (
            <button
              key={p}
              className={`btn btn-sm ${filterPeriod === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterPeriod(p)}
              style={{ textTransform: 'capitalize' }}
            >
              {p === 'week' ? 'Past 7 Days' : p === 'all' ? 'All Notes' : p}
            </button>
          ))}
        </div>

        {filterPeriod === 'custom' && (
          <div className="flex items-center gap-2 mt-2 w-full">
            <input
              type="date"
              className="form-input"
              value={customRange.from}
              onChange={(e) => setCustomRange((c) => ({ ...c, from: e.target.value }))}
            />
            <span className="text-muted text-xs">to</span>
            <input
              type="date"
              className="form-input"
              value={customRange.to}
              onChange={(e) => setCustomRange((c) => ({ ...c, to: e.target.value }))}
            />
            <button className="btn btn-sm btn-primary" onClick={loadNotes}>
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><MessageSquare size={48} /></div>
          <p className="empty-state-title">No notes found</p>
          <p className="empty-state-text">
            {filterPeriod === 'today' ? "No notes recorded today yet. Write one above!" : "Try selecting a broader date range."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div key={note.id} className="card" style={{ transition: 'box-shadow 0.2s' }}>
              <div className="flex items-center justify-between mb-2 pb-2" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-muted" />
                  <span className="font-semi text-sm">{note.author_name}</span>
                  <span
                    className="badge text-xs"
                    style={getRoleBadgeStyle(note.author_role)}
                  >
                    {note.author_role}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Clock size={14} />
                  <span>{formatDateTime(note.created_at)}</span>
                </div>
              </div>
              <div
                className="text-sm text-body"
                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}
              >
                {note.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
