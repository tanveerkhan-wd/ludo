import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Protected routes
  const isAuthRoute = pathname.startsWith('/login')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiAdminRoute = pathname.startsWith('/api/admin')

  if (isDashboardRoute || isAdminRoute || isApiAdminRoute) {
    if (!token) {
      if (isApiAdminRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      if (isApiAdminRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based access for /admin
    if ((isAdminRoute || isApiAdminRoute) && decoded.userType !== 'Admin') {
      if (isApiAdminRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isAuthRoute && token) {
    const decoded = await verifyToken(token)
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
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*', '/login'],
}
