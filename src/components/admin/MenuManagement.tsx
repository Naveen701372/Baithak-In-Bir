'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  Eye,
  EyeOff,
  Star,
  Package
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import MenuItemForm from './MenuItemForm'
import CategoryManagement from './CategoryManagement'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import { useToast, ToastContainer } from '@/components/ui/Toast'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  is_available: boolean
  is_featured: boolean
  category_id?: string
  display_order: number
  hasOrders?: boolean
  categories?: {
    name: string
  }
  menu_item_inventory?: Array<{
    inventory_item_id: string
    quantity_required: number
    inventory_items: {
      name: string
      unit: string
    }
  }>
}

interface Category {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [currentView, setCurrentView] = useState<'menu' | 'categories'>('menu')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; itemId: string; itemName: string }>({
    isOpen: false,
    itemId: '',
    itemName: ''
  })
  const { toasts, removeToast, showSuccess, showError } = useToast()

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()

    // Set up real-time subscription for menu items
    const subscription = supabase
      .channel('menu-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items'
        },
        () => {
          fetchMenuItems()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (name),
          menu_item_inventory (
            inventory_item_id,
            quantity_required,
            inventory_items (name, unit)
          )
        `)
        .order('display_order', { ascending: true })

      if (error) throw error

      // Check which items have been ordered
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('menu_item_id')

      const orderedItemIds = new Set(orderItems?.map(item => item.menu_item_id) || [])

      // Add cache busting for images and order status
      const itemsWithFreshImages = (data || []).map(item => ({
        ...item,
        image_url: item.image_url ? `${item.image_url}?t=${Date.now()}` : item.image_url,
        hasOrders: orderedItemIds.has(item.id)
      }))

      setMenuItems(itemsWithFreshImages)
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      // First check if this menu item has been ordered
      const { data: orderItems, error: checkError } = await supabase
        .from('order_items')
        .select('id')
        .eq('menu_item_id', id)
        .limit(1)

      if (checkError) {
        console.error('Error checking order items:', JSON.stringify(checkError, null, 2))
        showError('Failed to check dependencies', checkError.message || 'Could not verify if item can be deleted')
        return
      }

      if (orderItems && orderItems.length > 0) {
        showError(
          'Cannot delete menu item',
          'This item has been included in previous orders and cannot be deleted to preserve order history. You can mark it as unavailable instead.'
        )
        return
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) {
        // Better error logging with proper serialization
        console.error('Supabase error deleting menu item:')
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        console.error('Error code:', error.code)
        console.error('Full error object:', JSON.stringify(error, null, 2))

        // Handle foreign key constraint error specifically
        if (error.message?.includes('foreign key constraint') || error.message?.includes('order_items')) {
          showError(
            'Cannot delete menu item',
            'This item is referenced in existing orders and cannot be deleted. Mark it as unavailable instead.'
          )
        } else {
          showError('Failed to delete menu item', error.message || 'An unexpected error occurred')
        }
        return
      }

      setMenuItems(prev => prev.filter(item => item.id !== id))
      // Removed success toast as per user feedback - deletion confirmation is enough
    } catch (error) {
      console.error('Error deleting menu item:', JSON.stringify(error, null, 2))
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to delete menu item', errorMessage)
    }
  }

  const openDeleteConfirmation = async (id: string, name: string) => {
    // Check if item has been ordered before showing confirmation
    try {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('id')
        .eq('menu_item_id', id)
        .limit(1)

      if (error) {
        console.error('Error checking order dependencies:', error)
        showError('Cannot check dependencies', 'Failed to verify if item can be deleted')
        return
      }

      if (orderItems && orderItems.length > 0) {
        showError(
          'Cannot delete "' + name + '"',
          'This item has been included in previous orders and cannot be deleted to preserve order history. You can mark it as unavailable instead.'
        )
        return
      }

      setDeleteConfirmation({ isOpen: true, itemId: id, itemName: name })
    } catch (error) {
      console.error('Error checking dependencies:', error)
      showError('Cannot check dependencies', 'Failed to verify if item can be deleted')
    }
  }

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, itemId: '', itemName: '' })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.itemId) {
      handleDeleteItem(deleteConfirmation.itemId)
    }
  }

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setMenuItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_available: !currentStatus } : item
        )
      )
    } catch (error) {
      console.error('Error updating availability:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to update availability', errorMessage)
    }
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_featured: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setMenuItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_featured: !currentStatus } : item
        )
      )
    } catch (error) {
      console.error('Error updating featured status:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showError('Failed to update featured status', errorMessage)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingItem(null)
    fetchMenuItems()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (currentView === 'categories') {
    return (
      <CategoryManagement
        onBack={() => setCurrentView('menu')}
        onSuccess={() => {
          setCurrentView('menu')
          fetchCategories()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('categories')}
            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
          >
            Manage Categories
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload size={32} />
                  </div>
                )}

                {/* Status badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {item.is_featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                      <Star size={10} />
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${item.is_available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  {item.hasOrders && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Has Orders
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                {item.categories && (
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mb-3">
                    {item.categories.name}
                  </span>
                )}

                {/* Inventory Requirements */}
                {item.menu_item_inventory && item.menu_item_inventory.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Package size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Inventory Requirements:</span>
                    </div>
                    <div className="space-y-1">
                      {item.menu_item_inventory.map((req, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          {req.inventory_items.name}: {req.quantity_required} {req.inventory_items.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.is_available)}
                      className={`p-2 rounded-lg transition-colors ${item.is_available
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-red-600 hover:bg-red-50'
                        }`}
                      title={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                    >
                      {item.is_available ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                      className={`p-2 rounded-lg transition-colors ${item.is_featured
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      title={item.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star size={16} />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setShowForm(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit item"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteConfirmation(item.id, item.name)}
                      className={`p-2 rounded-lg transition-colors ${item.hasOrders
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      title={item.hasOrders ? 'Cannot delete - item has order history' : 'Delete item'}
                      disabled={item.hasOrders}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Upload size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first menu item'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Menu Item
            </button>
          )}
        </div>
      )}

      {/* Menu Item Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MenuItemForm
            item={editingItem}
            categories={categories}
            onClose={() => {
              setShowForm(false)
              setEditingItem(null)
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>


      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteConfirmation.itemName}"? This will permanently remove the item from your menu. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon="delete"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}