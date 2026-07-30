import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const PORTAL_TYPE = 'admin';
const ALLOWED_COOKIE_NAMES = new Set(["access_token", "refresh_token"]);
const PROXY_TIMEOUT_MS = 50000;

function getBackendBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').trim();
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    if (url.endsWith('/api')) {
      url += '/v1';
    } else {
      url += '/api/v1';
    }
  }
  return url;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function forwardRequest(request: NextRequest, path: string, method: string) {
  try {
    const baseUrl = getBackendBaseUrl();
    let strippedPath = path;
    if (strippedPath.startsWith('v1/')) {
      strippedPath = strippedPath.slice(3);
    } else if (strippedPath.startsWith('api/v1/')) {
      strippedPath = strippedPath.slice(7);
    }

    const searchParams = request.nextUrl.search;
    const backendUrl = `${baseUrl}/${strippedPath}${searchParams}`;

    let body: BodyInit | undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      body = await request.blob();
    }

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');

    // Force backend mail/auth context for this frontend app.
    headers.set('x-portal-type', PORTAL_TYPE);

    // Forward auth cookies
    const portalCookies = request.cookies
      .getAll()
      .filter((cookie) => ALLOWED_COOKIE_NAMES.has(cookie.name));

    if (portalCookies.length > 0) {
      headers.set('cookie', portalCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; '));
    } else {
      headers.delete('cookie');
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body,
      credentials: 'include',
      cache: 'no-store',
    };

    let backendResponse: Response;
    try {
      backendResponse = await fetchWithTimeout(backendUrl, fetchOptions, PROXY_TIMEOUT_MS);
    } catch (err) {
      // Retry once after 1.5s delay if cold start timed out or aborted
      console.warn(`[Proxy:${PORTAL_TYPE}] Initial attempt failed for ${backendUrl}, retrying for cold-start...`, err);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      backendResponse = await fetchWithTimeout(backendUrl, fetchOptions, PROXY_TIMEOUT_MS);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Proxy:${PORTAL_TYPE}] Forwarding ${method} to ${backendUrl}`);
    }

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'set-cookie'].includes(lowerKey)) {
        responseHeaders.append(key, value);
      }
    });

    const setCookieHeaders = backendResponse.headers.getSetCookie?.();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => responseHeaders.append('Set-Cookie', cookie));
    }

    const responseData = await backendResponse.blob();
    return new NextResponse(responseData, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json(
      { success: false, message: 'Proxy request failed: Backend unreachable or timed out' },
      { status: 504 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathArray } = await params;
  return forwardRequest(request, pathArray.join('/'), 'GET');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathArray } = await params;
  return forwardRequest(request, pathArray.join('/'), 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathArray } = await params;
  return forwardRequest(request, pathArray.join('/'), 'PUT');
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathArray } = await params;
  return forwardRequest(request, pathArray.join('/'), 'PATCH');
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathArray } = await params;
  return forwardRequest(request, pathArray.join('/'), 'DELETE');
}

export async function HEAD(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathArray } = await params;
  return forwardRequest(request, pathArray.join('/'), 'HEAD');
}

export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: pathArray } = await params;
  return forwardRequest(request, pathArray.join('/'), 'OPTIONS');
}

