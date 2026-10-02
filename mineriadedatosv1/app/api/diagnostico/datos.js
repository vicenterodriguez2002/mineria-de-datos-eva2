/**
 * Diagnóstico de campaña.
 * Cada función intenta primero el backend real (Flask) con fetch y,
 * si no responde, devuelve el contenido FIJO de respaldo (mismo formato).
 * Solo datos (sin JSX). El front no se toca.
 *
 * Backend real: GET {BACKEND_URL}/diagnosticos_metricas →
 * { base_historica, costo_global, deficit_sin_segmentar, desbalance,
 *   ingreso_global, punto_equilibrio, tasa_aceptacion, total_columnas,
 *   total_compradores, total_rechazos }
 */

function normalizar_url(v) {
  const s = (v || '').trim().replace(/\/$/, '');
  if (!s) return '';
  return /^https?:\/\//i.test(s) ? s : `http://${s}`;
}

const BACKEND_URL =
  normalizar_url(
    process.env.DIAGNOSTICO_API_URL ||
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL
  ) || 'http://10.193.97.50:5000';

const ENDPOINT = '/diagnosticos_metricas';
const TIMEOUT_MS = 8000;

// ── Contenido FIJO de respaldo (se usa si el backend no responde) ───────────
const RESPALDO_RESUMEN = {
  base_total: 2240,
  compradores: 334,
  rechazos: 1906,
  tasa_aceptacion: 0.149,
  costo_global: 6720,
  ingreso_global: 3674,
  deficit_unidades: -3046,
  desbalance: 1572,
  total_columnas: 29,
  umbral_equilibrio: 0.273,
  z_cost: 3,
  z_revenue: 11,
};

const RESPALDO_CLUSTERS = [
  { id: 0, nombre: 'Premium', pct_base: 0.246, gasto_prom: 1150, desc: 'Altos ingresos ($75k+), vinos y carnes finas. Tienda física y catálogo.' },
  { id: 1, nombre: 'Ocasionales', pct_base: 0.382, gasto_prom: 120, desc: 'Bajo ingreso y ticket esporádico ($32k). Baja respuesta.' },
  { id: 2, nombre: 'Digitales & Ofertas', pct_base: 0.218, gasto_prom: 540, desc: 'Alta interacción web y sensibilidad a promociones.' },
  { id: 3, nombre: 'Tradicionales', pct_base: 0.154, gasto_prom: 780, desc: 'Familias con hijos, compra física periódica, canasta hogar.' },
];

// ── Helpers internos ─────────────────────────────────────────────────────────
const fmtMiles = (v) =>
  Number(v ?? 0).toLocaleString('es-CL', { maximumFractionDigits: 0 });

const fmtPct1 = (v) =>
  `${Number(v ?? 0).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

async function fetch_metricas() {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BACKEND_URL}${ENDPOINT}`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const raw = await res.json().catch(() => null);
    // Valida que traiga lo necesario antes de usarlo
    if (!raw || !Number.isFinite(Number(raw.base_historica))) return null;
    return raw;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// Backend (porcentajes 0-100) → formato interno (fracciones 0-1)
function mapear_resumen(raw) {
  const n = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  return {
    base_total: n(raw.base_historica),
    compradores: n(raw.total_compradores),
    rechazos: n(raw.total_rechazos),
    tasa_aceptacion: n(raw.tasa_aceptacion) / 100,
    costo_global: n(raw.costo_global),
    ingreso_global: n(raw.ingreso_global),
    deficit_unidades: n(raw.deficit_sin_segmentar),
    desbalance: n(raw.desbalance),
    total_columnas: n(raw.total_columnas),
    umbral_equilibrio: n(raw.punto_equilibrio) / 100,
    z_cost: 3,
    z_revenue: 11,
  };
}

function construir_cards(r) {
  return [
    {
      id: 'base',
      label: 'Base Histórica',
      value: fmtMiles(r.base_total),
      detail: 'Registros en la base original',
      accent: 'sky',
      icon: 'database',
    },
    {
      id: 'response',
      label: 'Tasa de Aceptación (Response)',
      value: fmtPct1(r.tasa_aceptacion * 100),
      detail: `${fmtMiles(r.compradores)} compradores vs ${fmtMiles(r.rechazos)} rechazos (desbalance)`,
      accent: 'emerald',
      icon: 'check',
    },
    {
      id: 'deficit',
      label: 'Déficit Sin Segmentar',
      value: `${fmtMiles(r.deficit_unidades)} u.`,
      detail: `Costo global $${fmtMiles(r.costo_global)} vs ingreso $${fmtMiles(r.ingreso_global)}`,
      accent: 'rose',
      icon: 'trending-down',
    },
    {
      id: 'equilibrio',
      label: 'Punto de Equilibrio',
      value: fmtPct1(r.umbral_equilibrio * 100),
      detail: 'Fórmula de rentabilidad: Z_Cost / Z_Revenue',
      accent: 'indigo',
      icon: 'scale',
    },
  ];
}

// Una sola lectura por request: { source, resumen }
async function fuente_datos() {
  const raw = await fetch_metricas();
  if (raw) return { source: 'api', resumen: mapear_resumen(raw) };
  return { source: 'mock', resumen: RESPALDO_RESUMEN };
}

// ── Funciones públicas (las usa route.js) ────────────────────────────────────

export async function obtener_resumen() {
  const { resumen } = await fuente_datos();
  return resumen;
}

export async function obtener_datos_card() {
  const { resumen } = await fuente_datos();
  return construir_cards(resumen);
}

export async function obtener_clusters() {
  // TODO(api): el backend aún no expone clusters; al agregarlo,
  // haz fetch aquí mismo y mantén el formato [{ id, nombre, pct_base, gasto_prom, desc }].
  return RESPALDO_CLUSTERS;
}

export async function obtener_diagnostico_completo() {
  const [{ resumen, source }, clusters] = await Promise.all([
    fuente_datos(),
    obtener_clusters(),
  ]);
  return { source, ...resumen, kpis: construir_cards(resumen), clusters };
}
