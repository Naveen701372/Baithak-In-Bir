'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthContextType, User, LoginCredentials, Permission } from '@/types/auth'
import { AuthService } from '@/lib/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('localStorage.getItem error:', error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('localStorage.setItem error:', error)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage.removeItem error:', error)
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check for existing session on mount (only on client)
  useEffect(() => {
    if (isClient) {
      checkSession()
    }
  }, [isClient])

  const checkSession = async () => {
    try {
      const sessionToken = safeLocalStorage.getItem('session_token')
      if (sessionToken) {
        const userData = await AuthService.verifySession(sessionToken)
        if (userData) {
          setUser(userData)
        } else {
          // Invalid session, clean up
          safeLocalStorage.removeItem('session_token')
        }
      }
    } catch (error) {
      console.error('Session check error:', error)
      safeLocalStorage.removeItem('session_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      const { user: userData, session } = await AuthService.login(credentials)

      // Store session token
      safeLocalStorage.setItem('session_token', session.session_token)
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
      const sessionToken = safeLocalStorage.getItem('session_token')
      if (sessionToken) {
        await AuthService.logout(sessionToken)
      }

      safeLocalStorage.removeItem('session_token')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if server logout fails
      safeLocalStorage.removeItem('session_token')
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
    const [redirecting, setRedirecting] = useState(false)

    // Safe redirect function for client-side navigation
    const safeRedirect = (url: string) => {
      if (typeof window !== 'undefined' && !redirecting) {
        setRedirecting(true)
        window.location.href = url
      }
    }

    if (loading || redirecting) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-light">
              {redirecting ? 'Redirecting...' : 'Loading...'}
            </p>
          </div>
        </div>
      )
    }

    if (!user) {
      // Redirect to login
      safeRedirect('/admin/login')
      return null
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      // Special handling for staff members trying to access dashboard
      if (requiredPermission === 'dashboard' && user?.role === 'staff') {
        // Redirect staff to orders page
        safeRedirect('/admin/orders')
        return null
      }

      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-light text-black mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-8">You don&apos;t have permission to access this page.</p>
            <button
              onClick={() => safeRedirect(user?.permissions.orders ? '/admin/orders' : '/admin/login')}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go to {user?.permissions.orders ? 'Orders' : 'Login'}
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}