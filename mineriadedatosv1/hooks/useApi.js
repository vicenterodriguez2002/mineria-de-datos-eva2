'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDiagnostico, getClientes, evaluarCliente, getResultado, checkHealth, ApiError } from '@/lib/api/client';

const LAST_KEY = 'md:ultima-evaluacion';

export function useApiStatus() {
  const [status, setStatus] = useState({ loading: true, mode: '…', ok: null, error: null });

  const refresh = useCallback(async () => {
    setStatus((s) => ({ ...s, loading: true, error: null }));
    try {
      const h = await checkHealth();
      setStatus({ loading: false, mode: h.source === 'api' ? 'api' : 'mock', ok: true, error: null, detail: h });
    } catch (e) {
      setStatus({ loading: false, mode: 'error', ok: false, error: e.message });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  return { ...status, refresh };
}

const DIAGNOSTICO_POLL_MS = 2000;

export function useDiagnostico() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const inflight = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (silent && inflight.current) return;
    inflight.current = true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const d = await getDiagnostico();
      setData(d);
      setError(null);
      setStale(false);
    } catch (e) {
      if (silent) {
        setStale(true);
      } else {
        setError(e instanceof ApiError ? e.message : 'Error al cargar diagnóstico.');
      }
    } finally {
      inflight.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(false), 0);
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      load(true);
    }, DIAGNOSTICO_POLL_MS);

    function onVisible() {
      if (!document.hidden) load(true);
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  return { data, loading, error, stale, reload: () => load(false) };
}

export function useClientes(buscar) {
  const [resultado, setResultado] = useState({ buscar: null, data: [], error: null });

  useEffect(() => {
    let activo = true;
    const texto = buscar.trim();

    const temporizador = setTimeout(async () => {
      try {
        const respuesta = await getClientes(texto, 20);
        if (activo) setResultado({ buscar: texto, data: respuesta.clientes || [], error: null });
      } catch (e) {
        if (activo) setResultado({
          buscar: texto,
          data: [],
          error: e instanceof ApiError ? e.message : 'Error al buscar clientes.',
        });
      }
    }, texto ? 300 : 0);

    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [buscar]);

  const busquedaActual = buscar.trim();
  const resultadoActual = resultado.buscar === busquedaActual;
  return {
    data: resultadoActual ? resultado.data : [],
    loading: !resultadoActual,
    error: resultadoActual ? resultado.error : null,
  };
}

export function useEvaluarCliente() {  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const evaluar = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const r = await evaluarCliente(payload);
      setResult(r);
      try {
        localStorage.setItem(LAST_KEY, JSON.stringify(r));
      } catch {}
      return r;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Error al evaluar.';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { evaluar, loading, error, result };
}

export function useResultado(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const raw = localStorage.getItem(LAST_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!id || parsed.id === id) {
            if (alive) {
              setData(parsed);
              setLoading(false);
              return;
            }
          }
        }
      } catch {}

      if (!id) {
        if (alive) {
          setLoading(false);
          setError('Sin ID de evaluación. Vuelve al Evaluador y envía el formulario.');
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const r = await getResultado(id);
        if (alive) setData(r);
      } catch (e) {
        if (alive) setError(e.message || 'No se pudo cargar el resultado.');
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [id]);

  return { data, loading, error };
}
