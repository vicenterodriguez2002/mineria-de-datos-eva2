function normalizarUrl(value) {
  const s = String(value || '').trim().replace(/\/$/, '');
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `http://${s}`;
}

export function getBackendBase() {
  return normalizarUrl(
    process.env.API_URL ||
      process.env.DIAGNOSTICO_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      ''
  );
}

export const API_CONFIG = {
  get baseUrl() {
    return getBackendBase();
  },

  get isMockMode() {
    return !getBackendBase();
  },

  timeoutMs: 8000,
  umbralDefecto: 0.273,

  backend: {
    health: '/health',
    diagnostico: '/diagnosticos_metricas',
    clientes: '/clientes',
    stats: '/stats',
  },

  local: {
    health: '/api/health',
    diagnostico: '/api/diagnostico',
    clientes: '/api/clientes',
    evaluar: '/api/evaluar',
    resultado: '/api/resultado',
  },
};
