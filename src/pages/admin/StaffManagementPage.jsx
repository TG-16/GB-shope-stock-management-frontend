import { useState, useEffect } from 'react';
import { Users, Plus, Check, X, ShieldAlert } from 'lucide-react';
import { staffApi } from '../../api/staff';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', phone: '' });
  const [saving, setSaving] = useState(false);

  // Status Change State
  const [confirmAction, setConfirmAction] = useState(null); // { id, newStatus, name }
  const [statusLoading, setStatusLoading] = useState(false);

  const toast = useToast();

  const load = async () => {
    try { setStaffList(await staffApi.getAll()); }
    catch { toast.error('Failed to load staff list'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ username: '', password: '', fullName: '', phone: '' });
    setShowForm(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.fullName) {
      toast.error('Username, password, and full name are required');
      return;
    }
    setSaving(true);
    try {
      await staffApi.register({
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim()
      });
      toast.success('Staff account created successfully!');
      resetForm();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!confirmAction) return;
    setStatusLoading(true);
    try {
      await staffApi.updateStatus(confirmAction.id, confirmAction.newStatus);
      toast.success(`Staff account ${confirmAction.newStatus.toLowerCase()} successfully`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStatusLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header flex justify-between items-start">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage shop employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add
        </button>
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : staffList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={48} /></div>
          <p className="empty-state-title">No staff members</p>
          <p className="empty-state-text">Add your first staff member to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {staffList.map(staff => {
            const isActive = staff.status === 'ACTIVE';
            return (
              <div key={staff.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semi">{staff.full_name}</span>
                      <span className={`badge ${isActive ? 'badge-active' : 'badge-rejected'}`}>
                        {staff.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted">@{staff.username}</div>
                    {staff.phone && <div className="text-sm text-muted mt-1">{staff.phone}</div>}
                  </div>
                  <div>
                    {isActive ? (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => setConfirmAction({ id: staff.id, newStatus: 'REVOKED', name: staff.full_name })}
                      >
                        <X size={16} /> Revoke
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => setConfirmAction({ id: staff.id, newStatus: 'ACTIVE', name: staff.full_name })}
                      >
                        <Check size={16} /> Enable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title="Register Staff">
        <form onSubmit={handleRegister}>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0900000000" />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="johndoe" autoComplete="off" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" autoComplete="new-password" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner spinner-sm" /> : 'Register'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStatusChange}
        title={confirmAction?.newStatus === 'REVOKED' ? 'Revoke Account' : 'Enable Account'}
        message={confirmAction?.newStatus === 'REVOKED' 
          ? `Are you sure you want to revoke access for ${confirmAction?.name}? They will no longer be able to log in.`
          : `Are you sure you want to enable ${confirmAction?.name}? They will regain access to the system.`
        }
        confirmText={confirmAction?.newStatus === 'REVOKED' ? 'Revoke' : 'Enable'}
        danger={confirmAction?.newStatus === 'REVOKED'}
        loading={statusLoading}
      />
    </div>
  );
}
