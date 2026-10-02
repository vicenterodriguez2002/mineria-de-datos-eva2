/**
 * Campos del formulario Evaluador de Clientes.
 * `key` = columna real de marketing_campaign (el mismo nombre que devuelve FastAPI).
 * No se incluyen ID (solo referencia), Response (es la etiqueta) ni
 * Z_CostContact / Z_Revenue (constantes 3 y 11 en todo el dataset).
 * `segmento` no es columna del Excel: si FastAPI lo manda, el buscador lo muestra.
 */

export const CLIENTE_SCHEMA = [
  {
    key: 'Year_Birth',
    label: 'Año de nacimiento',
    type: 'number',
    min: 1890,
    max: 2000,
    step: 1,
    default: 1970,
    placeholder: 'Ej: 1970',
    hint: 'Columna Year_Birth.',
    group: 'Perfil',
  },
  {
    key: 'Education',
    label: 'Educación',
    type: 'select',
    default: 'Graduation',
    options: ['Basic', '2n Cycle', 'Graduation', 'Master', 'PhD'],
    hint: 'Columna Education.',
    group: 'Perfil',
  },
  {
    key: 'Marital_Status',
    label: 'Estado civil',
    type: 'select',
    default: 'Married',
    options: ['Single', 'Married', 'Together', 'Divorced', 'Widow', 'Alone', 'Absurd', 'YOLO'],
    hint: 'Columna Marital_Status.',
    group: 'Perfil',
  },
  {
    key: 'Income',
    label: 'Ingresos anuales (USD)',
    type: 'number',
    min: 0,
    max: 700000,
    step: 1,
    default: 50000,
    placeholder: 'Ej: 58138',
    hint: 'Columna Income.',
    group: 'Perfil',
  },
  { key: 'Kidhome', label: 'Hijos pequeños en casa', type: 'number', min: 0, max: 5, step: 1, default: 0, group: 'Hogar' },
  { key: 'Teenhome', label: 'Adolescentes en casa', type: 'number', min: 0, max: 5, step: 1, default: 0, group: 'Hogar' },
  {
    key: 'Dt_Customer',
    label: 'Fecha de alta',
    type: 'date',
    default: '2013-01-01',
    hint: 'Columna Dt_Customer.',
    group: 'Hogar',
  },
  { key: 'Recency', label: 'Recency (días desde última compra)', type: 'number', min: 0, max: 100, step: 1, default: 30, group: 'Comportamiento' },
  { key: 'MntWines', label: 'Gasto en vinos', type: 'number', min: 0, max: 1600, step: 1, default: 0, group: 'Gasto (últimos 2 años)' },
  { key: 'MntFruits', label: 'Gasto en frutas', type: 'number', min: 0, max: 250, step: 1, default: 0, group: 'Gasto (últimos 2 años)' },
  { key: 'MntMeatProducts', label: 'Gasto en carnes', type: 'number', min: 0, max: 1800, step: 1, default: 0, group: 'Gasto (últimos 2 años)' },
  { key: 'MntFishProducts', label: 'Gasto en pescados', type: 'number', min: 0, max: 300, step: 1, default: 0, group: 'Gasto (últimos 2 años)' },
  { key: 'MntSweetProducts', label: 'Gasto en dulces', type: 'number', min: 0, max: 300, step: 1, default: 0, group: 'Gasto (últimos 2 años)' },
  { key: 'MntGoldProds', label: 'Gasto en oro', type: 'number', min: 0, max: 400, step: 1, default: 0, group: 'Gasto (últimos 2 años)' },
  { key: 'NumDealsPurchases', label: 'Compras con descuento', type: 'number', min: 0, max: 20, step: 1, default: 0, group: 'Canales' },
  { key: 'NumWebPurchases', label: 'Compras web', type: 'number', min: 0, max: 30, step: 1, default: 0, group: 'Canales' },
  { key: 'NumCatalogPurchases', label: 'Compras por catálogo', type: 'number', min: 0, max: 30, step: 1, default: 0, group: 'Canales' },
  { key: 'NumStorePurchases', label: 'Compras en tienda', type: 'number', min: 0, max: 20, step: 1, default: 0, group: 'Canales' },
  { key: 'NumWebVisitsMonth', label: 'Visitas web / mes', type: 'number', min: 0, max: 30, step: 1, default: 0, group: 'Canales' },
  { key: 'AcceptedCmp1', label: 'Aceptó campaña 1', type: 'number', min: 0, max: 1, step: 1, default: 0, group: 'Historial' },
  { key: 'AcceptedCmp2', label: 'Aceptó campaña 2', type: 'number', min: 0, max: 1, step: 1, default: 0, group: 'Historial' },
  { key: 'AcceptedCmp3', label: 'Aceptó campaña 3', type: 'number', min: 0, max: 1, step: 1, default: 0, group: 'Historial' },
  { key: 'AcceptedCmp4', label: 'Aceptó campaña 4', type: 'number', min: 0, max: 1, step: 1, default: 0, group: 'Historial' },
  { key: 'AcceptedCmp5', label: 'Aceptó campaña 5', type: 'number', min: 0, max: 1, step: 1, default: 0, group: 'Historial' },
  {
    key: 'Complain',
    label: '¿Reclamó alguna vez?',
    type: 'select',
    default: 0,
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Sí' },
    ],
    hint: 'Columna Complain: 0 o 1.',
    group: 'Historial',
  },
];

export function getDefaultClientePayload() {
  const out = {};
  for (const f of CLIENTE_SCHEMA) out[f.key] = f.default;
  return out;
}

export function coerceClientePayload(raw) {
  const out = { ...raw };
  for (const f of CLIENTE_SCHEMA) {
    if (f.type === 'number') {
      const n = Number(out[f.key]);
      out[f.key] = Number.isFinite(n) ? n : f.default;
    } else if (f.type === 'date') {
      const s = out[f.key] == null ? '' : String(out[f.key]).trim();
      out[f.key] = s ? s.slice(0, 10) : f.default;
    } else if (typeof out[f.key] === 'string') {
      out[f.key] = out[f.key].trim();
    }
  }
  if (out.Complain === 'Sí') out.Complain = 1;
  else if (out.Complain === 'No') out.Complain = 0;
  else out.Complain = Number(out.Complain) === 1 ? 1 : 0;
  return out;
}
