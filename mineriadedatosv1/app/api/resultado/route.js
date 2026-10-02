import { NextResponse } from 'next/server';
import { proxyToBackend, jsonMock } from '@/lib/server';
import { API_CONFIG } from '@/lib/api-config';
import { mockEvaluar } from '@/lib/mock';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';

  const proxied = await proxyToBackend(
    `${API_CONFIG.paths.resultado}${id ? `?id=${encodeURIComponent(id)}` : ''}`
  );
  if (proxied) return proxied;

  if (!id) {
    return NextResponse.json(
      { error: 'Falta el parámetro ?id=. Evalúa un cliente primero.' },
      { status: 400 }
    );
  }

  const demo = mockEvaluar({});
  demo.id = id;
  demo.nota = 'Resultado demo (mock). Conecta el backend para ver la predicción real.';
  return jsonMock(demo);
}
