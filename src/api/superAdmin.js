import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const superAdminApi = {
  getUsers: () => apiGet('/api/super-admin/users'),
  registerUser: (data) => apiPost('/api/super-admin/users', data),
  updateUser: (id, data) => apiPut(`/api/super-admin/users/${id}`, data),
  changePassword: (id, newPassword) => apiPut(`/api/super-admin/users/${id}/password`, { newPassword }),
  deleteUser: (id) => apiDelete(`/api/super-admin/users/${id}`),
  forceDeleteSale: (saleId) => apiDelete(`/api/super-admin/sales/${saleId}`),
};
