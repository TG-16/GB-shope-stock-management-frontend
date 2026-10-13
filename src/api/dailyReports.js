import { apiGet, apiPost } from './client';

export const dailyReportsApi = {
  getPreview: () => apiGet('/api/daily-reports/preview'),
  submit: (entries) => apiPost('/api/daily-reports', { entries }),
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.today) searchParams.set('today', 'true');
    if (params.date) searchParams.set('date', params.date);
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    const qs = searchParams.toString();
    return apiGet(`/api/daily-reports${qs ? `?${qs}` : ''}`);
  },
  getToday: () => apiGet('/api/daily-reports'),
};
