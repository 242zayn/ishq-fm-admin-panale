import type { NextRequest } from 'next/server';

const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? 'http://localhost:5001/api').replace(
  /\/+$/,
  ''
);

export async function proxyBackendGet(path: string, request: NextRequest): Promise<Response> {
  const targetUrl = new URL(`${BACKEND_API_URL}${path.startsWith('/') ? path : `/${path}`}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const acceptLanguage = request.headers.get('accept-language');
  if (authorization) headers.set('authorization', authorization);
  if (acceptLanguage) headers.set('accept-language', acceptLanguage);

  const backendResponse = await fetch(targetUrl, {
    headers,
    cache: 'no-store'
  });
  const responseHeaders = new Headers({
    'Cache-Control': 'no-store'
  });
  const contentType = backendResponse.headers.get('content-type');
  if (contentType) responseHeaders.set('content-type', contentType);

  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: responseHeaders
  });
}
