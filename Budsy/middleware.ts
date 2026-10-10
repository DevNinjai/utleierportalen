import { NextResponse, type NextRequest } from 'next/server';
import { supabase } from './lib/supabaseClient';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Hent auth-token fra kaker dersom det finnes
  const hasAuthToken = request.cookies.getAll().some(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  );

  // Hvis brukeren Ikke er innlogget og prøver å besøke noe annet enn /login
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
