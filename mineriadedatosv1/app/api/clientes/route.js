import axios from 'axios';
import { NextResponse } from 'next/server';


const API_URL = process.env.API_URL;

const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(request) {
  if (!API_URL) {
    return NextResponse.json(
      { error: 'Falta API_URL en .env.local.' },
      { status: 503, headers: noStore }
    );
  }

  try {
    const parametros = new URL(request.url).searchParams;
    const response = await axios.get(`${API_URL}/api/clientes`, {
      params: {
        buscar: parametros.get('buscar') || '',
        limite: parametros.get('limite') || '20',
      },
    });
    return NextResponse.json(response.data, { headers: noStore });
  } catch (err) {
    const status = err.response?.status || 502;
    const data = err.response?.data;
    return NextResponse.json(
      { error: data?.error || data?.message || 'No se pudo alcanzar el Flask.' },
      { status, headers: noStore }
    );
  }
}
