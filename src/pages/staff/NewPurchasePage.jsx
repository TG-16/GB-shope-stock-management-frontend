import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { productsApi } from '../../api/products';
import { purchasesApi } from '../../api/purchases';
import { useToast } from '../../components/ui/Toast';
import { formatNumber } from '../../utils/formatters';

export default function NewPurchasePage() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try { setProducts(await productsApi.getAll()); }
      catch { toast.error('Failed to load products'); }
    };
    load();
  }, []);

  const selectedProduct = products.find(p => p.id === Number(productId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || !purchasePrice) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await purchasesApi.create({
        productId: Number(productId),
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
      });
      toast.success('Purchase request submitted!');
      setProductId('');
      setQuantity('');
      setPurchasePrice('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">New Purchase Request</h1>
        <p className="page-subtitle">Request stock purchase for approval</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Product</label>
            <select className="form-select" value={productId} onChange={e => {
              setProductId(e.target.value);
              const p = products.find(p => p.id === Number(e.target.value));
              if (p) setPurchasePrice(p.purchase_price);
            }}>
              <option value="">Select product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {formatNumber(p.current_stock)} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Quantity {selectedProduct ? `(${selectedProduct.unit})` : ''}
            </label>
            <input
              className="form-input"
              type="number"
              step={selectedProduct?.unit === 'meter' ? '0.5' : '1'}
              min="0"
              placeholder="Enter quantity"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Purchase Price (ETB per unit)</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : <><Send size={20} /> Submit Request</>}
          </button>
        </div>
      </form>
    </div>
  );
}
