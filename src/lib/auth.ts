import { supabase, supabaseAdmin } from './supabase'
import { User, LoginCredentials, CreateUserData, UserSession } from '@/types/auth'

import { v4 as uuidv4 } from 'uuid'

export class AuthService {
  // Login user with email and password
  static async login(credentials: LoginCredentials): Promise<{ user: User; session: UserSession }> {
    try {
      // Get user from database
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', credentials.email)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        throw new Error('Invalid email or password')
      }

      // For now, we'll use Supabase Auth for password verification
      // In production, you might want to use bcrypt for custom password hashing
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        throw new Error('Invalid email or password')
      }

      // Clean up any existing sessions for this user
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userData.id)

      // Create session token
      const sessionToken = uuidv4()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour session

      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        throw new Error(`Failed to create session: ${sessionError.message}`)
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id)

      return {
        user: userData as User,
        session: sessionData as UserSession,
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout user
  static async logout(sessionToken: string): Promise<void> {
    try {
      // Remove session from database
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken)

      // Sign out from Supabase Auth
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Verify session token and get user
  static async verifySession(sessionToken: string): Promise<User | null> {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !sessionData) {
        return null
      }

      return sessionData.user_profiles as User
    } catch (error) {
      console.error('Session verification error:', error)
      return null
    }
  }

  // Create new user (only owners can create users)
  static async createUser(userData: CreateUserData, createdBy: string): Promise<User> {
    try {
      // First create user in Supabase Auth using admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      })

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`)
      }

      // Then create user in our user_profiles table using admin client
      const { data: userRecord, error: userError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions,
          created_by: createdBy,
        })
        .select()
        .single()

      if (userError) {
        // If user creation fails, clean up auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        throw new Error(`Failed to create user record: ${userError.message}`)
      }

      return userRecord as User
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }

  // Get all users (for user management)
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`)
      }

      return data as User[]
    } catch (error) {
      console.error('Get users error:', error)
      throw error
    }
  }

  // Update user (for role/permission changes)
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`)
      }

      return data as User
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  // Deactivate user
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) {
        throw new Error(`Failed to deactivate user: ${error.message}`)
      }

      // Also remove all active sessions
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
    } catch (error) {
      console.error('Deactivate user error:', error)
      throw error
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())
    } catch (error) {
      console.error('Cleanup sessions error:', error)
    }
  }
}