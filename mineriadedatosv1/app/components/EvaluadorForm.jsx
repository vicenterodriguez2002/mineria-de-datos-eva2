'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { CLIENTE_SCHEMA, getDefaultClientePayload } from '@/lib/cliente-schema';
import { useClientes, useEvaluarCliente } from '@/hooks/useApi';
import { getCliente } from '@/lib/api/client';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isDisabled ? '#e2e8f0' : state.isFocused ? '#008272' : '#cbd5e1',
    boxShadow: state.isFocused && !state.isDisabled ? '0 0 0 2px rgba(0,130,114,0.2)' : 'none',
    '&:hover': { borderColor: state.isDisabled ? '#e2e8f0' : state.isFocused ? '#008272' : '#94a3b8' },
    fontSize: 14,
    backgroundColor: state.isDisabled ? '#f1f5f9' : '#fff',
    cursor: state.isDisabled ? 'not-allowed' : 'default',
  }),
  menu: (base) => ({ ...base, borderRadius: 12, overflow: 'hidden', zIndex: 30 }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isSelected
      ? '#004f45'
      : state.isFocused
        ? '#eef6f4'
        : '#fff',
    color: state.isSelected ? '#fff' : '#0f172a',
    cursor: 'pointer',
  }),
  singleValue: (base, state) => ({ ...base, fontSize: 14, color: state.isDisabled ? '#64748b' : '#0f172a' }),
  placeholder: (base) => ({ ...base, fontSize: 14, color: '#94a3b8' }),
  input: (base) => ({ ...base, fontSize: 14 }),
};

function idCliente(c) {
  if (!c) return '';
  return c.ID ?? c.id ?? '';
}

function tieneDato(valor) {
  return valor !== null && valor !== undefined && !(typeof valor === 'string' && valor.trim() === '');
}

function formularioDesdeCliente(cliente) {
  const valores = getDefaultClientePayload();
  for (const field of CLIENTE_SCHEMA) {
    const valor = cliente[field.key];
    valores[field.key] = !tieneDato(valor) ? '' : field.type === 'date' ? String(valor).slice(0, 10) : valor;
  }
  return valores;
}

function toOptions(options) {
  return options.map((op) => (op && typeof op === 'object' ? op : { value: op, label: String(op) }));
}

function Field({ field, value, onChange, disabled }) {
  const id = `cli-${field.key}`;
  if (field.type === 'select') {
    const options = toOptions(field.options);
    const selected = options.find((o) => o.value === value) || null;
    return (
      <div>
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wide text-slate-700">
          {field.label}
        </label>
        <div className="mt-1.5">
          <Select
            inputId={id}
            instanceId={id}
            options={options}
            value={selected}
            onChange={(opt) => onChange(field.key, opt ? opt.value : field.default)}
            styles={selectStyles}
            isDisabled={disabled}
            isSearchable
            isClearable={false}
            placeholder="Buscar…"
            noOptionsMessage={() => 'Sin coincidencias'}
          />
        </div>
        {field.hint && <p className="mt-1 text-[11px] text-slate-500">{field.hint}</p>}
      </div>
    );
  }
  const inputType = field.type === 'date' ? 'date' : 'number';
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wide text-slate-700">
        {field.label}
      </label>
      <input
        id={id}
        type={inputType}
        value={value ?? ''}
        disabled={disabled}
        min={inputType === 'number' ? field.min ?? 0 : undefined}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
        onChange={(e) => {
          const valor = e.target.value;
          if (inputType === 'date' || valor === '') {
            onChange(field.key, valor);
            return;
          }
          const numero = Number(valor);
          if (Number.isFinite(numero) && numero >= 0) onChange(field.key, numero);
        }}
        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 font-mono focus:border-st focus:outline-none focus:ring-2 focus:ring-st/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
      />
      {field.hint && <p className="mt-1 text-[11px] text-slate-500">{field.hint}</p>}
    </div>
  );
}

