import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { salesApi } from '../../api/sales';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime, formatStatus, getStatusBadgeClass, getToday, getDaysAgo } from '../../utils/formatters';

export default function MySalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState({ from: getToday(), to: getToday(), status: '' });
  const toast = useToast();

  const loadSales = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.from && filter.to) { params.from = filter.from; params.to = filter.to; }
      if (filter.status) params.status = filter.status;
      const data = await salesApi.getAll(params);
      setSales(data);
    } catch (err) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSales(); }, [filter]);

  const setDatePreset = (preset) => {
    const today = getToday();
    if (preset === 'today') setFilter(f => ({ ...f, from: today, to: today }));
    else if (preset === 'week') setFilter(f => ({ ...f, from: getDaysAgo(7), to: today }));
    else if (preset === 'month') setFilter(f => ({ ...f, from: getDaysAgo(30), to: today }));
  };

  const handleRequestCreditPayment = async (saleId) => {
    try {
      await salesApi.requestCreditPayment(saleId);
      toast.success('Credit payment request submitted!');
      loadSales();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Sales</h1>
        <p className="page-subtitle">View your recorded sales</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="flex gap-2">
          <button className="btn btn-sm btn-secondary" onClick={() => setDatePreset('today')}>Today</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setDatePreset('week')}>Week</button>
          <button className="btn btn-sm btn-secondary" onClick={() => setDatePreset('month')}>Month</button>
        </div>
        <input type="date" className="form-input" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} />
        <input type="date" className="form-input" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} />
        <select className="form-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Sales</option>
          <option value="ACTIVE">Active Sales</option>
          <option value="CREDIT">Credit Sales</option>
          <option value="CREDIT_PAID">Credit Paid</option>
          <option value="CORRECTED">Corrected</option>
        </select>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ShoppingCart size={48} /></div>
          <p className="empty-state-title">No sales found</p>
          <p className="empty-state-text">Try adjusting your filters or create a new sale.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sales.map(sale => {
            const total = sale.items.reduce((s, i) => s + (i.quantity * i.sellingPrice), 0);
            const isExpanded = expandedId === sale.saleId;
            return (
              <div key={sale.saleId} className="card">
                <div
                  className="flex items-center justify-between"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : sale.saleId)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semi">Sale #{sale.saleId}</span>
                      <span className={`badge ${getStatusBadgeClass(sale.status)}`}>
                        {formatStatus(sale.status)}
                      </span>
                    </div>
                    <div className="text-sm text-muted">{formatDateTime(sale.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semi">{formatCurrency(total)}</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4">
                    <hr className="divider" style={{ margin: '0 0 var(--space-3)' }} />
                    {sale.items.map(item => (
                      <div key={item.itemId} className="flex justify-between text-sm mb-2">
                        <span>{item.productName} × {item.quantity} {item.unit}</span>
                        <span>{formatCurrency(item.quantity * item.sellingPrice)}</span>
                      </div>
                    ))}
                    {sale.status === 'CREDIT' && (
                      <button
                        className="btn btn-sm btn-primary mt-3 btn-block"
                        onClick={(e) => { e.stopPropagation(); handleRequestCreditPayment(sale.saleId); }}
                        disabled={!!sale.pendingRequestId}
                      >
                        {sale.pendingRequestId ? 'Payment Requested' : 'Request Credit Payment'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
