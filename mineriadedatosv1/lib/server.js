/**
 * Helpers solo-servidor para los proxy /api/*.
 * Si hay API_URL (o NEXT_PUBLIC_API_URL) reenvían al backend real,
 * si no, el route devuelve el mock local.
 */
import { NextResponse } from 'next/server';

export function getBackendBase() {
  const raw = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/$/, '');
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
}

export function getBackendHeaders(extra = {}) {
  const key = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';
  return {
    'Content-Type': 'application/json',
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
    ...extra,
  };
}

export async function proxyToBackend(path, { method = 'GET', body } = {}) {
  const base = getBackendBase();
  if (!base) return null; // modo mock
  const url = `${base}${path}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      method,
      headers: getBackendHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || `Backend respondió ${res.status}` },
        { status: res.status }
      );
    }
    return NextResponse.json({ ...data, source: 'api' });
  } catch (e) {
    return NextResponse.json(
      { error: 'No se pudo alcanzar el backend. Revisa API_URL.' },
      { status: 502 }
    );
  } finally {
    clearTimeout(t);
  }
}

export function jsonMock(data, status = 200) {
  return NextResponse.json(data, { status });
}
