import { proxyBackendRequest } from '@/lib/backend-api-proxy';
import type { NextRequest } from 'next/server';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: NextRequest, { params }: RouteContext) {
  const { path } = await params;

  if (
    path.length === 0 ||
    path.some((segment) => segment === '.' || segment === '..' || /[/\\\0]/.test(segment))
  ) {
    return Response.json({ message: 'Invalid backend API path.' }, { status: 400 });
  }

  const backendPath = `/${path.map((segment) => encodeURIComponent(segment)).join('/')}`;
  return proxyBackendRequest(backendPath, request);
}

export function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function HEAD(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}
