import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hent Supabase session-cookie
  const hasSession = request.cookies.getAll().some((cookie) => 
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );

  // 1. Hvis brukeren IKKE er innlogget og prøver å gå til beskyttede sider -> send til /login
  if (!hasSession && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Hvis brukeren ALLLEREDE er innlogget og prøver å besøke /login -> send til /
  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
