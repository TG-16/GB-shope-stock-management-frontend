const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gb-shope-stock-management-backend.onrender.com';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — auto-logout if token expired
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data;
}

export function apiGet(endpoint) {
  return apiFetch(endpoint, { method: 'GET' });
}

export function apiPost(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiPut(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function apiPatch(endpoint, body) {
  return apiFetch(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: 'DELETE' });
}
