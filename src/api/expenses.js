import { apiGet, apiPost } from './client';

export const expensesApi = {
  create: (data) => apiPost('/api/expenses', data),

  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const qs = query.toString();
    return apiGet(`/api/expenses${qs ? `?${qs}` : ''}`);
  },
};
