import { NextResponse } from 'next/server';
import { proxyToBackend, jsonMock } from '@/lib/server';
import { API_CONFIG } from '@/lib/api-config';
import { obtener_clientes, obtener_cliente_por_id } from './datos';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';

  const suffix = id ? `?id=${encodeURIComponent(id)}` : '';
  const proxied = await proxyToBackend(`${API_CONFIG.paths.clientes}${suffix}`);
  if (proxied) return proxied;

  if (id) {
    const cliente = await obtener_cliente_por_id(id);
    if (!cliente) {
      return NextResponse.json({ error: `Cliente ${id} no encontrado.` }, { status: 404 });
    }
    return jsonMock({ source: 'mock', ...cliente });
  }

  const clientes = await obtener_clientes();
  return jsonMock({ source: 'mock', count: clientes.length, clientes });
}
