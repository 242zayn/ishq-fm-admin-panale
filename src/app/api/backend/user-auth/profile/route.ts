import { BACKEND_API_URL } from '@/lib/backend-api-proxy';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in.' }, { status: 401 });
  try {
    const upstream = await fetch(`${BACKEND_API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    const raw = await upstream.text();
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { payload = { message: raw }; }
    const response = NextResponse.json(payload, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } });
    if (upstream.status === 401) response.cookies.set('user_access_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ message: 'Could not reach the Ishq FM service.' }, { status: 502 });
  }
}
