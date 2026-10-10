import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Sjekk om det finnes noen Supabase auth-kake (sb-*-auth-token)
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  // Hvis uinnlogget og prøver å gå til beskyttet side -> send til /login
  if (!hasAuthCookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Hvis innlogget og prøver å gå til /login -> send til /
  if (hasAuthCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
