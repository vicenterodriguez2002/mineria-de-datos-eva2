'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResultado } from '@/hooks/useApi';
import { descargarInforme } from '@/lib/resultado-pdf';

const COLORES = ['#0f766e', '#4f46e5', '#db2777', '#d97706', '#0369a1'];

function dinero(valor, decimales = 0) {
  if (valor == null || Number.isNaN(Number(valor))) return '—';
  return `$${Number(valor).toLocaleString('es-CL', { maximumFractionDigits: decimales })}`;
}

function porcentaje(valor) {
  if (valor == null || Number.isNaN(Number(valor))) return '—';
  const numero = Number(valor);
  const texto = numero <= 1 ? numero * 100 : numero;
  return `${texto.toFixed(1)}%`;
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Cargando resultado">
      <div className="h-40 rounded-2xl bg-slate-200" />
      <div className="h-80 rounded-2xl bg-slate-200" />
    </div>
  );
}

function diamante(x, y, r) {
  return `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;
}

function Dispersion({ puntos, cliente, segmentos }) {
  const width = 680;
  const height = 360;
  const pad = { l: 62, r: 18, t: 36, b: 46 };
  const ingresos = puntos.map((p) => p.income);
  const gastos = puntos.map((p) => p.gasto);
  const tope = Math.max(...ingresos);
  const minX = Math.min(...ingresos);
  const maxX = tope;
  const minY = 0;
  const maxY = Math.max(...gastos, cliente?.gasto || 0, ...(segmentos || []).map((g) => g.gasto)) * 1.12;
  const fuera = cliente && cliente.income > tope;
  const xDe = (valor) => pad.l + ((Math.min(valor, maxX) - minX) / (maxX - minX || 1)) * (width - pad.l - pad.r);
  const yDe = (valor) => pad.t + (1 - (Math.min(valor, maxY) - minY) / (maxY - minY || 1)) * (height - pad.t - pad.b);
  const marcasX = 4;
  const marcasY = 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Gráfico de ingreso y gasto. El punto naranja es este cliente.">
      <text x="16" y={height / 2} fill="#64748b" fontSize="11" transform={`rotate(-90 16 ${height / 2})`}>Gasto en productos</text>
      {Array.from({ length: marcasY + 1 }, (_, i) => {
        const valor = minY + ((maxY - minY) * i) / marcasY;
        const y = yDe(valor);
        return (
          <g key={`y-${i}`}>
            <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{dinero(valor)}</text>
          </g>
        );
      })}
      {Array.from({ length: marcasX + 1 }, (_, i) => {
        const valor = minX + ((maxX - minX) * i) / marcasX;
        const x = xDe(valor);
        return (
          <text key={`x-${i}`} x={x} y={height - 18} textAnchor="middle" fontSize="10" fill="#94a3b8">{dinero(valor)}</text>
        );
      })}
      <text x={(pad.l + width - pad.r) / 2} y={height - 4} textAnchor="middle" fontSize="11" fill="#64748b">Ingreso anual</text>
      {puntos.map((punto, i) => (
        <circle key={i} cx={xDe(punto.income)} cy={yDe(punto.gasto)} r="4.5" fill={COLORES[punto.cluster % COLORES.length]} opacity="0.72" />
      ))}
      {(segmentos || []).map((grupo) => (
        <polygon key={grupo.cluster} points={diamante(xDe(grupo.income), yDe(grupo.gasto), 7)} fill="#fff" stroke={COLORES[grupo.cluster % COLORES.length]} strokeWidth="2.5" />
      ))}
      {cliente && (
        <g>
          <circle cx={xDe(cliente.income)} cy={yDe(cliente.gasto)} r="8" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <rect x={Math.min(width - pad.r - 92, Math.max(pad.l, xDe(cliente.income) - 46))} y={Math.max(6, yDe(cliente.gasto) - 30)} width="92" height="18" rx="9" fill="#0f172a" />
          <text x={Math.min(width - pad.r - 46, Math.max(pad.l + 46, xDe(cliente.income)))} y={Math.max(19, yDe(cliente.gasto) - 17)} textAnchor="middle" fontSize="10" fill="#fff">Este cliente</text>
        </g>
      )}
      {fuera && (
        <text x={width - pad.r} y="16" textAnchor="end" fontSize="10" fill="#b45309">Su ingreso queda fuera de esta escala</text>
      )}
    </svg>
  );
}

function textoGrupo(data) {
  const grupo = (data.segmentos || []).find((item) => item.cluster === data.cluster);
  if (!grupo) return data.descripcion_cluster;
  const compras = Number(grupo.compras).toLocaleString('es-CL', { maximumFractionDigits: 1 });
  const aceptan = Math.round(Number(grupo.tasa_respuesta) * 100);
  return `Comparte grupo con ${Number(grupo.clientes).toLocaleString('es-CL')} personas. En ese grupo el ingreso típico es ${dinero(grupo.income)}, el gasto típico es ${dinero(grupo.gasto)} y hacen unas ${compras} compras. Cerca de ${aceptan} de cada 100 aceptan la oferta.`;
}

function fraseCercania(distancia) {
  if (distancia == null || Number.isNaN(Number(distancia))) return '';
  if (distancia < 0.8) return 'Está muy cerca del cliente típico de su grupo.';
  if (distancia < 1.5) return 'Está dentro de lo habitual de su grupo.';
  return 'Se aleja del cliente típico de su grupo.';
}

export default function ResultadoView() {
  const params = useSearchParams();
  const id = params.get('id') || '';
  const { data, loading, error } = useResultado(id);
  const [vista, setVista] = useState('grafico');
  const [bajando, setBajando] = useState(false);
  const [pdfError, setPdfError] = useState('');

  if (loading) return <Skeleton />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h2 className="font-bold text-amber-900">Todavía no hay un cliente evaluado</h2>
        <p className="mt-2 text-sm text-amber-800">{error || 'Elige un cliente en el evaluador y presiona Evaluar cliente.'}</p>
        <Link href="/evaluador-cliente" className="mt-4 inline-flex items-center justify-center rounded-full bg-st-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-st">
          Ir al evaluador
        </Link>
      </div>
    );
  }

  const pct = Math.round((data.probabilidad ?? 0) * 1000) / 10;
  const umbralPct = Math.round((data.umbral ?? 0.273) * 1000) / 10;
  const ok = data.supera_umbral ?? data.decision === 'CONTACTAR';
  const retorno = Number(data.ingreso_esperado ?? 0) - Number(data.costo_contacto ?? 3);
  const nombres = [...new Map((data.nube || []).map((p) => [p.cluster, p.nombre])).entries()];
  const reglaPrincipal = data.productos_cruzados?.[0];

  async function bajarPdf() {
    setBajando(true);
    setPdfError('');
    try {
      await descargarInforme(data);
    } catch {
      setPdfError('No se pudo crear el PDF. Intenta de nuevo.');
    } finally {
      setBajando(false);
    }
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={bajarPdf}
          disabled={bajando}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-st-dark px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-st disabled:opacity-60"
        >
          {bajando ? 'Preparando PDF…' : 'Descargar informe PDF'}
        </button>
      </div>
      {pdfError && <p className="text-right text-sm text-rose-700">{pdfError}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm" aria-labelledby="res-decision">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-st-dark">¿Lo contactamos?</p>
            <h2 id="res-decision" className="mt-1 text-2xl sm:text-3xl font-extrabold text-st-darker">Cliente {data.id}</h2>
          </div>
          <p className={`rounded-full px-4 py-1.5 text-sm font-bold ${ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {ok ? 'Recomendado: contactar' : 'Recomendado: no contactar'}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`rounded-xl p-4 ${ok ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <p className={`text-lg font-extrabold ${ok ? 'text-emerald-900' : 'text-rose-900'}`}>
              {ok ? 'Tiene una chance alta de aceptar' : 'La chance de que acepte es baja'}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              La posibilidad calculada es {pct}%. La campaña se paga sola desde {umbralPct}%. {ok ? 'Como está por encima, el contacto deja un resultado positivo.' : 'Como está por debajo, contactarlo cuesta más de lo que deja.'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Posibilidad de que acepte</p>
            <p className="mt-1 text-3xl font-extrabold text-st-darker">{pct}%</p>
            <div className="relative mt-3" role="img" aria-label={`Posibilidad ${pct}%. El equilibrio está en ${umbralPct}%.`}>
              <div className="h-3 overflow-hidden rounded-full border border-slate-200 bg-white">
                <div className={`h-full ${ok ? 'bg-emerald-500' : 'bg-rose-400'}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <span className="absolute -top-1 h-5 w-0.5 bg-slate-800" style={{ left: `${Math.min(100, umbralPct)}%` }} aria-hidden="true" />
            </div>
            <p className="mt-3 text-xs text-slate-500">La línea marca el {umbralPct}%: desde ahí, escribirle se paga solo.</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 text-sm text-slate-700">
            <p>Costo de escribirle: <strong>{dinero(data.costo_contacto ?? 3, 2)}</strong></p>
            <p className="mt-1">Si acepta, la campaña deja: <strong>$11</strong></p>
            <p className="mt-1">Ingreso esperado: <strong>{dinero(data.ingreso_esperado, 2)}</strong></p>
            <p className={`mt-2 font-bold ${retorno >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              Resultado después del costo: {dinero(retorno, 2)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm" aria-labelledby="res-grupo">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-800">¿En qué grupo está?</p>
              <h3 id="res-grupo" className="mt-1 text-xl font-extrabold text-slate-900">{data.cluster_nombre}</h3>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button type="button" onClick={() => setVista('grafico')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${vista === 'grafico' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                Gráfico de dispersión
              </button>
              <button type="button" onClick={() => setVista('tabla')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${vista === 'tabla' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                Tabla comparativa
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{textoGrupo(data)}</p>
          {data.distancia_centroide != null && (
            <p className="mt-2 text-sm text-slate-600">
              Distancia al centro del grupo: <strong>{Number(data.distancia_centroide).toLocaleString('es-CL', { maximumFractionDigits: 2 })}</strong>. {fraseCercania(data.distancia_centroide)}
            </p>
          )}

          {vista === 'grafico' ? (
            <div className="mt-4">
              {Array.isArray(data.nube) && data.nube.length > 0 ? (
                <Dispersion puntos={data.nube} cliente={data.cliente} segmentos={data.segmentos} />
              ) : (
                <p className="text-sm text-slate-500">El gráfico aparece cuando Python entrega la nube de clientes.</p>
              )}
              <ul className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                {nombres.map(([cluster, nombre]) => (
                  <li key={cluster} className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORES[cluster % COLORES.length] }} />
                    {nombre}
                  </li>
                ))}
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rotate-45 border-2 border-slate-500 bg-white" />
                  Centro del grupo
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Este cliente
                </li>
              </ul>
            </div>
          ) : (
            <>
            <div className="mt-4 space-y-3 md:hidden">
              {(data.segmentos || []).map((grupo) => (
                <div key={grupo.cluster} className={`rounded-xl border p-3 text-sm ${grupo.cluster === data.cluster ? 'border-indigo-200 bg-indigo-50 text-indigo-950' : 'border-slate-100 text-slate-700'}`}>
                  <p className="font-semibold">{grupo.nombre}{grupo.cluster === data.cluster ? ' · su grupo' : ''}</p>
                  <p className="mt-1">{grupo.clientes} personas · ingreso {dinero(grupo.income)} · gasto {dinero(grupo.gasto)}</p>
                  <p>{grupo.compras} compras · aceptan {porcentaje(grupo.tasa_respuesta)}</p>
                </div>
              ))}
              {data.cliente && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-semibold">Este cliente</p>
                  <p className="mt-1">Ingreso {dinero(data.cliente.income)} · gasto {dinero(data.cliente.gasto)} · {data.cliente.compras} compras · chance {pct}%</p>
                </div>
              )}
            </div>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[36rem] text-sm text-left">
                <caption className="sr-only">Comparación entre grupos y este cliente</caption>
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-3 font-semibold">Grupo</th>
                    <th className="py-2 pr-3 font-semibold">Personas</th>
                    <th className="py-2 pr-3 font-semibold">Ingreso típico</th>
                    <th className="py-2 pr-3 font-semibold">Gasto típico</th>
                    <th className="py-2 pr-3 font-semibold">Compras</th>
                    <th className="py-2 font-semibold">Aceptan</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.segmentos || []).map((grupo) => (
                    <tr key={grupo.cluster} className={grupo.cluster === data.cluster ? 'bg-indigo-50 font-semibold text-indigo-950' : 'text-slate-700'}>
                      <td className="py-2 pr-3">{grupo.nombre}{grupo.cluster === data.cluster ? ' · su grupo' : ''}</td>
                      <td className="py-2 pr-3">{grupo.clientes}</td>
                      <td className="py-2 pr-3">{dinero(grupo.income)}</td>
                      <td className="py-2 pr-3">{dinero(grupo.gasto)}</td>
                      <td className="py-2 pr-3">{grupo.compras}</td>
                      <td className="py-2">{porcentaje(grupo.tasa_respuesta)}</td>
                    </tr>
                  ))}
                  {data.cliente && (
                    <tr className="border-t border-slate-200 text-amber-900 font-semibold">
                      <td className="py-2 pr-3">Este cliente</td>
                      <td className="py-2 pr-3">1</td>
                      <td className="py-2 pr-3">{dinero(data.cliente.income)}</td>
                      <td className="py-2 pr-3">{dinero(data.cliente.gasto)}</td>
                      <td className="py-2 pr-3">{data.cliente.compras}</td>
                      <td className="py-2">{pct}%</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm" aria-labelledby="res-oferta">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Qué le podemos ofrecer</p>
          <h3 id="res-oferta" className="mt-1 text-xl font-extrabold text-slate-900">Productos que suelen comprarse juntos</h3>
          {reglaPrincipal ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold">
                {(reglaPrincipal.antecedente || []).join(' + ')} → {(reglaPrincipal.consecuente || []).join(' + ')}
              </p>
              <p className="mt-2">{reglaPrincipal.explicacion}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">No hay una oferta cruzada clara para este perfil.</p>
          )}
          {reglaPrincipal && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Soporte</p>
                <p className="mt-1 font-extrabold text-slate-800">{porcentaje(reglaPrincipal.soporte)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">Confianza</p>
                <p className="mt-1 font-extrabold text-slate-800">{porcentaje(reglaPrincipal.confianza)}</p>
              </div>
              <div className="rounded-xl bg-amber-100 p-3">
                <p className="text-[10px] font-bold uppercase text-amber-800">Lift</p>
                <p className="mt-1 font-extrabold text-amber-900">{reglaPrincipal.lift}x</p>
              </div>
            </div>
          )}
          {data.productos_cruzados?.length > 1 && (
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {data.productos_cruzados.slice(1).map((regla, i) => (
                <li key={i} className="rounded-lg border border-slate-100 px-3 py-2">
                  {(regla.antecedente || []).join(' + ')} → {(regla.consecuente || []).join(' + ')}
                  <span className="mt-1 block text-xs text-slate-500">Confianza {porcentaje(regla.confianza)} · lift {regla.lift}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/evaluador-cliente" className="inline-flex items-center justify-center rounded-full border border-st-dark/25 bg-white px-6 py-2.5 text-sm font-semibold text-st-darker hover:border-st hover:text-st">
          Evaluar otro cliente
        </Link>
        <Link href="/diagnostico-campana" className="inline-flex items-center justify-center rounded-full border border-st-dark/25 bg-white px-6 py-2.5 text-sm font-semibold text-st-darker hover:border-st hover:text-st">
          Ver diagnóstico
        </Link>
      </div>
    </div>
  );
}
