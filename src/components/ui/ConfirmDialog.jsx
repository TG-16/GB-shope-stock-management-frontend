import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="confirm-dialog">
        <div className="confirm-dialog-icon">
          <AlertTriangle size={48} color={danger ? 'var(--color-danger)' : 'var(--color-warning)'} />
        </div>
        <h3 className="confirm-dialog-title">{title || 'Are you sure?'}</h3>
        {message && <p className="confirm-dialog-message">{message}</p>}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="spinner spinner-sm" /> : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
