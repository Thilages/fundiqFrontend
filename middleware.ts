import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('🛡️ Middleware processing:', request.nextUrl.pathname);
  
  // Get the JWT token from cookies
  const token = request.cookies.get('jwt_token')?.value;
  console.log('🎫 Token in middleware:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
  
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  console.log('🔓 Is public path:', isPublicPath, 'for', pathname);

  // If user is on login page and has a token, redirect to home
  if (pathname === '/login' && token) {
    console.log('🔄 Redirecting from login to home (user has token)');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // For API routes that need authentication, check for token
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !token) {
    console.log('🔄 API route requires token but none found:', pathname);
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // For API routes to Flask backend, add JWT token to Authorization header
  // Skip auth endpoints as they handle their own token extraction
  if (pathname.startsWith('/api/') && token && !pathname.startsWith('/api/auth/')) {
    console.log('🔑 Adding Authorization header to API request:', pathname);
    const response = NextResponse.next();
    response.headers.set('Authorization', `Bearer ${token}`);
    console.log('✅ Authorization header added');
    return response;
  }

  console.log('➡️ Proceeding without modification');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
