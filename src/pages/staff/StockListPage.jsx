import { useState, useEffect } from 'react';
import { Package, Search, AlertTriangle } from 'lucide-react';
import { productsApi } from '../../api/products';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function StockListPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Stock List</h1>
        <p className="page-subtitle">{products.length} products in inventory</p>
      </div>

      <div className="search-bar mb-5">
        <span className="search-bar-icon"><Search size={18} /></span>
        <input
          className="form-input"
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              <div key={product.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semi">{product.name}</div>
                    <div className="text-sm text-muted mt-1">{product.category} · {product.unit}</div>
                  </div>
                  {isLow && (
                    <span className="badge badge-pending">
                      <AlertTriangle size={12} /> Low
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <div className="text-xs text-muted">In Stock</div>
                    <div className="font-semi" style={{ color: isLow ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {formatNumber(product.current_stock)} {product.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Purchase Price</div>
                    <div className="font-medium">{formatCurrency(product.purchase_price)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
