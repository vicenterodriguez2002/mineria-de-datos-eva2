'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { CLIENTE_SCHEMA, getDefaultClientePayload } from '@/lib/cliente-schema';
import { useClientes, useEvaluarCliente } from '@/hooks/useApi';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isFocused ? '#008272' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(0,130,114,0.2)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#008272' : '#94a3b8' },
    fontSize: 14,
    backgroundColor: '#fff',
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
  singleValue: (base) => ({ ...base, fontSize: 14, color: '#0f172a' }),
  placeholder: (base) => ({ ...base, fontSize: 14, color: '#94a3b8' }),
  input: (base) => ({ ...base, fontSize: 14 }),
};

function idCliente(c) {
  if (!c) return '';
  return c.ID ?? c.id ?? '';
}

function toOptions(options) {
  return options.map((op) => (op && typeof op === 'object' ? op : { value: op, label: String(op) }));
}

function Field({ field, value, onChange }) {
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
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
        onChange={(e) =>
          onChange(
            field.key,
            inputType === 'date' ? e.target.value : e.target.value === '' ? '' : Number(e.target.value),
          )
        }
        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 font-mono focus:border-st focus:outline-none focus:ring-2 focus:ring-st/20"
      />
      {field.hint && <p className="mt-1 text-[11px] text-slate-500">{field.hint}</p>}
    </div>
  );
}

export default function EvaluadorForm() {
  const router = useRouter();
  const [form, setForm] = useState(() => getDefaultClientePayload());
  const [clienteId, setClienteId] = useState('');
  const { evaluar, loading, error } = useEvaluarCliente();
  const { data: clientes, loading: loadingClientes, error: errorClientes } = useClientes();

  const groups = useMemo(() => {
    const map = new Map();
    for (const f of CLIENTE_SCHEMA) {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group).push(f);
    }
    return [...map.entries()];
  }, []);

  const clienteOptions = useMemo(
    () =>
      (clientes || []).map((c) => ({
        value: String(idCliente(c)),
        label: `${idCliente(c)}${c.segmento ? ` · ${c.segmento}` : ''}`,
        cliente: c,
      })),
    [clientes],
  );

  const clienteSeleccionado =
    clienteOptions.find((o) => o.value === String(clienteId)) || null;

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

  function reset() {
    setForm(getDefaultClientePayload());
    setClienteId('');
  }

  function onSelectCliente(option) {
    if (!option) {
      setClienteId('');
      return;
    }
    const id = option.value;
    setClienteId(id);
    const c = option.cliente || clientes.find((x) => String(idCliente(x)) === String(id));
    if (!c) return;
    setForm((prev) => {
      const next = { ...prev };
      for (const f of CLIENTE_SCHEMA) {
        const raw = c[f.key];
        if (raw === undefined || raw === null) continue;
        next[f.key] = f.type === 'date' ? String(raw).slice(0, 10) : raw;
      }
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const r = await evaluar(form);
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
        <div className="mt-3 w-full sm:max-w-md">
          <Select
            inputId="cli-id"
            instanceId="cli-id"
            options={clienteOptions}
            value={clienteSeleccionado}
            onChange={onSelectCliente}
            isLoading={loadingClientes}
            isDisabled={loadingClientes}
            isSearchable
            isClearable
            placeholder={loadingClientes ? 'Cargando clientes…' : 'Busca por ID o segmento…'}
            noOptionsMessage={() => 'Sin coincidencias'}
            styles={selectStyles}
            filterOption={(opt, raw) => {
              const q = raw.toLowerCase().trim();
              if (!q) return true;
              const c = opt.data.cliente || {};
              return [
                String(idCliente(c)),
                c.segmento || '',
                c.Education || '',
                c.Marital_Status || '',
              ]
                .join(' ')
                .toLowerCase()
                .includes(q);
            }}
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
        {errorClientes ? (
          <p className="mt-2 text-xs text-rose-600">No se pudo cargar la lista: {errorClientes}</p>
        ) : (
          <p className="mt-2 text-[11px] text-slate-500">
            Escribe para filtrar. Al elegir, todos los datos del formulario se rellenan automáticamente.
            Nunca se usa para predecir Response.
          </p>
        )}
        {clienteSeleccionado && (
          <p className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-2.5 text-sm text-slate-700">
            Cliente <strong className="font-mono">{idCliente(clienteSeleccionado.cliente)}</strong>
            {clienteSeleccionado.cliente?.segmento && (
              <> · segmento <strong>{clienteSeleccionado.cliente.segmento}</strong></>
            )}{' '}
            · Gasto histórico total: <strong>${gastoTotal.toLocaleString('es-CL')}</strong>{' '}
            <span className="text-slate-500">(unidades del dataset)</span>
          </p>
        )}
      </section>

      {groups.map(([group, fields]) => (
        <fieldset key={group} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <legend className="px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-st-dark">
            {group}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((f) => (
              <Field key={f.key} field={f} value={form[f.key]} onChange={set} />
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
          disabled={loading}
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
        <button
          type="button"
          onClick={reset}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-st hover:text-st transition-all"
        >
          Restablecer
        </button>
        <p className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto">
          POST /api/evaluar → redirige a /resultado-multimodelo?id=…
        </p>
      </div>
    </form>
  );
}
