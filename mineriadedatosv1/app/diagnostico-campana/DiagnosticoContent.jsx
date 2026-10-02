'use client';

import { useDiagnostico } from '@/hooks/useApi';
import KpiIcon from '../components/KpiIcon';

const ACCENTS = {
  sky: { top: 'border-t-sky-500', text: 'text-sky-800', badge: 'text-sky-700 bg-sky-100', value: 'text-sky-900' },
  emerald: { top: 'border-t-emerald-500', text: 'text-emerald-800', badge: 'text-emerald-700 bg-emerald-100', value: 'text-emerald-900' },
  rose: { top: 'border-t-rose-500', text: 'text-rose-800', badge: 'text-rose-700 bg-rose-100', value: 'text-rose-900' },
  indigo: { top: 'border-t-indigo-500', text: 'text-indigo-800', badge: 'text-indigo-700 bg-indigo-100', value: 'text-indigo-900' },
};

const CLUSTER_STYLES = [
  { dot: 'bg-indigo-600', card: 'border-indigo-200 bg-indigo-50/40', divider: 'border-indigo-100', meta: 'text-indigo-700' },
  { dot: 'bg-amber-600', card: 'border-amber-200 bg-amber-50/40', divider: 'border-amber-100', meta: 'text-amber-700' },
  { dot: 'bg-emerald-600', card: 'border-emerald-200 bg-emerald-50/40', divider: 'border-emerald-100', meta: 'text-emerald-700' },
  { dot: 'bg-blue-600', card: 'border-blue-200 bg-blue-50/40', divider: 'border-blue-100', meta: 'text-blue-700' },
];

const fmtPct = (v) => `${Math.round((v ?? 0) * 1000) / 10}%`.replace('.', ',');
const fmtNum = (v) => Number(v ?? 0).toLocaleString('es-CL');

function KpiCard({ kpi }) {
  const a = ACCENTS[kpi.accent] || ACCENTS.sky;
  return (
    <article className={`p-5 rounded-xl bg-white border border-slate-200 border-t-4 ${a.top} shadow-sm flex flex-col`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`text-xs font-bold uppercase tracking-wide ${a.text}`}>{kpi.label}</span>
        <span className={`rounded-lg p-2 ${a.badge}`} aria-hidden="true">
          <KpiIcon name={kpi.icon} />
        </span>
      </div>
      <p className={`text-3xl font-extrabold font-mono ${a.value}`}>{kpi.value}</p>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{kpi.detail}</p>
    </article>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Cargando indicadores">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-36 rounded-xl bg-slate-200 animate-pulse" />
      ))}
    </div>
  );
}

function LiveBadge({ stale }) {
  return (
    <p className={`inline-flex items-center gap-1.5 text-xs font-semibold ${stale ? 'text-amber-700' : 'text-emerald-700'}`}>
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {!stale && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${stale ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      </span>
      {stale ? 'Reconectando…' : 'En vivo'}
    </p>
  );
}

export default function DiagnosticoContent() {
  const { data, loading, error, stale, reload } = useDiagnostico();

  return (
    <div className="space-y-12">
      <section aria-labelledby="kpi-title">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-st">Desafío comercial retail</p>
            <h2 id="kpi-title" className="mt-1 text-xl sm:text-2xl font-extrabold text-st-darker">
              Indicadores clave de la campaña
            </h2>
          </div>
          <div className="text-right">
            <LiveBadge stale={stale} />
            <p className="mt-1 text-xs text-slate-500">
              {data ? `Base: ${fmtNum(data.base_total)} registros` : 'Base: …'}
            </p>
          </div>
        </div>

        {loading && !data && <KpiSkeleton />}

        {error && !data && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800 flex flex-wrap items-center gap-3">
            <span><strong>No se pudo cargar el diagnóstico:</strong> {error}</span>
            <button type="button" onClick={reload} className="ml-auto rounded-full border border-rose-300 bg-white px-4 py-1.5 text-xs font-bold hover:bg-rose-100">
              Reintentar
            </button>
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data.kpis || []).map((kpi) => (
              <KpiCard key={kpi.id || kpi.label} kpi={kpi} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="problema-title" className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <div>
          <h2 id="problema-title" className="text-sm font-bold text-amber-900">
            El problema central: ¿por qué contactar a todos destruye valor?
          </h2>
          <p className="text-xs sm:text-sm text-amber-800/90 mt-1 leading-relaxed">
            En la base completa, contactar a un cliente cuesta{' '}
            <strong>${data?.z_cost ?? 3} (Z_CostContact)</strong> y cada conversión genera un ingreso
            promedio de <strong>${data?.z_revenue ?? 11} (Z_Revenue)</strong>. Con una respuesta
            indiscriminada del <strong>{data ? fmtPct(data.tasa_aceptacion) : '14,9%'}</strong>, la empresa
            pierde dinero de forma sistemática. Mediante el <strong>Árbol de Decisión</strong> filtramos
            únicamente clientes con probabilidad superior al umbral comercial{' '}
            <strong>({data ? fmtPct(data.umbral_equilibrio) : '27,3%'})</strong>, combinándolo con{' '}
            <strong>K-Means</strong> para entregar la oferta adecuada y <strong>Apriori</strong> para sugerir
            productos cruzados.
          </p>
        </div>
      </section>

      <section aria-labelledby="segmentos-title">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <h2 id="segmentos-title" className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
            Segmentos ilustrativos para la demostración
          </h2>
          <span className="text-xs text-slate-400 rounded-full border border-slate-200 bg-white px-3 py-1">
            K = {data?.clusters?.length ?? 4} en esta demostración
          </span>
        </div>

        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Cargando segmentos">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {data?.clusters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.clusters.map((c, i) => {
              const s = CLUSTER_STYLES[c.id ?? i] || CLUSTER_STYLES[i % CLUSTER_STYLES.length];
              return (
                <article key={c.id ?? c.nombre} className={`p-4 rounded-xl border ${s.card} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${s.dot}`} aria-hidden="true" />
                      <h3 className="font-bold text-sm text-slate-900">Cluster {c.id}: {c.nombre}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.desc}</p>
                  </div>
                  <div className={`mt-4 pt-3 border-t ${s.divider} flex justify-between gap-2 text-[11px] font-mono ${s.meta} font-semibold`}>
                    <span>{fmtPct(c.pct_base)} base</span>
                    <span>${fmtNum(c.gasto_prom)} gasto prom.</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
