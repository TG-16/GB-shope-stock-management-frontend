import { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { voidsApi } from '../../api/voids';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function VoidRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const toast = useToast();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await voidsApi.getVoidRequests();
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load void requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await voidsApi.approveVoidRequest(requestId);
      toast.success('Void request approved! Sale/items have been marked VOID.');
      loadRequests();
    } catch (err) {
      toast.error('Approval failed: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await voidsApi.rejectVoidRequest(requestId);
      toast.success('Void request rejected.');
      loadRequests();
    } catch (err) {
      toast.error('Rejection failed: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Sale Void Requests</h1>
        <p className="page-subtitle">Review and authorize staff requests for sale corrections and returns</p>
      </div>

      {loading ? (
        <div className="spinner-page"><div className="spinner spinner-lg" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CheckCircle size={48} className="text-success" /></div>
          <p className="empty-state-title">No pending void requests</p>
          <p className="empty-state-text">All requested sale voids have been processed.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map(req => {
            const isProcessing = processingId === req.request_id;
            const selectedSet = new Set(req.selectedItemIds || []);

            return (
              <div key={req.request_id} className="card">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semi text-base">Request #{req.request_id}</span>
                      <span className="badge badge-pending">PENDING APPROVAL</span>
                      <span className={`badge ${req.void_type === 'FULL_SALE' ? 'badge-danger' : 'badge-credit'}`}>
                        {req.void_type === 'FULL_SALE' ? 'Full Sale Void' : 'Partial Item Void'}
                      </span>
                    </div>
                    <div className="text-sm text-muted">
                      Requested by <strong className="text-body">{req.requester_name}</strong> · {formatDateTime(req.created_at)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    Original Sale #{req.sale_id} ({formatDateTime(req.sale_date)})
                  </div>
                </div>

                {/* Reason */}
                <div className="p-3 mb-3 rounded" style={{ background: 'var(--color-bg-alt)', borderLeft: '4px solid var(--color-warning)' }}>
                  <div className="text-xs text-muted uppercase font-bold tracking-wider mb-1">Staff Reason:</div>
                  <div className="text-sm">{req.reason}</div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Affected Items:</div>
                  <div className="flex flex-col gap-2">
                    {req.items && req.items.map(item => {
                      const isTarget = req.void_type === 'FULL_SALE' || selectedSet.has(item.item_id);
                      return (
                        <div
                          key={item.item_id}
                          className="flex items-center justify-between p-2 rounded text-sm"
                          style={{
                            background: isTarget ? 'var(--color-danger-light)' : 'var(--color-surface)',
                            border: `1px solid ${isTarget ? 'var(--color-danger)' : 'var(--color-border-light)'}`
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {isTarget ? (
                              <RotateCcw size={16} className="text-danger" />
                            ) : (
                              <ShoppingCart size={16} className="text-muted" />
                            )}
                            <span className={isTarget ? 'font-semi text-danger' : ''}>
                              {item.product_name} × {item.quantity} {item.unit}
                            </span>
                            {isTarget && (
                              <span className="badge badge-sm badge-void">To Void</span>
                            )}
                          </div>
                          <span className="font-mono">
                            {formatCurrency(item.quantity * item.selling_price)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                  <button
                    className="btn btn-sm btn-secondary flex items-center gap-1"
                    onClick={() => handleReject(req.request_id)}
                    disabled={isProcessing}
                  >
                    <XCircle size={16} /> Reject Request
                  </button>
                  <button
                    className="btn btn-sm btn-danger flex items-center gap-1"
                    onClick={() => handleApprove(req.request_id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="spinner spinner-sm" />
                    ) : (
                      <>
                        <CheckCircle size={16} /> Approve & Void
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
