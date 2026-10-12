import { apiGet, apiPost } from './client';

export const notesApi = {
  create: (content) => apiPost('/api/notes', { content }),

  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.set('date', params.date);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const qs = query.toString();
    return apiGet(`/api/notes${qs ? `?${qs}` : ''}`);
  }
};
