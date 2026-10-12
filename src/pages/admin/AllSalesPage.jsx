import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronDown, ChevronUp, RotateCcw, AlertCircle, Ban, Layers, Check } from 'lucide-react';
import { salesApi } from '../../api/sales';
import { voidsApi } from '../../api/voids';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDateTime, formatStatus, getStatusBadgeClass, getToday, getDaysAgo } from '../../utils/formatters';

export default function AllSalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState({ from: getToday(), to: getToday(), status: '' });
  const [pendingVoidCount, setPendingVoidCount] = useState(0);
  const toast = useToast();

  // Admin Void Modal State
  const [adminVoidModal, setAdminVoidModal] = useState({
    isOpen: false,
    sale: null,
    voidType: 'FULL_SALE',
    selectedItemIds: [],
    reason: ''
  });
  const [adminVoidLoading, setAdminVoidLoading] = useState(false);

  const loadSales = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.from && filter.to) { params.from = filter.from; params.to = filter.to; }
      if (filter.status) params.status = filter.status;
      const data = await salesApi.getAll(params);
      setSales(data);
    } catch (err) {
      toast.error('Failed to load sales: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSales(); }, [filter]);

  useEffect(() => {
    voidsApi.getVoidRequests()
      .then(data => setPendingVoidCount(data ? data.length : 0))
      .catch(() => {});
  }, []);

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
      loadSales();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRejectCreditPayment = async (requestId) => {
    try {
      await salesApi.rejectCreditPayment(requestId);
      toast.success('Credit payment rejected!');
      loadSales();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- Admin Direct Void ---
  const handleOpenAdminVoid = (sale) => {
    setAdminVoidModal({
      isOpen: true,
      sale,
      voidType: 'FULL_SALE',
      selectedItemIds: [],
      reason: ''
    });
  };

  const toggleItemSelection = (itemId) => {
    setAdminVoidModal(prev => {
      const exists = prev.selectedItemIds.includes(itemId);
      return {
        ...prev,
        selectedItemIds: exists
          ? prev.selectedItemIds.filter(id => id !== itemId)
          : [...prev.selectedItemIds, itemId]
      };
    });
  };

  const handleConfirmAdminVoid = async () => {
    if (!adminVoidModal.reason.trim()) {
      toast.error('Please enter a reason for voiding.');
      return;
    }
    if (adminVoidModal.voidType === 'ITEM_LEVEL' && adminVoidModal.selectedItemIds.length === 0) {
      toast.error('Please select at least one item to void.');
      return;
    }

    setAdminVoidLoading(true);
    try {
      await voidsApi.adminDirectVoid(adminVoidModal.sale.saleId, {
        voidType: adminVoidModal.voidType,
        itemIds: adminVoidModal.selectedItemIds,
        reason: adminVoidModal.reason.trim()
      });
      toast.success('Sale voided successfully by Admin.');
      setAdminVoidModal({ isOpen: false, sale: null, voidType: 'FULL_SALE', selectedItemIds: [], reason: '' });
      loadSales();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdminVoidLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, s) => {
    if (s.status === 'VOID') return sum;
    const saleActiveItems = s.items.filter(i => !i.isVoided);
    return sum + saleActiveItems.reduce((is, i) => is + (i.quantity * i.sellingPrice), 0);
  }, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">All Sales</h1>
        <p className="page-subtitle">View, manage, and correct all shop sales records</p>
      </div>

      {/* Sub-nav switcher between All Sales and Void Requests */}
      <div className="subnav-tabs mb-4">
        <Link to="/sales/all" className="subnav-tab active">
          <ShoppingCart size={16} />
          <span>All Sales</span>
        </Link>
        <Link to="/sales/void-requests" className="subnav-tab">
          <RotateCcw size={16} />
          <span>Void Requests</span>
          {pendingVoidCount > 0 && (
            <span className="badge-count badge-danger">{pendingVoidCount}</span>
          )}
        </Link>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="filter-pills mb-3">
        <button
          type="button"
          className={`filter-pill ${filter.status === '' ? 'active' : ''}`}
          onClick={() => setFilter(f => ({ ...f, status: '' }))}
        >
          All Sales
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.status === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setFilter(f => ({ ...f, status: 'ACTIVE' }))}
        >
          Active Sales
        </button>
        <button
          type="button"
          className={`filter-pill pill-void ${filter.status === 'VOID' ? 'active' : ''}`}
          onClick={() => setFilter(f => ({ ...f, status: 'VOID' }))}
        >
          <RotateCcw size={13} />
          Voided Sales
        </button>
        <button
          type="button"
          className={`filter-pill ${filter.status === 'CREDIT' ? 'active' : ''}`}
          onClick={() => setFilter(f => ({ ...f, status: 'CREDIT' }))}
        >
          Credit Sales
        </button>
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
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Sales</option>
          <option value="VOID">Voided Sales</option>
          <option value="CREDIT">Credit</option>
          <option value="CREDIT_PAID">Credit Paid</option>
          <option value="CORRECTED">Corrected</option>
        </select>
      </div>

      {/* Summary bar */}
      {!loading && sales.length > 0 && (
        <div className="card mb-4" style={{ padding: 'var(--space-3) var(--space-5)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">{sales.length} sales listed</span>
            <span className="font-semi">Active Net Sales: {formatCurrency(totalRevenue)}</span>
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
          <p className="empty-state-text">Adjust filters or wait for staff to record sales.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sales.map(sale => {
            const total = sale.items.reduce((s, i) => s + (i.quantity * i.sellingPrice), 0);
            const isExpanded = expandedId === sale.saleId;
            const isVoid = sale.status === 'VOID';

            return (
              <div key={sale.saleId} className="card" style={{ opacity: isVoid ? 0.75 : 1 }}>
                <div
                  className="flex items-center justify-between"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : sale.saleId)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semi">Sale #{sale.saleId}</span>
                      <span className={`badge ${getStatusBadgeClass(sale.status)}`}>
                        {formatStatus(sale.status)}
                      </span>
                      {sale.pendingVoidRequestId && (
                        <span className="badge badge-warning">Void Requested</span>
                      )}
                      {sale.pendingRequestId && (
                        <span className="badge badge-info">Credit Payoff Requested</span>
                      )}
                    </div>
                    <div className="text-sm text-muted">
                      {sale.staff?.fullName} · {formatDateTime(sale.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semi ${isVoid ? 'text-muted' : ''}`} style={isVoid ? { textDecoration: 'line-through' } : {}}>
                      {formatCurrency(total)}
                    </span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4">
                    <hr className="divider" style={{ margin: '0 0 var(--space-3)' }} />
                    <div className="flex flex-col gap-2 mb-3">
                      {sale.items.map(item => (
                        <div
                          key={item.itemId}
                          className={`flex justify-between items-center text-sm ${item.isVoided ? 'item-voided' : ''}`}
                        >
                          <div>
                            <span>{item.productName} × {item.quantity} {item.unit}</span>
                            {item.isVoided && (
                              <span className="badge badge-void ml-2" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                Voided
                              </span>
                            )}
                          </div>
                          <span className="font-mono">
                            {formatCurrency(item.quantity * item.sellingPrice)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Pending Credit Approval */}
                    {sale.pendingRequestId && (
                      <div className="flex gap-2 mb-3 p-3 rounded" style={{ background: 'var(--color-bg-alt)' }}>
                        <div className="flex-1 font-medium text-sm text-info flex items-center">
                          Credit Payment Approval Requested by Staff
                        </div>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => { e.stopPropagation(); handleRejectCreditPayment(sale.pendingRequestId); }}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={(e) => { e.stopPropagation(); handleApproveCreditPayment(sale.pendingRequestId); }}
                        >
                          Approve
                        </button>
                      </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                      {!isVoid && (
                        <button
                          className="btn btn-sm btn-danger flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAdminVoid(sale);
                          }}
                        >
                          <RotateCcw size={14} /> Void / Correct Sale (Admin)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Void Modal */}
      <Modal
        isOpen={adminVoidModal.isOpen}
        onClose={() => setAdminVoidModal({ isOpen: false, sale: null, voidType: 'FULL_SALE', selectedItemIds: [], reason: '' })}
        title={`Admin Void for Sale #${adminVoidModal.sale?.saleId}`}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleConfirmAdminVoid(); }}>
          <div className="flex flex-col gap-4">
            <div className="info-callout">
              <AlertCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                Voided items are permanently excluded from revenue and financial reports. To balance physical inventory, visit <strong>Stock Adjustments</strong>.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Void Scope</label>
              <div className="option-card-group">
                <div
                  className={`option-card ${adminVoidModal.voidType === 'FULL_SALE' ? 'active-danger' : ''}`}
                  onClick={() => setAdminVoidModal(prev => ({ ...prev, voidType: 'FULL_SALE' }))}
                >
                  <div className="option-card-header">
                    <span className="option-card-title">
                      <Ban size={15} className={adminVoidModal.voidType === 'FULL_SALE' ? 'text-danger' : 'text-muted'} />
                      Entire Sale
                    </span>
                    <span className={`custom-checkbox ${adminVoidModal.voidType === 'FULL_SALE' ? 'checked' : ''}`}>
                      {adminVoidModal.voidType === 'FULL_SALE' && <Check size={12} />}
                    </span>
                  </div>
                  <span className="option-card-desc">Cancel all items & entire sale</span>
                </div>

                <div
                  className={`option-card ${adminVoidModal.voidType === 'ITEM_LEVEL' ? 'active-danger' : ''}`}
                  onClick={() => setAdminVoidModal(prev => ({ ...prev, voidType: 'ITEM_LEVEL' }))}
                >
                  <div className="option-card-header">
                    <span className="option-card-title">
                      <Layers size={15} className={adminVoidModal.voidType === 'ITEM_LEVEL' ? 'text-danger' : 'text-muted'} />
                      Specific Items
                    </span>
                    <span className={`custom-checkbox ${adminVoidModal.voidType === 'ITEM_LEVEL' ? 'checked' : ''}`}>
                      {adminVoidModal.voidType === 'ITEM_LEVEL' && <Check size={12} />}
                    </span>
                  </div>
                  <span className="option-card-desc">For partial returns or exchange</span>
                </div>
              </div>
            </div>

            {adminVoidModal.voidType === 'ITEM_LEVEL' && adminVoidModal.sale && (
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label">Select Items to Void</label>
                  <span className="text-xs text-muted">
                    {adminVoidModal.selectedItemIds.length} of {adminVoidModal.sale.items.filter(i => !i.isVoided).length} selected
                  </span>
                </div>
                <div className="item-select-list">
                  {adminVoidModal.sale.items.map(item => {
                    const isSelected = adminVoidModal.selectedItemIds.includes(item.itemId);
                    return (
                      <div
                        key={item.itemId}
                        className={`item-select-card ${isSelected ? 'selected' : ''} ${item.isVoided ? 'disabled' : ''}`}
                        onClick={() => {
                          if (!item.isVoided) toggleItemSelection(item.itemId);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
                            {isSelected && <Check size={12} />}
                          </span>
                          <div>
                            <div className={`text-sm ${item.isVoided ? 'text-muted' : 'font-medium'}`}>
                              {item.productName} × {item.quantity} {item.unit}
                            </div>
                            {item.isVoided && (
                              <span className="badge badge-sm badge-void mt-1">Already Voided</span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-sm">
                          {formatCurrency(item.quantity * item.sellingPrice)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Audit Reason <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder="e.g. Customer returned product for exchange, refund issued, system entry mistake..."
                value={adminVoidModal.reason}
                onChange={(e) => setAdminVoidModal(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAdminVoidModal({ isOpen: false, sale: null, voidType: 'FULL_SALE', selectedItemIds: [], reason: '' })}
                disabled={adminVoidLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={adminVoidLoading || !adminVoidModal.reason.trim()}
              >
                {adminVoidLoading ? <span className="spinner spinner-sm" /> : 'Confirm Direct Void'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
