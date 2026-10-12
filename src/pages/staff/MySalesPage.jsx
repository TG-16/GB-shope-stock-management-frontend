import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronDown, ChevronUp, RotateCcw, AlertTriangle, AlertCircle, Ban, Layers, Check } from 'lucide-react';
import { salesApi } from '../../api/sales';
import { voidsApi } from '../../api/voids';
import { useToast } from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import { formatCurrency, formatDateTime, formatStatus, getStatusBadgeClass, getToday, getDaysAgo } from '../../utils/formatters';

export default function MySalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState({ from: getToday(), to: getToday(), status: '' });
  const toast = useToast();

  // Direct void modal state (same-day)
  const [directVoidModal, setDirectVoidModal] = useState({ isOpen: false, saleId: null, reason: '' });
  const [directVoidLoading, setDirectVoidLoading] = useState(false);

  // Void request modal state (past days or partial)
  const [requestModal, setRequestModal] = useState({
    isOpen: false,
    sale: null,
    voidType: 'FULL_SALE',
    selectedItemIds: [],
    reason: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);

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

  // --- Same-day direct void execution ---
  const handleConfirmDirectVoid = async () => {
    if (!directVoidModal.reason.trim()) {
      toast.error('Please enter a reason for voiding.');
      return;
    }
    setDirectVoidLoading(true);
    try {
      await voidsApi.staffDirectVoid(directVoidModal.saleId, directVoidModal.reason.trim());
      toast.success('Sale voided successfully.');
      setDirectVoidModal({ isOpen: false, saleId: null, reason: '' });
      loadSales();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDirectVoidLoading(false);
    }
  };

  // --- Past-day or item-level void request submission ---
  const handleOpenRequestModal = (sale) => {
    setRequestModal({
      isOpen: true,
      sale,
      voidType: 'FULL_SALE',
      selectedItemIds: [],
      reason: ''
    });
  };

  const toggleItemSelection = (itemId) => {
    setRequestModal(prev => {
      const exists = prev.selectedItemIds.includes(itemId);
      return {
        ...prev,
        selectedItemIds: exists
          ? prev.selectedItemIds.filter(id => id !== itemId)
          : [...prev.selectedItemIds, itemId]
      };
    });
  };

  const handleConfirmRequestVoid = async () => {
    if (!requestModal.reason.trim()) {
      toast.error('Please provide a reason for the void request.');
      return;
    }
    if (requestModal.voidType === 'ITEM_LEVEL' && requestModal.selectedItemIds.length === 0) {
      toast.error('Please select at least one item to void.');
      return;
    }

    setRequestLoading(true);
    try {
      await voidsApi.requestVoid({
        saleId: requestModal.sale.saleId,
        voidType: requestModal.voidType,
        itemIds: requestModal.selectedItemIds,
        reason: requestModal.reason.trim()
      });
      toast.success('Void request submitted for admin review!');
      setRequestModal({ isOpen: false, sale: null, voidType: 'FULL_SALE', selectedItemIds: [], reason: '' });
      loadSales();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const isSaleFromToday = (createdAt) => {
    if (!createdAt) return false;
    const saleDate = new Date(createdAt).toISOString().split('T')[0];
    return saleDate === getToday();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Sales</h1>
        <p className="page-subtitle">View and manage your recorded sales</p>
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
          <p className="empty-state-text">Try adjusting your filters or record a new sale.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sales.map(sale => {
            const total = sale.items.reduce((s, i) => s + (i.quantity * i.sellingPrice), 0);
            const activeTotal = sale.items
              .filter(i => !i.isVoided)
              .reduce((s, i) => s + (i.quantity * i.sellingPrice), 0);
            const isExpanded = expandedId === sale.saleId;
            const isToday = isSaleFromToday(sale.createdAt);
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
                        <span className="badge badge-warning">Void Pending</span>
                      )}
                      {sale.pendingRequestId && (
                        <span className="badge badge-info">Credit Payoff Pending</span>
                      )}
                    </div>
                    <div className="text-sm text-muted">{formatDateTime(sale.createdAt)}</div>
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

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                      {sale.status === 'CREDIT' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={(e) => { e.stopPropagation(); handleRequestCreditPayment(sale.saleId); }}
                          disabled={!!sale.pendingRequestId}
                        >
                          {sale.pendingRequestId ? 'Payment Requested' : 'Request Credit Payment'}
                        </button>
                      )}

                      {!isVoid && (
                        <>
                          {isToday ? (
                            <button
                              className="btn btn-sm btn-danger flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDirectVoidModal({ isOpen: true, saleId: sale.saleId, reason: '' });
                              }}
                            >
                              <RotateCcw size={14} /> Void Sale (Today)
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-secondary flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRequestModal(sale);
                              }}
                              disabled={!!sale.pendingVoidRequestId}
                            >
                              <RotateCcw size={14} />
                              {sale.pendingVoidRequestId ? 'Void Request Pending' : 'Request Void / Return'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Void Modal (Same-day) */}
      <Modal
        isOpen={directVoidModal.isOpen}
        onClose={() => setDirectVoidModal({ isOpen: false, saleId: null, reason: '' })}
        title={`Void Today's Sale #${directVoidModal.saleId}`}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleConfirmDirectVoid(); }}>
          <div className="flex flex-col gap-4">
            <div className="info-callout">
              <AlertCircle size={18} className="text-danger flex-shrink-0 mt-0.5" />
              <div>
                This will immediately mark Sale #{directVoidModal.saleId} as <strong>VOID</strong> and exclude it from daily reports and revenue.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Reason for Void <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder="e.g. Mistaken price, duplicate entry, customer cancelled..."
                value={directVoidModal.reason}
                onChange={(e) => setDirectVoidModal(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDirectVoidModal({ isOpen: false, saleId: null, reason: '' })}
                disabled={directVoidLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={directVoidLoading || !directVoidModal.reason.trim()}
              >
                {directVoidLoading ? <span className="spinner spinner-sm" /> : 'Confirm Void'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Past-day / Item-level Void Request Modal */}
      <Modal
        isOpen={requestModal.isOpen}
        onClose={() => setRequestModal({ isOpen: false, sale: null, voidType: 'FULL_SALE', selectedItemIds: [], reason: '' })}
        title={`Request Void for Sale #${requestModal.sale?.saleId}`}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleConfirmRequestVoid(); }}>
          <div className="flex flex-col gap-4">
            <div className="info-callout">
              <AlertCircle size={18} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                Past-day sales or partial item returns require <strong>Admin approval</strong>. Once submitted, your administrator will review it.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Void Scope</label>
              <div className="option-card-group">
                <div
                  className={`option-card ${requestModal.voidType === 'FULL_SALE' ? 'active-danger' : ''}`}
                  onClick={() => setRequestModal(prev => ({ ...prev, voidType: 'FULL_SALE' }))}
                >
                  <div className="option-card-header">
                    <span className="option-card-title">
                      <Ban size={15} className={requestModal.voidType === 'FULL_SALE' ? 'text-danger' : 'text-muted'} />
                      Entire Sale
                    </span>
                    <span className={`custom-checkbox ${requestModal.voidType === 'FULL_SALE' ? 'checked' : ''}`}>
                      {requestModal.voidType === 'FULL_SALE' && <Check size={12} />}
                    </span>
                  </div>
                  <span className="option-card-desc">Cancel all items & entire sale</span>
                </div>

                <div
                  className={`option-card ${requestModal.voidType === 'ITEM_LEVEL' ? 'active-danger' : ''}`}
                  onClick={() => setRequestModal(prev => ({ ...prev, voidType: 'ITEM_LEVEL' }))}
                >
                  <div className="option-card-header">
                    <span className="option-card-title">
                      <Layers size={15} className={requestModal.voidType === 'ITEM_LEVEL' ? 'text-danger' : 'text-muted'} />
                      Specific Items
                    </span>
                    <span className={`custom-checkbox ${requestModal.voidType === 'ITEM_LEVEL' ? 'checked' : ''}`}>
                      {requestModal.voidType === 'ITEM_LEVEL' && <Check size={12} />}
                    </span>
                  </div>
                  <span className="option-card-desc">Partial return or exchange</span>
                </div>
              </div>
            </div>

            {requestModal.voidType === 'ITEM_LEVEL' && requestModal.sale && (
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label">Select Items Being Returned</label>
                  <span className="text-xs text-muted">
                    {requestModal.selectedItemIds.length} of {requestModal.sale.items.filter(i => !i.isVoided).length} selected
                  </span>
                </div>
                <div className="item-select-list">
                  {requestModal.sale.items.map(item => {
                    const isSelected = requestModal.selectedItemIds.includes(item.itemId);
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
                Reason for Return / Void <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                placeholder="e.g. Buyer returned Item A to exchange for Item B, customer refunded defective unit..."
                value={requestModal.reason}
                onChange={(e) => setRequestModal(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRequestModal({ isOpen: false, sale: null, voidType: 'FULL_SALE', selectedItemIds: [], reason: '' })}
                disabled={requestLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={requestLoading || !requestModal.reason.trim()}
              >
                {requestLoading ? <span className="spinner spinner-sm" /> : 'Submit for Admin Approval'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
