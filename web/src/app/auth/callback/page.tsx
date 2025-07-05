'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        console.error('Auth error:', error, errorDescription)
        router.push('/auth/signin?error=' + encodeURIComponent(errorDescription || error))
        return
      }

      if (code) {
        try {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (sessionError) {
            throw sessionError
          }

          // Successfully authenticated

          // Redirect to dashboard or original destination
          const redirectTo = searchParams.get('redirectTo') || '/dashboard'
          router.push(redirectTo)
        } catch (error: any) {
          console.error('Session error:', error)
          router.push('/auth/signin?error=' + encodeURIComponent(error.message))
        }
      } else {
        // No code, redirect to signin
        router.push('/auth/signin')
      }
    }

    handleAuthCallback()
  }, [router, searchParams, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
