import { NextResponse } from 'next/server';
import { CLIENTE_SCHEMA, coerceClientePayload } from '@/lib/cliente-schema';
import { mockEvaluar } from '@/lib/mock';

export async function POST(request) {
  let raw = {};
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido.' }, { status: 400 });
  }

  const camposBinarios = ['AcceptedCmp1', 'AcceptedCmp2', 'AcceptedCmp3', 'AcceptedCmp4', 'AcceptedCmp5', 'Complain'];
  const campoBinarioInvalido = camposBinarios.find((campo) => {
    const valor = raw[campo];
    if (valor === undefined) return false;
    if (campo === 'Complain' && ['Sí', 'No'].includes(valor)) return false;
    return valor === null || valor === '' || ![0, 1].includes(Number(valor));
  });
  if (campoBinarioInvalido) {
    return NextResponse.json(
      { error: `${campoBinarioInvalido} debe ser 0 o 1.` },
      { status: 400 },
    );
  }

  const payload = coerceClientePayload(raw);

  const campoNegativo = CLIENTE_SCHEMA.find(
    (campo) => campo.type === 'number' && Number(payload[campo.key]) < 0,
  );
  if (campoNegativo) {
    return NextResponse.json(
      { error: `${campoNegativo.label} no puede ser negativo.` },
      { status: 400 },
    );
  }

  if (payload.Income !== null && (!Number.isFinite(payload.Income) || payload.Income < 0)) {
    return NextResponse.json({ error: 'Income debe ser un número ≥ 0.' }, { status: 400 });
  }

  return NextResponse.json(mockEvaluar(payload));
}
