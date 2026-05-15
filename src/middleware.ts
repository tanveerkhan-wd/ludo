import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Protected routes
  const isAuthRoute = pathname.startsWith('/login')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')

  if (isDashboardRoute || isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based access for /admin
    if (isAdminRoute && decoded.userType !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isAuthRoute && token) {
    const decoded = verifyToken(token)
    if (decoded) {
      if (decoded.userType === 'Admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}
