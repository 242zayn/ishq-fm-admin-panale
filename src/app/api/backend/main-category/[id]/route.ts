import { proxyBackendRequest } from '@/lib/backend-api-proxy';
import type { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function proxyById(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyBackendRequest(`/main-category/${encodeURIComponent(id)}`, request);
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxyById(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return proxyById(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return proxyById(request, context);
}
