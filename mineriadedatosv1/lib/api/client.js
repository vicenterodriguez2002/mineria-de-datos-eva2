import axios from 'axios';
import { API_CONFIG } from './config';

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const http = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  try {
    const res = await http.request({ url: path, method, data: body, headers });
    return res.data;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new ApiError('La petición tardó demasiado (timeout). Intenta de nuevo.', { status: 408 });
    }
    if (err.response) {
      const data = err.response.data;
      const message = data?.error || data?.message || `Error ${err.response.status} en ${path}`;
      throw new ApiError(message, { status: err.response.status, payload: data });
    }
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', { status: 0 });
  }
}

const sinCache = { 'Cache-Control': 'no-cache' };

export function getDiagnostico() {
  return apiRequest(API_CONFIG.local.diagnostico, { headers: sinCache });
}

export function getClientes(buscar, limite = 20) {
  return apiRequest(`${API_CONFIG.local.clientes}?buscar=${encodeURIComponent(buscar)}&limite=${limite}`);
}

export function getCliente(id) {
  return apiRequest(`${API_CONFIG.local.clientes}/${encodeURIComponent(id)}`);
}

export function evaluarCliente(payload) {
  return apiRequest(API_CONFIG.local.evaluar, { method: 'POST', body: payload });
}

export function getResultado(id) {
  const qs = id ? `?id=${encodeURIComponent(id)}` : '';
  return apiRequest(`${API_CONFIG.local.resultado}${qs}`);
}

export function checkHealth() {
  return apiRequest(API_CONFIG.local.health, { headers: sinCache });
}
