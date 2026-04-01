const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const buildUrl = (path) => `${API_BASE}${path}`;

export async function apiRequest(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data?.message || 'Request failed');
    err.status = response.status;
    err.code = data?.code;
    err.details = data?.details;
    throw err;
  }

  return data;
}