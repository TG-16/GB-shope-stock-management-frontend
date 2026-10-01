import { apiGet, apiPost } from './client';

export const dailyReportsApi = {
  getPreview: () => apiGet('/api/daily-reports/preview'),
  submit: (entries) => apiPost('/api/daily-reports', { entries }),
  getToday: () => apiGet('/api/daily-reports'),
};
