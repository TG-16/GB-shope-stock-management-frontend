import { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react';
import { superAdminApi } from '../../api/superAdmin';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'STAFF' });
  const [saving, setSaving] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const load = async () => {
    try { setUsers(await superAdminApi.getUsers()); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ username: '', password: '', fullName: '', role: 'STAFF' });
    setEditUser(null);
    setShowForm(false);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ username: u.username, password: '', fullName: u.full_name, role: u.role });
    setShowForm(true);
  };

  const openPassword = (u) => {
    setEditUser(u);
    setPasswordForm({ newPassword: '' });
    setShowPasswordForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.fullName || (!editUser && !form.password)) {
      toast.error('Please fill in required fields');
      return;
    }
    setSaving(true);
    try {
      if (editUser) {
        await superAdminApi.updateUser(editUser.id, {
          username: form.username.trim(),
          fullName: form.fullName.trim(),
          role: form.role
        });
        toast.success('User updated successfully');
      } else {
        await superAdminApi.registerUser({
          username: form.username.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          role: form.role
        });
        toast.success('User created successfully');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      toast.error('Password is required');
      return;
    }
    setSaving(true);
    try {
      await superAdminApi.changePassword(editUser.id, passwordForm.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setEditUser(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await superAdminApi.deleteUser(deleteId);
      toast.success('User deleted permanently');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header flex justify-between items-start">
        <div>
          <h1 className="page-title">Super Admin</h1>
          <p className="page-subtitle">Complete user control and deletion</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="section">
        <h3 className="section-title">System Users</h3>
        {loading ? (
          <div className="spinner-page"><div className="spinner spinner-lg" /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map(u => (
              <div key={u.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semi">{u.full_name}</span>
                      <span className={`badge ${u.role === 'SUPER_ADMIN' ? 'badge-corrected' : u.role === 'ADMIN' ? 'badge-approved' : 'badge-pending'}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="text-sm text-muted">@{u.username}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-icon btn-secondary" title="Change Password" onClick={() => openPassword(u)}>
                      <Key size={16} />
                    </button>
                    <button className="btn btn-sm btn-icon btn-secondary" title="Edit Info" onClick={() => openEdit(u)}>
                      <Edit size={16} />
                    </button>
                    {u.role !== 'SUPER_ADMIN' && (
                      <button className="btn btn-sm btn-icon btn-danger" title="Delete User" onClick={() => setDeleteId(u.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title={editUser ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} autoComplete="off" />
            </div>
            {!editUser && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="new-password" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner spinner-sm" /> : editUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordForm} onClose={() => setShowPasswordForm(false)} title={`Change Password for ${editUser?.username}`}>
        <form onSubmit={handlePasswordSubmit}>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                className="form-input" 
                type="password" 
                value={passwordForm.newPassword} 
                onChange={e => setPasswordForm({ newPassword: e.target.value })} 
                autoComplete="new-password" 
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner spinner-sm" /> : 'Change Password'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to permanently delete this user? This action cannot be undone."
        confirmText="Delete"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}
