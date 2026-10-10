import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Sjekk om det finnes en Supabase auth-cookie
  const hasAuthToken = request.cookies.getAll().some((cookie) =>
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );

  // Hvis brukeren IKKE er innlogget og prøver å besøke en beskyttet side
  if (!hasAuthToken && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Hvis brukeren ER innlogget og besøker /login
  if (hasAuthToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
