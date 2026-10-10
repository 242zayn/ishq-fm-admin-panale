import { proxyBackendRequest } from '@/lib/backend-api-proxy';
import type { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  return proxyBackendRequest('/main-category', request);
}

export function POST(request: NextRequest) {
  return proxyBackendRequest('/main-category', request);
}
