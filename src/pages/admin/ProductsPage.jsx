import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, AlertTriangle } from 'lucide-react';
import { productsApi } from '../../api/products';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', purchase_price: '', initial_stock: '', minimum_stock: '', unit: 'pce' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    try { setProducts(await productsApi.getAll()); }
    catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: '', category: '', purchase_price: '', initial_stock: '', minimum_stock: '', unit: 'pce' });
    setEditProduct(null);
    setShowForm(false);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, category: p.category,
      purchase_price: p.purchase_price, initial_stock: '',
      minimum_stock: p.minimum_stock, unit: p.unit
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.purchase_price || !form.minimum_stock) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await productsApi.update(editProduct.id, {
          name: form.name, category: form.category,
          purchase_price: Number(form.purchase_price),
          minimum_stock: Number(form.minimum_stock), unit: form.unit
        });
        toast.success('Product updated!');
      } else {
        if (!form.initial_stock && form.initial_stock !== 0) {
          toast.error('Initial stock is required for new products');
          setSaving(false);
          return;
        }
        await productsApi.create({
          name: form.name, category: form.category,
          purchase_price: Number(form.purchase_price),
          initial_stock: Number(form.initial_stock),
          minimum_stock: Number(form.minimum_stock), unit: form.unit
        });
        toast.success('Product created!');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter(p => Number(p.current_stock) <= Number(p.minimum_stock)).length;

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">{products.length} products {lowStockCount > 0 && `· ${lowStockCount} low stock`}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      <div className="search-bar mb-5">
        <span className="search-bar-icon"><Search size={18} /></span>
        <input className="form-input" type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Package size={48} /></div>
          <p className="empty-state-title">No products found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(product => {
            const isLow = Number(product.current_stock) <= Number(product.minimum_stock);
            return (
              <div key={product.id} className="card card-interactive">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semi">{product.name}</span>
                      {isLow && <span className="badge badge-pending"><AlertTriangle size={10} /> Low</span>}
                    </div>
                    <div className="text-sm text-muted mt-1">{product.category} · {product.unit}</div>
                  </div>
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => openEdit(product)}>
                    <Edit size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <div>
                    <span className="text-muted">Stock: </span>
                    <strong style={{ color: isLow ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {formatNumber(product.current_stock)}
                    </strong>
                    <span className="text-muted"> / min {formatNumber(product.minimum_stock)}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(product.purchase_price)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title={editProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Solar Panel 200W" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Panels" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="form-label">Purchase Price</label>
                <input className="form-input" type="number" step="0.01" value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                  <option value="pce">Piece (pce)</option>
                  <option value="meter">Meter</option>
                </select>
              </div>
            </div>
            {!editProduct && (
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input className="form-input" type="number" step="0.01" value={form.initial_stock} onChange={e => setForm(f => ({ ...f, initial_stock: e.target.value }))} placeholder="0" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Minimum Stock (low stock alert)</label>
              <input className="form-input" type="number" step="0.01" value={form.minimum_stock} onChange={e => setForm(f => ({ ...f, minimum_stock: e.target.value }))} placeholder="0" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner spinner-sm" /> : editProduct ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
