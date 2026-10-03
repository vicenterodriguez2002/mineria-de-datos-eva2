import axios from 'axios';
import { NextResponse } from 'next/server';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || '';

  if (!id) {
    return NextResponse.json(
      { error: 'Falta el parámetro ?id=. Evalúa un cliente primero.' },
      { status: 400, headers: noStore },
    );
  }

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'Falta API_URL en .env.local.' },
      { status: 503, headers: noStore },
    );
  }

  try {
    const response = await axios.get(`${apiUrl}/api/resultado/${encodeURIComponent(id)}`, {
      timeout: 15000,
    });
    return NextResponse.json(response.data, { headers: noStore });
  } catch (error) {
    const status = error.response?.status || 502;
    const data = error.response?.data;
    return NextResponse.json(
      { error: data?.error || data?.message || 'No se pudo alcanzar el backend.' },
      { status, headers: noStore },
    );
  }
}
