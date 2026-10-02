import { jsonMock } from '@/lib/server';
import { obtener_diagnostico_completo } from './datos';

/**
 * GET /api/diagnostico
 * Toda la lógica vive en ./datos.js: intenta el backend real
 * (GET {BACKEND}/diagnosticos_metricas) con fetch, mapea al formato
 * del front y, si falla, devuelve el contenido fijo de respaldo.
 * Respuesta: { source: 'api'|'mock', ...resumen, kpis[], clusters[] }
 */
export async function GET() {
  const data = await obtener_diagnostico_completo();
  return jsonMock(data);
}
