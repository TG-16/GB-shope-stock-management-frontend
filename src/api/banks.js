import { apiGet, apiPost } from './client';

export const banksApi = {
  getAll: () => apiGet('/api/banks'),
  create: (name) => apiPost('/api/banks', { name }),
};
