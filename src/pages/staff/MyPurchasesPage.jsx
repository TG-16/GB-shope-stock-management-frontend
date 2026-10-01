import { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import { purchasesApi } from '../../api/purchases';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime, formatStatus, getStatusBadgeClass } from '../../utils/formatters';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setPurchases(await purchasesApi.getAll());
      } catch (err) {
        toast.error('Failed to load purchases');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Purchases</h1>
        <p className="page-subtitle">Track your purchase requests</p>
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : purchases.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ClipboardList size={48} /></div>
          <p className="empty-state-title">No purchase requests</p>
          <p className="empty-state-text">Submit a new purchase request to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {purchases.map(p => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semi">{p.product_name}</div>
                  <div className="text-sm text-muted">{formatDateTime(p.created_at)}</div>
                </div>
                <span className={`badge ${getStatusBadgeClass(p.status)}`}>
                  {formatStatus(p.status)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-3">
                <span className="text-muted">Quantity: <strong className="text-base">{p.quantity} {p.unit}</strong></span>
                <span className="text-muted">Price: <strong className="text-base">{formatCurrency(p.purchase_price)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
