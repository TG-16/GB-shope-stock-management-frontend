import { useState, useEffect } from 'react';
import { SlidersHorizontal, Plus } from 'lucide-react';
import { adjustmentsApi } from '../../api/adjustments';
import { productsApi } from '../../api/products';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { formatDateTime, formatNumber } from '../../utils/formatters';

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', quantityChange: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    try {
      const [adjData, prodData] = await Promise.all([
        adjustmentsApi.getAll(),
        productsApi.getAll()
      ]);
      setAdjustments(adjData);
      setProducts(prodData);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ productId: '', quantityChange: '', reason: '' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.quantityChange || !form.reason) {
      toast.error('All fields are required');
      return;
    }
    setSaving(true);
    try {
      await adjustmentsApi.create({
        productId: Number(form.productId),
        quantityChange: Number(form.quantityChange),
        reason: form.reason
      });
      toast.success('Stock adjusted successfully');
      resetForm();
      loadData();
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
          <h1 className="page-title">Stock Adjustments</h1>
          <p className="page-subtitle">Manual inventory corrections</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New
        </button>
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : adjustments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><SlidersHorizontal size={48} /></div>
          <p className="empty-state-title">No adjustments</p>
          <p className="empty-state-text">Manual stock adjustments will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {adjustments.map(adj => {
            const isPositive = adj.quantity_change > 0;
            return (
              <div key={adj.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semi">{adj.product_name}</div>
                    <div className="text-sm text-muted">by {adj.admin_name} · {formatDateTime(adj.created_at)}</div>
                  </div>
                  <span className={`badge ${isPositive ? 'badge-active' : 'badge-rejected'}`}>
                    {isPositive ? '+' : ''}{formatNumber(adj.quantity_change)} {adj.unit}
                  </span>
                </div>
                <div className="text-sm mt-2 p-2 bg-[var(--color-surface-alt)] rounded-md">
                  <strong>Reason:</strong> {adj.reason}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Adjustment Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title="New Stock Adjustment">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Product</label>
              <select className="form-select" value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}>
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Current: {formatNumber(p.current_stock)} {p.unit})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Change (+ or -)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="e.g. -5 for missing items, 10 for found items"
                value={form.quantityChange}
                onChange={e => setForm(f => ({ ...f, quantityChange: e.target.value }))}
              />
              <span className="form-hint">Use negative numbers to decrease stock.</span>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Explain why this adjustment is being made..."
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !form.productId}>
                {saving ? <span className="spinner spinner-sm" /> : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
