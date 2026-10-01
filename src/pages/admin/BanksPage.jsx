import { useState, useEffect } from 'react';
import { Landmark, Plus } from 'lucide-react';
import { banksApi } from '../../api/banks';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';

export default function BanksPage() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    try { setBanks(await banksApi.getAll()); }
    catch { toast.error('Failed to load banks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Bank name is required');
      return;
    }
    setSaving(true);
    try {
      await banksApi.create(name.trim());
      toast.success('Bank added successfully!');
      setName('');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header flex justify-between items-start">
        <div>
          <h1 className="page-title">Banks</h1>
          <p className="page-subtitle">Manage bank accounts for daily reports</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add
        </button>
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : banks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Landmark size={48} /></div>
          <p className="empty-state-title">No banks added</p>
          <p className="empty-state-text">Add your first bank to allow staff to submit daily deposit reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {banks.map(bank => (
            <div key={bank.id} className="card flex flex-col items-center justify-center p-6 text-center gap-2">
              <Landmark size={32} color="var(--color-accent)" />
              <div className="font-medium mt-2">{bank.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bank Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setName(''); }} title="Add Bank">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input 
                className="form-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Commercial Bank of Ethiopia (CBE)" 
                autoFocus 
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setName(''); }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner spinner-sm" /> : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
