import { NextResponse } from 'next/server';
import { getMetricasDiagnostico } from '@/lib/api/backend';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  
  const res = await getMetricasDiagnostico();

  if (!res.configured) {
    return NextResponse.json(
      { error: 'Configura API_URL para leer el diagnóstico.' },
      { status: 503, headers: noStore }
    );
  }

  if (res.error || !res.data || !Number.isFinite(Number(res.data.base_historica))) {
    return NextResponse.json(
      { error: res.error || 'El backend no devolvió las métricas.' },
      { status: res.status || 502, headers: noStore }
    );
  }

  return NextResponse.json(res.data, { headers: noStore });
}
