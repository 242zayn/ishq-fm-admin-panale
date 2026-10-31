import { BACKEND_API_URL } from '@/lib/backend-api-proxy';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function DELETE(request: NextRequest) {
  const token = (await cookies()).get('user_access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Sign in before deleting your account.' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: 'Confirmation is required.' }, { status: 400 }); }
  if (typeof body !== 'object' || body === null || !('confirmation' in body) || body.confirmation !== 'DELETE-MY-ACCOUNT') {
    return NextResponse.json({ message: 'Type DELETE-MY-ACCOUNT to confirm account deletion.' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${BACKEND_API_URL}/auth/delete-account`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE-MY-ACCOUNT' }), cache: 'no-store'
    });
    const raw = await upstream.text();
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { payload = { message: raw }; }
    const response = NextResponse.json(payload, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } });
    if (upstream.ok) response.cookies.set('user_access_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ message: 'Could not reach the Ishq FM service.' }, { status: 502 });
  }
}
