import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function middleware(request: NextRequest) {
  console.log('MIDDLEWARE START:', request.nextUrl.pathname)
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Protected routes
  const isAuthRoute = pathname.startsWith('/login')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isWalletRoute = pathname.startsWith('/wallet')
  const isProfileRoute = pathname.startsWith('/profile')
  const isBattlesRoute = pathname.startsWith('/battles')
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiAdminRoute = pathname.startsWith('/api/admin')

  if (isDashboardRoute || isWalletRoute || isProfileRoute || isBattlesRoute || isAdminRoute || isApiAdminRoute) {
    console.log('MIDDLEWARE: Protected route detected')
    if (!token) {
      console.log('MIDDLEWARE: No token, redirecting to /login')
      if (isApiAdminRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('MIDDLEWARE: Verifying token')
    const decoded = await verifyToken(token)
    console.log('MIDDLEWARE: Token decoded:', !!decoded)
    if (!decoded) {
      if (isApiAdminRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based access for /admin
    if ((isAdminRoute || isApiAdminRoute) && decoded.userType !== 'Admin') {
      console.log('MIDDLEWARE: Forbidden for non-admin')
      if (isApiAdminRoute) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isAuthRoute && token) {
    console.log('MIDDLEWARE: Auth route with token')
    const decoded = await verifyToken(token)
    if (decoded) {
      console.log('MIDDLEWARE: Already logged in, redirecting')
      if (decoded.userType === 'Admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  console.log('MIDDLEWARE END: NEXT')
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/wallet/:path*', '/profile/:path*', '/battles/:path*', '/admin/:path*', '/api/admin/:path*', '/login'],
}
