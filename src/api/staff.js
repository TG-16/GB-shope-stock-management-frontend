import { apiGet, apiPost, apiPatch } from './client';

export const staffApi = {
  getAll: () => apiGet('/api/staff'),
  register: (data) => apiPost('/api/staff', data),
  updateStatus: (id, status) => apiPatch(`/api/staff/${id}/status`, { status }),
};
