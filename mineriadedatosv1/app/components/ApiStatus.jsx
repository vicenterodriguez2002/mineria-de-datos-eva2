'use client';

import { useApiStatus } from '@/hooks/useApi';

export default function ApiStatus({ compact = false }) {
  const { loading, mode, ok, refresh } = useApiStatus();

  const label = loading ? 'Verificando API…' : mode === 'api' ? 'API conectada' : mode === 'mock' ? 'Modo demo (sin backend)' : 'API no disponible';
  const dot = loading ? 'bg-slate-400' : ok && mode === 'api' ? 'bg-emerald-500' : ok ? 'bg-amber-500' : 'bg-rose-500';

  if (compact) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
        <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className={`w-2.5 h-2.5 rounded-full ${dot}`} aria-hidden="true" />
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="text-xs text-slate-500">
        {mode === 'mock'
          ? 'Configura API_URL en .env.local para usar el backend Flask.'
          : mode === 'api'
            ? 'Diagnóstico y estado salen del backend Flask.'
            : ''}
      </span>
      <button
        type="button"
        onClick={refresh}
        className="ml-auto text-xs font-semibold text-st-dark hover:text-st underline underline-offset-2"
      >
        Reintentar
      </button>
    </div>
  );
}
