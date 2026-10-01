import { apiGet } from './client';

export const reportsApi = {
  getDashboardStats: () => apiGet('/api/reports/dashboard-stats'),

  getSummary: (params = {}) => {
    const query = new URLSearchParams();
    if (params.period) query.set('period', params.period);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const qs = query.toString();
    return apiGet(`/api/reports/summary${qs ? `?${qs}` : ''}`);
  },
};
