import { NextRequest, NextResponse } from 'next/server';

// CRITICAL: Middleware ALWAYS runs in Edge Runtime
// Edge Runtime does NOT support Node.js crypto module
// Therefore we CANNOT use JWT/bcrypt here
// Solution: Only check cookie existence here, validate JWT in page routes

export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow login, logout pages and API routes
  if (pathname === '/admin/login' || 
      pathname === '/admin/logout' || 
      pathname === '/admin' ||
      pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // For protected admin routes, just check if cookie exists
  // Full JWT validation happens in the page component (nodejs runtime)
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_token')?.value;
    
    if (!token) {
      console.log('No token, redirect to login from:', pathname);
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    
    console.log('Token exists, allow (validation in page)');
  }
  
  return NextResponse.next();
}
