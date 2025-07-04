import { createClient } from './supabase'

export interface User {
  id: string
  email: string
  tenantId?: string
  roleId?: string
  roleName?: string
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  createdAt: string
}

export class AuthService {
  private supabase = createClient()

  // Get current user with tenant and role information
  async getCurrentUser(): Promise<User | null> {
    try {
      // Check if Supabase is configured (not placeholder values)
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'placeholder_anon_key') {
        // Return mock user for development
        console.log('Using mock user - Supabase not configured or using placeholder values')
        return {
          id: 'mock-user-id',
          email: 'demo@example.com',
          tenantId: 'mock-tenant-id',
          roleId: 'mock-admin-role',
          roleName: 'Admin'
        }
      }

      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) return null

      // Get user's tenant and role information
      const { data: userData } = await this.supabase
        .from('users')
        .select(`
          id,
          email,
          tenant_id,
          role_id,
          roles (
            name
          )
        `)
        .eq('id', user.id)
        .single()

      if (!userData) return null

      return {
        id: userData.id,
        email: userData.email,
        tenantId: userData.tenant_id,
        roleId: userData.role_id,
        roleName: (userData.roles as any)?.name
      }
    } catch (error) {
      console.error('Auth error:', error)
      // Return mock user for development when auth fails
      return {
        id: 'mock-user-id',
        email: 'demo@example.com',
        tenantId: 'mock-tenant-id',
        roleId: 'mock-admin-role',
        roleName: 'Admin'
      }
    }
  }

  // Get tenant by subdomain
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    const { data: tenant } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .single()

    return tenant
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string, tenantId?: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Update user's tenant if provided
    if (tenantId && data.user) {
      await this.supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          tenant_id: tenantId
        })
    }

    return data
  }

  // Sign in with SSO provider
  async signInWithSSO(provider: 'azure' | 'google', tenantId?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        queryParams: tenantId ? { tenant_id: tenantId } : undefined
      }
    })

    if (error) throw error
    return data
  }

  // Sign up new user
  async signUp(email: string, password: string, tenantId?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error

    // Create user record with tenant association
    if (data.user && tenantId) {
      await this.supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          tenant_id: tenantId
        })
    }

    return data
  }

  // Sign out
  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  // Create new tenant (for self-service registration)
  async createTenant(name: string, subdomain: string, adminEmail: string) {
    // First check if subdomain is available
    const { data: existing } = await this.supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (existing) {
      throw new Error('Subdomain already exists')
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await this.supabase
      .from('tenants')
      .insert({
        name,
        subdomain
      })
      .select()
      .single()

    if (tenantError) throw tenantError

    // Create default roles for the tenant
    const defaultRoles = [
      { name: 'Admin', tenant_id: tenant.id },
      { name: 'Manager', tenant_id: tenant.id },
      { name: 'Member', tenant_id: tenant.id },
      { name: 'Guest', tenant_id: tenant.id }
    ]

    const { data: roles, error: rolesError } = await this.supabase
      .from('roles')
      .insert(defaultRoles)
      .select()

    if (rolesError) throw rolesError

    // Find admin role
    const adminRole = roles.find((role: any) => role.name === 'Admin')

    // Create admin user if provided
    if (adminEmail && adminRole) {
      const { data: adminUser, error: adminError } = await this.supabase.auth.signUp({
        email: adminEmail,
        password: Math.random().toString(36).slice(-8) // Temporary password
      })

      if (!adminError && adminUser.user) {
        await this.supabase
          .from('users')
          .insert({
            id: adminUser.user.id,
            email: adminEmail,
            tenant_id: tenant.id,
            role_id: adminRole.id
          })
      }
    }

    return tenant
  }

  // Check if user has required role
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('users')
      .select(`
        roles (
          name
        )
      `)
      .eq('id', userId)
      .single()

    return (data?.roles as any)?.name === roleName
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }
}

export const authService = new AuthService()
