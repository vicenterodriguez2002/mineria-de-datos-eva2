'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResultado } from '@/hooks/useApi';

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Cargando resultado">
      <div className="h-8 w-2/3 rounded bg-slate-200" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-slate-200" />
    </div>
  );
}

export default function ResultadoView() {
  const params = useSearchParams();
  const id = params.get('id') || '';
  const { data, loading, error } = useResultado(id);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h2 className="font-bold text-amber-900">Aún no hay resultado para mostrar</h2>
        <p className="mt-2 text-sm text-amber-800">{error}</p>
        <Link
          href="/evaluador-cliente"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-st-dark px-6 py-2.5 text-sm font-semibold text-white hover:bg-st"
        >
          ← Ir al Evaluador
        </Link>
      </div>
    );
  }

  const pct = Math.round((data.probabilidad ?? 0) * 1000) / 10;
  const umbralPct = Math.round((data.umbral ?? 0.273) * 1000) / 10;
  const ok = data.supera_umbral ?? data.decision === 'CONTACTAR';

  return (
    <div className="space-y-6 text-left">
      <section
        aria-labelledby="res-decision"
        className={`rounded-2xl border p-6 sm:p-8 ${ok ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'}`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          ID {data.id} · Fuente: {data.source === 'api' ? 'backend real' : 'demo (mock)'}
        </p>
        <h2 id="res-decision" className={`mt-2 text-3xl sm:text-4xl font-extrabold ${ok ? 'text-emerald-900' : 'text-rose-900'}`}>
          {ok ? '✓ CONTACTAR' : '✕ NO CONTACTAR'}
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Probabilidad <strong className="font-mono">{pct}%</strong> vs umbral comercial{' '}
          <strong className="font-mono">{umbralPct}%</strong> · Segmento{' '}
          <strong>{data.cluster_nombre ?? `Cluster ${data.cluster}`}</strong>
          {data.ticket_esperado != null && (
            <> · Ticket esperado <strong className="font-mono">${data.ticket_esperado}</strong></>
          )}
        </p>

        <div className="mt-4 h-3 rounded-full bg-white border border-slate-200 overflow-hidden" role="img" aria-label={`Probabilidad ${pct}%`}>
          <div
            className={`h-full rounded-full ${ok ? 'bg-emerald-500' : 'bg-rose-400'}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>

        {data.explicacion_arbol?.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-slate-700 list-disc pl-5">
            {data.explicacion_arbol.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Árbol de Decisión</p>
          <p className="mt-2 text-2xl font-extrabold font-mono text-sky-900">{pct}%</p>
          <p className="mt-1 text-xs text-slate-600">Probabilidad de aceptar vs umbral {umbralPct}%.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-800">K-Means (K=4)</p>
          <p className="mt-2 text-2xl font-extrabold text-indigo-900">{data.cluster_nombre ?? `Cluster ${data.cluster}`}</p>
          <p className="mt-1 text-xs text-slate-600">Segmento para personalizar la oferta.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Economía</p>
          <p className="mt-2 text-2xl font-extrabold font-mono text-emerald-900">
            ${data.ingreso_esperado ?? '—'}
          </p>
          <p className="mt-1 text-xs text-slate-600">Ingreso esperado (p × $11) · Costo contacto ${data.costo_contacto ?? 3}.</p>
        </article>
      </div>

      {Array.isArray(data.productos_cruzados) && data.productos_cruzados.length > 0 && (
        <section aria-labelledby="res-apriori" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h3 id="res-apriori" className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Productos cruzados (Apriori)
          </h3>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.productos_cruzados.map((r, i) => (
              <li key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-800">
                  {(r.antecedente || []).join(' + ')} → {(r.consecuente || []).join(' + ')}
                </p>
                <p className="mt-1 text-xs font-mono text-slate-500">
                  lift {r.lift ?? '—'} · soporte {r.soporte ?? '—'}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.nota && (
        <p className="text-xs text-slate-500 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3">{data.nota}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/evaluador-cliente"
          className="inline-flex items-center justify-center rounded-full border border-st-dark/25 bg-white px-6 py-2.5 text-sm font-semibold text-st-darker hover:border-st hover:text-st"
        >
          ← Evaluar otro cliente
        </Link>
        <Link
          href="/diagnostico-campana"
          className="inline-flex items-center justify-center rounded-full border border-st-dark/25 bg-white px-6 py-2.5 text-sm font-semibold text-st-darker hover:border-st hover:text-st"
        >
          Ver diagnóstico
        </Link>
      </div>
    </div>
  );
}
