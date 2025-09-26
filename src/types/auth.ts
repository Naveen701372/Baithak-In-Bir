// Authentication and authorization types

export type UserRole = 'owner' | 'manager' | 'staff'

export interface Permission {
  dashboard: boolean
  orders: boolean
  menu: boolean
  inventory: boolean
  analytics: boolean
  users: boolean
  settings: boolean
}

export interface User {
  id: string
  email: string
  role: UserRole
  permissions: Permission
  is_active: boolean
  created_by?: string
  last_login?: string
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserData {
  email: string
  password: string
  role: UserRole
  permissions: Permission
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: keyof Permission) => boolean
  isOwner: () => boolean
  isManager: () => boolean
  isStaff: () => boolean
}

// Default permissions for different roles
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission> = {
  owner: {
    dashboard: true,
    orders: true,
    menu: true,
    inventory: true,
    analytics: true,
    users: true,
    settings: true,
  },
  manager: {
    dashboard: true,
    orders: true,
    menu: true,
    inventory: true,
    analytics: true,
    users: false,
    settings: false,
  },
  staff: {
    dashboard: true,
    orders: true,
    menu: false,
    inventory: false,
    analytics: false,
    users: false,
    settings: false,
  },
}