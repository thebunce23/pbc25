import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient as createSupabaseServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Client-side Supabase client (for use in client components)
export const createClient = () => {
  // Check if Supabase is configured with real values (not placeholders)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_anon_key') {
    // Return a mock client for development
    console.log('Using mock Supabase client - not configured or using placeholder values')
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
          // Mock implementation - immediately call callback with no session
          setTimeout(() => callback('SIGNED_OUT', null), 0)
          // Return unsubscribe function directly (based on how it's used in auth-context.tsx)
          return () => {}
        }
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        insert: () => ({
          select: () => Promise.resolve({ data: null, error: null })
        }),
        upsert: () => Promise.resolve({ data: null, error: null })
      })
    } as any
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server component Supabase client (for use in server components)
export const createServerClient = () => {
  const { cookies } = require('next/headers')
  return createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )
}

// Admin client (for server-side operations requiring elevated permissions)
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (to be generated later)
export type Database = {
  public: {
    Tables: Record<string, any>
    Enums: Record<string, any>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]
