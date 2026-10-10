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
    let message = details;
    try {
      const payload: unknown = JSON.parse(details);
      if (typeof payload === 'object' && payload !== null && 'message' in payload) {
        const apiMessage = payload.message;
        if (typeof apiMessage === 'string') {
          message = apiMessage;
        } else if (
          Array.isArray(apiMessage) &&
          apiMessage.every((item): item is string => typeof item === 'string')
        ) {
          message = apiMessage.join(', ');
        }
      }
    } catch {
      message = details;
    }
    throw new Error(`API error: ${res.status} ${res.statusText}${message ? ` - ${message}` : ''}`);
  }

  return res.json() as Promise<T>;
}