export default function EvaluadorForm() {
  const router = useRouter();
  const [form, setForm] = useState(() => getDefaultClientePayload());
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [detalleCliente, setDetalleCliente] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [formBloqueado, setFormBloqueado] = useState(false);
  const seleccionEnCurso = useRef(0);
  const { evaluar, loading, error } = useEvaluarCliente();
  const { data: clientes, loading: loadingClientes, error: errorClientes } = useClientes(busqueda);

  const groups = useMemo(() => {
    const map = new Map();
    for (const f of CLIENTE_SCHEMA) {
      if (detalleCliente && !tieneDato(detalleCliente[f.key])) continue;
      if (detalleCliente && ['Kidhome', 'Teenhome'].includes(f.key) && Number(detalleCliente[f.key]) === 0) continue;
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group).push(f);
    }
    return [...map.entries()];
  }, [detalleCliente]);

  const clienteOptions = useMemo(
    () =>
      (clientes || []).map((c) => ({
        value: String(idCliente(c)),
        label: `${idCliente(c)}${c.segmento ? ` · ${c.segmento}` : ''}`,
        cliente: c,
      })),
    [clientes],
  );

  const gastoTotal = useMemo(() => {
    const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    return (
      n(form.MntWines) +
      n(form.MntFruits) +
      n(form.MntMeatProducts) +
      n(form.MntFishProducts) +
      n(form.MntSweetProducts) +
      n(form.MntGoldProds)
    );
  }, [form]);

  function set(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function restablecerDatos() {
    setForm(detalleCliente ? formularioDesdeCliente(detalleCliente) : getDefaultClientePayload());
  }

  async function onSelectCliente(option) {
    const solicitud = ++seleccionEnCurso.current;
    setClienteSeleccionado(option);
    setBusqueda('');
    setDetalleCliente(null);
    setErrorDetalle(null);
    setForm(getDefaultClientePayload());
    if (!option) {
      setCargandoDetalle(false);
      return;
    }
    setCargandoDetalle(true);
    try {
      const cliente = await getCliente(option.value);
      if (solicitud !== seleccionEnCurso.current) return;
      setDetalleCliente(cliente);
      setForm(formularioDesdeCliente(cliente));
    } catch (error) {
      if (solicitud === seleccionEnCurso.current) {
        setErrorDetalle(error.message || 'No se pudo cargar el cliente.');
      }
    } finally {
      if (solicitud === seleccionEnCurso.current) setCargandoDetalle(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (cargandoDetalle || errorDetalle) return;
    try {
      const cuerpo = { ...form };
      if (clienteSeleccionado?.value) cuerpo.ID = Number(clienteSeleccionado.value);
      const r = await evaluar(cuerpo);
      router.push(`/resultado-multimodelo?id=${encodeURIComponent(r.id)}`);
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={onSubmit} className="text-left space-y-6">
      <section aria-labelledby="cli-id-title" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <label htmlFor="cli-id" id="cli-id-title" className="block text-xs font-extrabold uppercase tracking-[0.18em] text-st-dark">
          ID del cliente (referencia)
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="w-full sm:max-w-md sm:flex-1">
            <Select
              inputId="cli-id"
              instanceId="cli-id"
              options={clienteOptions}
              value={clienteSeleccionado}
              onChange={onSelectCliente}
              onInputChange={(valor, accion) => {
                if (accion.action === 'input-change') setBusqueda(valor);
              }}
              isLoading={loadingClientes}
              isSearchable
              isClearable
              placeholder="Escribe un ID para buscar…"
              noOptionsMessage={() => busqueda ? 'Sin coincidencias' : 'Escribe un ID para buscar'}
              styles={selectStyles}
              filterOption={null}
              formatOptionLabel={(opt) => (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold">{idCliente(opt.cliente) || opt.value}</span>
                  {opt.cliente?.segmento && (
                    <span className="rounded-full bg-st-mist px-2 py-0.5 text-[11px] font-semibold text-st-dark">
                      {opt.cliente.segmento}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormBloqueado((actual) => !actual)}
              aria-pressed={formBloqueado}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-st-dark ${formBloqueado ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100' : 'border border-st-dark bg-st-dark text-white shadow-st-dark/20 hover:bg-st'}`}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {formBloqueado ? (
                  <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.5-2" /></>
                ) : (
                  <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>
                )}
              </svg>
              {formBloqueado ? 'Desbloquear formulario' : 'Bloquear formulario'}
            </button>
            <button
              type="button"
              onClick={restablecerDatos}
              disabled={loading || cargandoDetalle}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-st-dark/25 bg-white px-5 py-2.5 text-sm font-semibold text-st-darker shadow-sm transition-all hover:-translate-y-0.5 hover:border-st hover:bg-st-mist hover:text-st-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-st-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" />
              </svg>
              Restablecer datos
            </button>
          </div>
        </div>
        {errorClientes ? (
          <p className="mt-2 text-xs text-rose-600">No se pudo cargar la lista: {errorClientes}</p>
        ) : (
          <p className="mt-2 text-[11px] text-slate-500">
            Escribe un ID para buscar. Al elegir, todos los datos del formulario se rellenan automáticamente.
            Nunca se usa para predecir Response.
          </p>
        )}
        {cargandoDetalle && <p className="mt-2 text-xs text-slate-500">Cargando datos del cliente…</p>}
        {errorDetalle && <p className="mt-2 text-xs text-rose-600">{errorDetalle}</p>}
        {detalleCliente && (
          <p className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-2.5 text-sm text-slate-700">
            Cliente <strong className="font-mono">{idCliente(detalleCliente)}</strong>
            {detalleCliente.segmento && (
              <> · segmento <strong>{detalleCliente.segmento}</strong></>
            )}{' '}
            · Gasto histórico total: <strong>${gastoTotal.toLocaleString('es-CL')}</strong>{' '}
            <span className="text-slate-500">(unidades del dataset)</span>
          </p>
        )}
      </section>

      {!cargandoDetalle && groups.map(([group, fields]) => (
        <fieldset key={group} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <legend className="px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-st-dark">
            {group}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((f) => (
              <Field key={f.key} field={f} value={form[f.key]} onChange={set} disabled={formBloqueado} />
            ))}
          </div>
        </fieldset>
      ))}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <strong>Error al evaluar:</strong> {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading || cargandoDetalle || Boolean(errorDetalle)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-st-dark px-7 py-3 text-sm font-semibold text-white shadow-md hover:bg-st disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
              Evaluando…
            </>
          ) : (
            <>Evaluar cliente →</>
          )}
        </button>
        <p className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto">
          POST /api/evaluar → redirige a /resultado-multimodelo?id=…
        </p>
      </div>
    </form>
  );
}
