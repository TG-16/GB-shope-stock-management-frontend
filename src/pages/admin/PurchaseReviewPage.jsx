import { useState, useEffect } from 'react';
import { Check, X, ClipboardList } from 'lucide-react';
import { purchasesApi } from '../../api/purchases';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function PurchaseReviewPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      setPurchases(await purchasesApi.getPending());
    } catch (err) {
      toast.error('Failed to load purchase requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (id, status) => {
    setActionLoading(id);
    try {
      await purchasesApi.review(id, status);
      toast.success(`Purchase ${status.toLowerCase()} successfully!`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Purchase Requests</h1>
        <p className="page-subtitle">{purchases.length} pending for review</p>
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : purchases.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ClipboardList size={48} /></div>
          <p className="empty-state-title">No pending requests</p>
          <p className="empty-state-text">All purchase requests have been reviewed.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {purchases.map(p => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semi">{p.product_name}</div>
                  <div className="text-sm text-muted">by {p.staff_name}</div>
                  <div className="text-xs text-muted">{formatDateTime(p.created_at)}</div>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span>Qty: <strong>{p.quantity} {p.unit}</strong></span>
                <span>Price: <strong>{formatCurrency(p.purchase_price)}</strong></span>
                <span>Total: <strong>{formatCurrency(p.quantity * p.purchase_price)}</strong></span>
              </div>
              <div className="flex gap-3">
                <button
                  className="btn btn-danger btn-sm flex-1"
                  onClick={() => handleReview(p.id, 'REJECTED')}
                  disabled={actionLoading === p.id}
                >
                  <X size={16} /> Reject
                </button>
                <button
                  className="btn btn-success btn-sm flex-1"
                  onClick={() => handleReview(p.id, 'APPROVED')}
                  disabled={actionLoading === p.id}
                >
                  {actionLoading === p.id ? <span className="spinner spinner-sm" /> : <><Check size={16} /> Approve</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
