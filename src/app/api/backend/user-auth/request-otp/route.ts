import { BACKEND_API_URL } from '@/lib/backend-api-proxy';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const email = typeof body === 'object' && body !== null && 'email' in body && typeof body.email === 'string'
    ? body.email.trim().toLowerCase()
    : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${BACKEND_API_URL}/auth/email-otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      cache: 'no-store'
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch {
    return NextResponse.json({ message: 'Could not reach the Ishq FM service. Please try again.' }, { status: 502 });
  }
}
