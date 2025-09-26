'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContextType, User, LoginCredentials, Permission } from '@/types/auth'
import { AuthService } from '@/lib/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token')
      if (sessionToken) {
        const userData = await AuthService.verifySession(sessionToken)
        if (userData) {
          setUser(userData)
        } else {
          // Invalid session, clean up
          localStorage.removeItem('session_token')
        }
      }
    } catch (error) {
      console.error('Session check error:', error)
      localStorage.removeItem('session_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      const { user: userData, session } = await AuthService.login(credentials)
      
      // Store session token
      localStorage.setItem('session_token', session.session_token)
      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem('session_token')
      if (sessionToken) {
        await AuthService.logout(sessionToken)
      }
      
      localStorage.removeItem('session_token')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if server logout fails
      localStorage.removeItem('session_token')
      setUser(null)
    }
  }

  const hasPermission = (permission: keyof Permission): boolean => {
    if (!user) return false
    return user.permissions[permission] === true
  }

  const isOwner = (): boolean => {
    return user?.role === 'owner'
  }

  const isManager = (): boolean => {
    return user?.role === 'manager'
  }

  const isStaff = (): boolean => {
    return user?.role === 'staff'
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isOwner,
    isManager,
    isStaff,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: keyof Permission
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, hasPermission } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-light">Loading...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      // Redirect to login
      window.location.href = '/admin/login'
      return null
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-light text-black mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}