import { loginSchema } from '@/features/auth/schemas/login';
import { BACKEND_API_URL } from '@/lib/backend-api-proxy';
import { NextResponse, type NextRequest } from 'next/server';

const TOKEN_COOKIE = 'admin_access_token';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.issues.map((issue) => issue.message) },
      { status: 400 }
    );
  }

  const backendResponse = await fetch(`${BACKEND_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validation.data),
    cache: 'no-store'
  });

  const payload: unknown = await backendResponse.json();
  if (!backendResponse.ok) {
    const response = NextResponse.json(payload, {
      status: backendResponse.status,
      headers: { 'Cache-Control': 'no-store' }
    });
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('accessToken' in payload) ||
    typeof payload.accessToken !== 'string' ||
    !('user' in payload) ||
    typeof payload.user !== 'object' ||
    payload.user === null ||
    !('role' in payload.user) ||
    payload.user.role !== 'admin'
  ) {
    const response = NextResponse.json(
      { message: 'This sign-in is only available to administrator accounts.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    );
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  const response = NextResponse.json(
    {
      message: 'Login successful',
      user: payload.user
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  response.cookies.set(TOKEN_COOKIE, payload.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_MAX_AGE_SECONDS
  });
  return response;
}
