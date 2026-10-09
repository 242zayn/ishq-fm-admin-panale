const BASE_URL = '/api';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
  baseUrl = BASE_URL
): Promise<T> {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${normalizedBaseUrl}${normalizedEndpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`API error: ${res.status} ${res.statusText}${details ? ` - ${details}` : ''}`);
  }

  return res.json() as Promise<T>;
}
