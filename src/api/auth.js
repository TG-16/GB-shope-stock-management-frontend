import { apiPost } from './client';

export const authApi = {
  login: (username, password) => apiPost('/api/auth/login', { username, password }),
};
