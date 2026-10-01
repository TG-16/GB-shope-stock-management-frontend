import { apiGet, apiPost, apiPut } from './client';

export const salesApi = {
  create: (items, isCredit = false) => apiPost('/api/sales', { items, isCredit }),
  
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.productId) query.set('productId', params.productId);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return apiGet(`/api/sales${qs ? `?${qs}` : ''}`);
  },

  requestCreditPayment: (saleId) => apiPost('/api/sales/credit-requests', { saleId }),
  getCreditPaymentRequests: () => apiGet('/api/sales/credit-requests'),
  approveCreditPayment: (requestId) => apiPut(`/api/sales/credit-requests/${requestId}/approve`),
  rejectCreditPayment: (requestId) => apiPut(`/api/sales/credit-requests/${requestId}/reject`),
};
