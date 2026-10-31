import { BACKEND_API_URL } from '@/lib/backend-api-proxy';
import { NextResponse, type NextRequest } from 'next/server';

const TOKEN_COOKIE = 'user_access_token';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || !('email' in body) || typeof body.email !== 'string' || !('otp' in body) || typeof body.otp !== 'string') {
    return NextResponse.json({ message: 'Email and verification code are required.' }, { status: 400 });
  }
  const email = body.email.trim().toLowerCase();
  const otp = body.otp.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ message: 'Enter a valid email and 6-digit code.' }, { status: 400 });
  }
  const payloadToSend: { email: string; otp: string; name?: string } = { email, otp };
  if ('name' in body && typeof body.name === 'string' && body.name.trim()) payloadToSend.name = body.name.trim();
  try {
    const upstream = await fetch(`${BACKEND_API_URL}/auth/email-otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadToSend),
      cache: 'no-store'
    });
    const raw = await upstream.text();
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { payload = { message: raw || 'Invalid response from authentication service.' }; }
    if (!upstream.ok) return NextResponse.json(payload, { status: upstream.status, headers: { 'Cache-Control': 'no-store' } });
    if (typeof payload !== 'object' || payload === null || !('accessToken' in payload) || typeof payload.accessToken !== 'string' || !('user' in payload) || typeof payload.user !== 'object' || payload.user === null || !('role' in payload.user) || payload.user.role !== 'user') {
      return NextResponse.json({ message: 'This sign-in is only available to user accounts.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
    const response = NextResponse.json({ message: 'Signed in successfully.', user: payload.user, isNewUser: 'isNewUser' in payload ? payload.isNewUser : false }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(TOKEN_COOKIE, payload.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: TOKEN_MAX_AGE_SECONDS });
    return response;
  } catch {
    return NextResponse.json({ message: 'Could not reach the Ishq FM service. Please try again.' }, { status: 502 });
  }
}
