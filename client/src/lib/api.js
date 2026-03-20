const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const buildUrl = (path) => `${API_BASE}${path}`;

export async function apiRequest(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}
