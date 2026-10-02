import { NextResponse } from 'next/server';
import { mockEvaluar } from '@/lib/mock';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';

  if (!id) {
    return NextResponse.json(
      { error: 'Falta el parámetro ?id=. Evalúa un cliente primero.' },
      { status: 400 }
    );
  }

  const demo = mockEvaluar({});
  demo.id = id;
  demo.nota = 'Resultado demo (mock). El backend aún no expone esta predicción.';
  return NextResponse.json(demo);
}
