import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { salesApi } from '../../api/sales';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime, formatStatus, getStatusBadgeClass, getToday, getDaysAgo } from '../../utils/formatters';

export default function AllSalesPage() {
  const [sales, setSales] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
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

  const loadCreditRequests = async () => {
    try {
      const data = await salesApi.getCreditPaymentRequests();
      setCreditRequests(data);
    } catch { /* silent */ }
  };

  useEffect(() => { loadSales(); loadCreditRequests(); }, [filter]);

  const setDatePreset = (preset) => {
    const today = getToday();
    if (preset === 'today') setFilter(f => ({ ...f, from: today, to: today }));
    else if (preset === 'week') setFilter(f => ({ ...f, from: getDaysAgo(7), to: today }));
    else if (preset === 'month') setFilter(f => ({ ...f, from: getDaysAgo(30), to: today }));
  };

  const handleApproveCreditPayment = async (requestId) => {
    try {
      await salesApi.approveCreditPayment(requestId);
      toast.success('Credit payment approved!');
      loadCreditRequests();
      loadSales();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.items.reduce((is, i) => is + i.quantity * i.sellingPrice, 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">All Sales</h1>
        <p className="page-subtitle">View and manage all sales records</p>
      </div>

      {/* Pending Credit Requests */}
      {creditRequests.length > 0 && (
        <div className="section">
          <h3 className="section-title">Pending Credit Payments ({creditRequests.length})</h3>
          <div className="flex flex-col gap-3 mb-5">
            {creditRequests.map(req => (
              <div key={req.request_id} className="card" style={{ borderLeft: '4px solid var(--color-info)' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semi">Sale #{req.sale_id}</div>
                    <div className="text-sm text-muted">by {req.staff_name} · {formatDateTime(req.created_at)}</div>
                  </div>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleApproveCreditPayment(req.request_id)}
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <option value="">Active Sales</option>
          <option value="CREDIT">Credit</option>
          <option value="CREDIT_PAID">Credit Paid</option>
          <option value="CORRECTED">Corrected</option>
        </select>
      </div>

      {/* Summary bar */}
      {!loading && sales.length > 0 && (
        <div className="card mb-4" style={{ padding: 'var(--space-3) var(--space-5)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">{sales.length} sales</span>
            <span className="font-semi">Total: {formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      )}

      {/* Sales List */}
      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : sales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ShoppingCart size={48} /></div>
          <p className="empty-state-title">No sales found</p>
          <p className="empty-state-text">Adjust filters or wait for new sales.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sales.map(sale => {
            const total = sale.items.reduce((s, i) => s + (i.quantity * i.sellingPrice), 0);
            const isExpanded = expandedId === sale.saleId;
            return (
              <div key={sale.saleId} className="card">
                <div className="flex items-center justify-between" style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : sale.saleId)}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semi">Sale #{sale.saleId}</span>
                      <span className={`badge ${getStatusBadgeClass(sale.status)}`}>{formatStatus(sale.status)}</span>
                    </div>
                    <div className="text-sm text-muted">
                      {sale.staff?.fullName} · {formatDateTime(sale.createdAt)}
                    </div>
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
