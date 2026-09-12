import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkApiRateLimit } from '@/lib/security/api-rate-limiter';

// Allowed CORS origins
const ALLOWED_ORIGINS = [
  'https://klambi.id',
  'https://www.klambi.id',
  'http://localhost:3000',
  'http://localhost:4028',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Force HTTPS / TLS 1.2+ in production
  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host') || '';
  if (process.env.NODE_ENV === 'production' && proto === 'http' && !host.includes('localhost')) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 2. Strict CORS Policy
  const origin = request.headers.get('origin');
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Klambi-Api-Key, X-Klambi-Signature, X-Klambi-Timestamp, Idempotency-Key'
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
  }

  // Handle preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  // 3. API Rate Limiting for /api/ routes
  if (pathname.startsWith('/api/')) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateResult = checkApiRateLimit(clientIp, pathname);

    response.headers.set('X-RateLimit-Limit', rateResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateResult.resetTimeSec.toString());

    if (!rateResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Batas kuota akses API terlampaui. Silakan tunggu beberapa saat demi keamanan sistem.',
          retryAfterSeconds: rateResult.resetTimeSec,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateResult.resetTimeSec.toString(),
          },
        }
      );
    }
  }

  // 4. Edge Security Headers injection
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
