import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

let backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:5001/api';
while (backendApiUrl.endsWith('/')) {
  backendApiUrl = backendApiUrl.slice(0, -1);
}
export const BACKEND_API_URL = backendApiUrl;

export async function proxyBackendRequest(path: string, request: NextRequest): Promise<Response> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = new URL(BACKEND_API_URL + normalizedPath);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_access_token')?.value;
  const authorization = token ? `Bearer ${token}` : request.headers.get('authorization');
  const acceptLanguage = request.headers.get('accept-language');
  const contentType = request.headers.get('content-type');
  if (authorization) headers.set('authorization', authorization);
  if (acceptLanguage) headers.set('accept-language', acceptLanguage);
  if (contentType) headers.set('content-type', contentType);

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    ...(request.method === 'GET' || request.method === 'HEAD'
      ? {}
      : { body: await request.arrayBuffer() }),
    cache: 'no-store'
  });
  const responseHeaders = new Headers({
    'Cache-Control': 'no-store'
  });
  const responseContentType = backendResponse.headers.get('content-type');
  if (responseContentType) responseHeaders.set('content-type', responseContentType);

  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: responseHeaders
  });
}
