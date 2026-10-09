import { proxyBackendGet } from '@/lib/backend-api-proxy';
import type { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { categoryId } = await params;
  return proxyBackendGet(`/stories/category/${encodeURIComponent(categoryId)}`, request);
}
