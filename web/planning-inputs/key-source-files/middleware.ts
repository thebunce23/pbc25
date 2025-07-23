import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Check if Supabase credentials are properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
    // Skip authentication checks in development when Supabase is not configured
    console.log('Supabase not properly configured, skipping authentication checks')
    return res
  }
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get hostname and extract subdomain
  const hostname = request.headers.get('host') || ''
  const subdomain = getSubdomain(hostname)

  // Handle subdomain routing
  if (subdomain && subdomain !== 'www') {
    // This is a tenant subdomain
    const url = request.nextUrl.clone()
    
    // Rewrite the URL to include the tenant in the path
    url.pathname = `/tenant/${subdomain}${url.pathname}`
    
    // Check if tenant exists (you might want to cache this)
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (!tenant) {
      // Tenant doesn't exist, redirect to 404 or main site
      url.pathname = '/404'
      return NextResponse.rewrite(url)
    }

    return NextResponse.rewrite(url)
  }

  // Handle authentication for protected routes
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/admin', '/profile', '/settings']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle auth callback
  if (request.nextUrl.pathname === '/auth/callback') {
    const code = request.nextUrl.searchParams.get('code')
    const tenantId = request.nextUrl.searchParams.get('tenant_id')

    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
      
      // If tenant_id is provided, associate user with tenant
      if (tenantId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email!,
              tenant_id: tenantId
            })
        }
      }
    }

    // Redirect to dashboard or original destination
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return res
}

function getSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0]
  
  // Split by dots
  const parts = host.split('.')
  
  // If localhost or IP, no subdomain
  if (parts.length < 3 || host.includes('localhost') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null
  }
  
  // Return the first part as subdomain
  return parts[0]
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}