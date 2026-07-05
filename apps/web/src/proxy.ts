import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

/**
 * Optimistic auth gate: presence of the session cookie decides between the
 * public and the app area. The API remains the real authority — requests with
 * an invalid token get a 401 and the client clears the session.
 */
export function proxy(request: NextRequest): NextResponse {
  const token = request.cookies.get('fluxo_token')?.value;
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && (isPublic || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ['/((?!_next|favicon\\.ico|.*\\..*).*)'],
};
