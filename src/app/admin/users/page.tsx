'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, User, Settings, Shield, Lock, Eye, LayoutDashboard, ShoppingBag, Menu as MenuIcon, Package, BarChart3, Users } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAuth } from '@/contexts/AuthContext'
import { AuthService } from '@/lib/auth'
import { User as UserType, CreateUserData, DEFAULT_PERMISSIONS } from '@/types/auth'
import { useRoles } from '@/hooks/useRoles'

function UsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState('')

  const [newUser, setNewUser] = useState<CreateUserData>({
    email: '',
    password: '',
    role: 'staff',
    permissions: DEFAULT_PERMISSIONS.staff,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const usersData = await AuthService.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')

    try {
      // Get current user ID from localStorage session
      const sessionToken = localStorage.getItem('session_token')
      if (!sessionToken) {
        throw new Error('No valid session')
      }

      const currentUser = await AuthService.verifySession(sessionToken)
      if (!currentUser) {
        throw new Error('Invalid session')
      }

      await AuthService.createUser(newUser, currentUser.id)

      // Reset form
      setNewUser({
        email: '',
        password: '',
        role: 'staff',
        permissions: DEFAULT_PERMISSIONS.staff,
      })

      setShowCreateModal(false)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Create user error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleRoleChange = (role: 'owner' | 'manager' | 'staff') => {
    setNewUser(prev => ({
      ...prev,
      role,
      permissions: DEFAULT_PERMISSIONS[role],
    }))
  }

  const handleEditUser = (user: UserType) => {
    setEditingUser(user)
    setShowEditModal(true)
    setError('')
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setUpdateLoading(true)
    setError('')

    try {
      // Here you would implement the user update logic
      // For now, just simulate success
      console.log('Updating user:', editingUser)

      setShowEditModal(false)
      setEditingUser(null)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Update user error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setUpdateLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'staff': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'users'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <User size={16} className="mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeTab === 'roles'
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Settings size={16} className="mr-2" />
              Roles & Permissions
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'users' ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
              </div>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add User
              </motion.button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Users List - Responsive Design */}
            <div className="space-y-4">
              {/* Desktop Table - Hidden on Mobile */}
              <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <User size={16} className="text-black" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-black">{user.email}</p>
                                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-gray-600 hover:text-black transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              {user.role !== 'owner' && (
                                <button className="text-red-600 hover:text-red-700 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards - Shown on Mobile/Tablet */}
              <div className="lg:hidden space-y-4">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <User size={18} className="text-black" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-black truncate">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        {user.role !== 'owner' && (
                          <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                >
                  <h2 className="text-xl font-semibold text-black mb-4">Add New User</h2>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="space-y-4">


                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="Enter password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-3">
                        Role
                      </label>
                      <div className="space-y-3">
                        {(['staff', 'manager', 'owner'] as const).map((role) => (
                          <label key={role} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="role"
                              value={role}
                              checked={newUser.role === role}
                              onChange={(e) => handleRoleChange(e.target.value as 'owner' | 'manager' | 'staff')}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900 capitalize">
                              {role}
                              <span className="text-xs text-gray-500 ml-2">
                                {role === 'staff' && '(Orders only)'}
                                {role === 'manager' && '(Most features)'}
                                {role === 'owner' && '(Full access)'}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createLoading}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {createLoading ? 'Creating...' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                >
                  <h2 className="text-xl font-semibold text-black mb-4">Edit User</h2>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleUpdateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-3">
                        Role
                      </label>
                      <div className="space-y-3">
                        {(['staff', 'manager', 'owner'] as const).map((role) => (
                          <label key={role} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="editRole"
                              value={role}
                              checked={editingUser.role === role}
                              onChange={(e) => setEditingUser(prev => prev ? ({
                                ...prev,
                                role: e.target.value as 'owner' | 'manager' | 'staff',
                                permissions: DEFAULT_PERMISSIONS[e.target.value as 'owner' | 'manager' | 'staff']
                              }) : null)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900 capitalize">
                              {role}
                              <span className="text-xs text-gray-500 ml-2">
                                {role === 'staff' && '(Orders only)'}
                                {role === 'manager' && '(Most features)'}
                                {role === 'owner' && '(Full access)'}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-3">
                        Status
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={editingUser.is_active}
                            onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, is_active: true }) : null)}
                            className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            Active
                            <span className="text-xs text-gray-500 ml-2">(User can login)</span>
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="inactive"
                            checked={!editingUser.is_active}
                            onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, is_active: false }) : null)}
                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 focus:ring-2"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            Inactive
                            <span className="text-xs text-gray-500 ml-2">(User cannot login)</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false)
                          setEditingUser(null)
                          setError('')
                        }}
                        className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {updateLoading ? 'Updating...' : 'Update User'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        ) : (
          // Roles & Permissions Tab
          <RolesManagement />
        )}
      </div>
    </AdminLayout>
  )
}

// Roles Management Component
function RolesManagement() {
  const { roles, loading, error, updateRole } = useRoles()
  const [editingRole, setEditingRole] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  const permissionLabels = {
    dashboard: { name: 'Dashboard', description: 'Access to overview and statistics', icon: LayoutDashboard },
    orders: { name: 'Orders', description: 'Manage customer orders', icon: ShoppingBag },
    menu: { name: 'Menu', description: 'Manage menu items and categories', icon: MenuIcon },
    inventory: { name: 'Inventory', description: 'Track and manage stock levels', icon: Package },
    analytics: { name: 'Analytics', description: 'View sales reports and trends', icon: BarChart3 },
    users: { name: 'Users', description: 'Manage staff and permissions', icon: Users },
    settings: { name: 'Settings', description: 'System and restaurant settings', icon: Settings },
  }

  const handleEditRole = (role: any) => {
    setEditingRole({ ...role })
    setShowEditModal(true)
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    setUpdating(true)
    const success = await updateRole(editingRole.id, editingRole.permissions, editingRole.description)

    if (success) {
      setShowEditModal(false)
      setEditingRole(null)
    }
    setUpdating(false)
  }

  const handlePermissionChange = (permission: string, value: boolean) => {
    if (!editingRole) return

    setEditingRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">Role Permissions</h2>
          <p className="text-sm text-gray-600 mt-1">Manage what each role can access</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-3">
                  <Shield size={18} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-black">{role.name}</h3>
                  <p className="text-xs text-gray-500">{role.user_count} users</p>
                </div>
              </div>
              <button
                onClick={() => handleEditRole(role)}
                className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit size={14} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{role.description}</p>

            {/* Permission Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Permissions</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(role.permissions).map(([key, value]) => {
                  const PermissionIcon = permissionLabels[key as keyof typeof permissionLabels]?.icon || Lock
                  return (
                    <div key={key} className={`flex items-center text-xs ${value ? 'text-green-700' : 'text-gray-400'}`}>
                      <PermissionIcon size={12} className="mr-1.5" />
                      <span className="capitalize">{key}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-black mb-4">Edit {editingRole.name} Permissions</h2>
            <p className="text-sm text-gray-600 mb-6">{editingRole.description}</p>

            <div className="space-y-4">
              {Object.entries(permissionLabels).map(([key, info]) => {
                const IconComponent = info.icon
                return (
                  <div key={key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <IconComponent size={16} className="text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black">{info.name}</h4>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`${key}_permission`}
                          checked={!editingRole.permissions[key]}
                          onChange={() => handlePermissionChange(key, false)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Deny</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`${key}_permission`}
                          checked={editingRole.permissions[key]}
                          onChange={() => handlePermissionChange(key, true)}
                          className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingRole(null)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                disabled={updating}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default withAuth(UsersPage, 'users')