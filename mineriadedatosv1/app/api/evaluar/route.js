import { NextResponse } from 'next/server';
import { proxyToBackend, jsonMock } from '@/lib/server';
import { API_CONFIG } from '@/lib/api-config';
import { coerceClientePayload } from '@/lib/cliente-schema';
import { mockEvaluar } from '@/lib/mock';

export async function POST(request) {
  let raw = {};
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 });
  }

  const payload = coerceClientePayload(raw);

  if (!Number.isFinite(payload.Income) || payload.Income < 0) {
    return NextResponse.json({ error: 'Income debe ser un número ≥ 0.' }, { status: 400 });
  }

  const proxied = await proxyToBackend(API_CONFIG.paths.evaluar, {
    method: 'POST',
    body: payload,
  });
  if (proxied) return proxied;

  return jsonMock(mockEvaluar(payload), 200);
}
