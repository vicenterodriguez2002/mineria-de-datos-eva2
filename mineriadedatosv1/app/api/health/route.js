import axios from 'axios';
import { NextResponse } from 'next/server';

const noStore = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'Falta API_URL en .env.local.', source: 'mock' },
      { status: 503, headers: noStore },
    );
  }

  try {
    const response = await axios.get(`${apiUrl}/health`, { timeout: 8000 });
    return NextResponse.json({ ...response.data, source: 'api' }, { headers: noStore });
  } catch (error) {
    const data = error.response?.data;
    return NextResponse.json(
      { error: data?.error || 'No se pudo alcanzar el backend.', source: 'error' },
      { status: error.response?.status || 502, headers: noStore },
    );
  }
}
