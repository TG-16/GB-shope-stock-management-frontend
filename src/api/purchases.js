import { apiGet, apiPost, apiPut } from './client';

export const purchasesApi = {
  create: (data) => apiPost('/api/purchases', data),

  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.productId) query.set('productId', params.productId);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return apiGet(`/api/purchases${qs ? `?${qs}` : ''}`);
  },

  getPending: () => apiGet('/api/purchases/pending'),
  review: (id, status) => apiPut(`/api/purchases/${id}/review`, { status }),
};
