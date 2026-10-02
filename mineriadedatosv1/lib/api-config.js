/**
 * Config central de la API.
 * Para conectar el backend real solo debes crear `.env.local` con:
 *   NEXT_PUBLIC_API_URL=https://tu-backend.com
 *   API_URL=https://tu-backend.com          (uso servidor / proxy)
 *   API_KEY=xxxx                            (opcional, se envía como Bearer)
 *
 * Mientras no haya URL, la app usa MOCKS locales (modo demo).
 */

export const API_CONFIG = {
  // En cliente usamos NEXT_PUBLIC_API_URL. En servidor, API_URL tiene prioridad.
  get baseUrl() {
    if (typeof window === 'undefined') {
      return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
    }
    return process.env.NEXT_PUBLIC_API_URL || '';
  },

  get apiKey() {
    if (typeof window === 'undefined') {
      return process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
    }
    return process.env.NEXT_PUBLIC_API_KEY || '';
  },

  get isMockMode() {
    return !this.baseUrl;
  },

  timeoutMs: 15000,

  // Contrato con el backend real (ajusta si tu API usa otras rutas):
  paths: {
    health: '/health',
    diagnostico: '/diagnostico',
    clientes: '/clientes',
    evaluar: '/evaluar',
    resultado: '/resultado',
    predecir: '/predecir',
  },

  // Umbral comercial (Z_Cost / Z_Revenue = 3 / 11)
  umbralDefecto: 0.273,
};

export function getApiBaseUrl() {
  return API_CONFIG.baseUrl.replace(/\/$/, '');
}
