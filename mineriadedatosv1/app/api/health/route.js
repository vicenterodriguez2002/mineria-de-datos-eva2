import { NextResponse } from 'next/server';
import { proxyToBackend, jsonMock } from '@/lib/server';
import { API_CONFIG } from '@/lib/api-config';

export async function GET() {
  const proxied = await proxyToBackend(API_CONFIG.paths.health);
  if (proxied) return proxied;

  return jsonMock({
    source: 'mock',
    status: 'ok',
    mode: 'mock',
    message: 'API lista en modo demo. Configura NEXT_PUBLIC_API_URL para conectar el backend real.',
    time: new Date().toISOString(),
  });
}
