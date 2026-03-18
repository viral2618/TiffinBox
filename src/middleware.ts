import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // If user tries to access owner pages, redirect to home
  if (token?.role === 'user' && pathname.startsWith('/owner')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/shops/:path*', '/categories/:path*', '/dishes/:path*', '/profile/:path*', '/favorites/:path*', '/owner/:path*']
}