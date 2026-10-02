import axios from 'axios';
import { API_CONFIG, getBackendBase } from './config';

function clienteBackend() {
  const baseURL = getBackendBase();
  if (!baseURL) return null;

  const key = process.env.API_KEY || '';
  return axios.create({
    baseURL,
    timeout: API_CONFIG.timeoutMs,
    headers: {
      Accept: 'application/json',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
  });
}

export async function consultarBackend(path) {
  const client = clienteBackend();
  if (!client) {
    return { configured: false, data: null, error: null, status: 0 };
  }

  try {
    const res = await client.get(path);
    return { configured: true, data: res.data, error: null, status: res.status };
  } catch (err) {
    const status = err.response?.status || 502;
    const data = err.response?.data ?? null;
    const error =
      (data && (data.error || data.message)) ||
      (err.code === 'ECONNABORTED'
        ? 'El backend tardó demasiado.'
        : 'No se pudo alcanzar el backend. Revisa API_URL.');
    return { configured: true, data, error, status };
  }
}

export function getSalud() {
  return consultarBackend(API_CONFIG.backend.health);
}

export function getMetricasDiagnostico() {
  return consultarBackend(API_CONFIG.backend.diagnostico);
}

export function getClientes(id) {
  const qs = id ? `?id=${encodeURIComponent(id)}` : '';
  return consultarBackend(`${API_CONFIG.backend.clientes}${qs}`);
}
