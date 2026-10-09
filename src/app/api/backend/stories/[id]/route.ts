import { proxyBackendGet } from '@/lib/backend-api-proxy';
import type { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyBackendGet(`/stories/${encodeURIComponent(id)}`, request);
}
