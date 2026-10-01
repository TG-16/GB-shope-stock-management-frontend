import { apiGet, apiPost, apiPut } from './client';

export const productsApi = {
  getAll: () => apiGet('/api/products'),
  create: (data) => apiPost('/api/products', data),
  update: (id, data) => apiPut(`/api/products/${id}`, data),
};
