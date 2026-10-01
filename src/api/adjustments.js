import { apiGet, apiPost } from './client';

export const adjustmentsApi = {
  getAll: () => apiGet('/api/adjustments'),
  create: (data) => apiPost('/api/adjustments', data),
};
