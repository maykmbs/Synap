import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: implementar protección de rutas con Supabase Auth cuando esté configurado
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
