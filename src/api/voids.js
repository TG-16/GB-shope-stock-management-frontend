import { apiGet, apiPost, apiPut } from './client';

export const voidsApi = {
  // Staff submits a void request (either full sale or specific items)
  requestVoid: ({ saleId, voidType = 'FULL_SALE', itemIds = [], reason }) =>
    apiPost('/api/voids/requests', { saleId, voidType, itemIds, reason }),

  // Admin views pending void requests
  getVoidRequests: () => apiGet('/api/voids/requests'),

  // Admin approves void request
  approveVoidRequest: (requestId) => apiPut(`/api/voids/requests/${requestId}/approve`),

  // Admin rejects void request
  rejectVoidRequest: (requestId) => apiPut(`/api/voids/requests/${requestId}/reject`),

  // Staff direct same-day void (own sale only)
  staffDirectVoid: (saleId, reason) => apiPut(`/api/voids/direct/${saleId}`, { reason }),

  // Admin direct void (any sale, any date, full or item-level)
  adminDirectVoid: (saleId, { voidType = 'FULL_SALE', itemIds = [], reason } = {}) =>
    apiPut(`/api/voids/admin-direct/${saleId}`, { voidType, itemIds, reason })
};
