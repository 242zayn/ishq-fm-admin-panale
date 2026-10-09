import { proxyBackendGet } from '@/lib/backend-api-proxy';
import type { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  return proxyBackendGet('/stories', request);
}
