import { API_CONFIG } from './api/config';

export function mockEvaluar(payload = {}) {
  const n = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

  const income = payload.Income == null ? null : n(payload.Income, 50000);
  const recency = n(payload.Recency, 30);
  const web = n(payload.NumWebPurchases, 0);
  const store = n(payload.NumStorePurchases, 0);
  const deals = n(payload.NumDealsPurchases, 0);
  const accepted =
    n(payload.AcceptedCmp1) + n(payload.AcceptedCmp2) + n(payload.AcceptedCmp3) +
    n(payload.AcceptedCmp4) + n(payload.AcceptedCmp5);
  const gastoTotal =
    n(payload.MntWines) + n(payload.MntFruits) + n(payload.MntMeatProducts) +
    n(payload.MntFishProducts) + n(payload.MntSweetProducts) + n(payload.MntGoldProds);
  const kids = n(payload.Kidhome) + n(payload.Teenhome);

  let score = 0.08;
  if (income !== null) score += Math.min(0.25, (income / 100000) * 0.25);
  score += Math.min(0.15, (gastoTotal / 2000) * 0.15);
  score += accepted * 0.08;
  score += Math.min(0.08, (web + store) * 0.012);
  if (recency <= 30) score += 0.08;
  else if (recency >= 80) score -= 0.08;
  if (deals >= 4) score += 0.03;
  if (payload.Complain === 1 || payload.Complain === 'Sí') score -= 0.06;

  const probabilidad = Math.max(0.01, Math.min(0.97, Number(score.toFixed(3))));
  const umbral = API_CONFIG.umbralDefecto;
  const contactar = probabilidad >= umbral;

  let cluster = 1;
  let clusterNombre = 'Ocasionales';
  if (income !== null && income >= 70000 && gastoTotal >= 900) { cluster = 0; clusterNombre = 'Premium'; }
  else if (web >= 5 || deals >= 3) { cluster = 2; clusterNombre = 'Digitales & Ofertas'; }
  else if (kids >= 1 && store >= 4) { cluster = 3; clusterNombre = 'Tradicionales'; }

  const reglas = [];
  if (n(payload.MntWines) > 200) reglas.push({ antecedente: ['Vinos'], consecuente: ['Carnes finas'], lift: 2.4, soporte: 0.18 });
  if (web >= 5) reglas.push({ antecedente: ['Compra web'], consecuente: ['Oferta personalizada web'], lift: 1.9, soporte: 0.22 });
  if (kids >= 1) reglas.push({ antecedente: ['Hogar con hijos'], consecuente: ['Canasta familiar'], lift: 1.6, soporte: 0.25 });
  if (reglas.length === 0) reglas.push({ antecedente: ['Ticket medio'], consecuente: ['Cross-sell dulces + frutas'], lift: 1.3, soporte: 0.15 });

  const ticketEsperado = Math.round(Math.min(1500, 80 + gastoTotal * 0.25 + (contactar ? 60 : 0)));
  const id = `mock-${Date.now().toString(36)}`;

  return {
    source: 'mock',
    id,
    probabilidad,
    umbral,
    supera_umbral: contactar,
    decision: contactar ? 'CONTACTAR' : 'NO_CONTACTAR',
    cluster,
    cluster_nombre: clusterNombre,
    ticket_esperado: ticketEsperado,
    ingreso_esperado: Number((probabilidad * 11).toFixed(2)),
    costo_contacto: 3,
    productos_cruzados: reglas,
    explicacion_arbol: [
      `Probabilidad estimada ${Math.round(probabilidad * 1000) / 10}% vs umbral ${Math.round(umbral * 1000) / 10}%.`,
      contactar ? 'Supera el punto de equilibrio: conviene contactar.' : 'Bajo el punto de equilibrio: no conviene contactar masivamente.',
      `Segmento asignado: ${clusterNombre} (K-Means K=4).`,
    ],
    eco: payload,
    created_at: new Date().toISOString(),
  };
}
