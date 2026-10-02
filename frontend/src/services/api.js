const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Fotos capturadas pela câmera voltam da API como um caminho relativo (/photos/...),
// servido pelo próprio backend; links externos (https://...) já são absolutos.
export const resolvePhotoUrl = (photo) => (photo?.startsWith('/') ? `${API_URL}${photo}` : photo);

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Não foi possível conectar à API.', 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const error = payload?.error;
    throw new ApiError(
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'Erro inesperado.',
      response.status,
    );
  }
  return payload.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  health: () => request('/api/health'),

  positions: {
    list: () => request('/api/positions'),
  },

  parties: {
    list: (params) => request(`/api/parties${toQuery(params)}`),
    create: (data) => request('/api/parties', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/parties/${id}`, { method: 'PUT', body: data }),
    deactivate: (id) => request(`/api/parties/${id}`, { method: 'DELETE' }),
  },

  candidates: {
    list: (params) => request(`/api/candidates${toQuery(params)}`),
    create: (data) => request('/api/candidates', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/candidates/${id}`, { method: 'PUT', body: data }),
    deactivate: (id) => request(`/api/candidates/${id}`, { method: 'DELETE' }),
  },

  sessions: {
    list: () => request('/api/sessions'),
    get: (id) => request(`/api/sessions/${id}`),
    create: (data) => request('/api/sessions', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/sessions/${id}`, { method: 'PUT', body: data }),
    open: (id) => request(`/api/sessions/${id}/open`, { method: 'POST' }),
    finish: (id) => request(`/api/sessions/${id}/finish`, { method: 'POST' }),
  },

  votes: {
    lookup: (params) => request(`/api/votes/lookup${toQuery(params)}`),
    create: (data) => request('/api/votes', { method: 'POST', body: data }),
  },

  results: {
    get: (sessionId) => request(`/api/sessions/${sessionId}/results`),
  },

  audit: {
    get: (sessionId) => request(`/api/sessions/${sessionId}/audit`),
  },
};
