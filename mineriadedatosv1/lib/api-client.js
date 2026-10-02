/**
 * Cliente HTTP único de la app.
 * - Siempre llama a los proxy internos `/api/*` (evita CORS).
 * - Los proxy deciden si reenvían al backend real o devuelven mock.
 * - Timeout + manejo de errores uniforme.
 */

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetch(path, { method = 'GET', body, headers = {}, cache } = {}) {
  let res;
  try {
    res = await fetchWithTimeout(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(cache ? { cache } : {}),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError('La petición tardó demasiado (timeout). Intenta de nuevo.', { status: 408 });
    }
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', { status: 0 });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.error || data?.message || `Error ${res.status} en ${path}`;
    throw new ApiError(message, { status: res.status, payload: data });
  }

  return data;
}

// ── Atajos tipados (contrato interno /api/*) ────────────────────────────────

export function getDiagnostico() {
  return apiFetch('/api/diagnostico', { cache: 'no-store' });
}

export function getClientes() {
  return apiFetch('/api/clientes');
}

export function getCliente(id) {
  return apiFetch(`/api/clientes?id=${encodeURIComponent(id)}`);
}

export function evaluarCliente(payload) {
  return apiFetch('/api/evaluar', { method: 'POST', body: payload });
}

export function getResultado(id) {
  const qs = id ? `?id=${encodeURIComponent(id)}` : '';
  return apiFetch(`/api/resultado${qs}`);
}

export function checkHealth() {
  return apiFetch('/api/health');
}
