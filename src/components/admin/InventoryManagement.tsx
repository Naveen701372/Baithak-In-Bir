'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import InventoryItemForm from './InventoryItemForm'

interface InventoryItem {
  id: string
  name: string
  unit: string
  current_stock: number
  minimum_stock: number
  cost_per_unit: number
  supplier?: string
  last_restocked?: string
  created_at: string
  updated_at: string
}

export default function InventoryManagement() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'low-stock' | 'out-of-stock'>('all')
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null)
  const [restockQuantity, setRestockQuantity] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchInventoryItems()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setInventoryItems(data || [])
    } catch (error) {
      console.error('Error fetching inventory items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!deletingItem) return

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', deletingItem.id)

      if (error) throw error

      setInventoryItems(prev => prev.filter(item => item.id !== deletingItem.id))
      setShowDeleteModal(false)
      setDeletingItem(null)
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      alert('Failed to delete inventory item')
    }
  }

  const openDeleteModal = (item: InventoryItem) => {
    setDeletingItem(item)
    setShowDeleteModal(true)
  }

  const handleRestockItem = async () => {
    if (!restockingItem || !restockQuantity) return

    const additionalStock = Number(restockQuantity)
    if (isNaN(additionalStock) || additionalStock <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    try {
      const newStock = restockingItem.current_stock + additionalStock

      const { error } = await supabase
        .from('inventory_items')
        .update({
          current_stock: newStock,
          last_restocked: new Date().toISOString()
        })
        .eq('id', restockingItem.id)

      if (error) throw error

      setInventoryItems(prev =>
        prev.map(item =>
          item.id === restockingItem.id
            ? { ...item, current_stock: newStock, last_restocked: new Date().toISOString() }
            : item
        )
      )

      setShowRestockModal(false)
      setRestockingItem(null)
      setRestockQuantity('')
    } catch (error) {
      console.error('Error restocking item:', error)
      alert('Failed to restock item')
    }
  }

  const openRestockModal = (item: InventoryItem) => {
    setRestockingItem(item)
    setRestockQuantity('')
    setShowRestockModal(true)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= 0) return 'out-of-stock'
    if (item.current_stock <= item.minimum_stock) return 'low-stock'
    return 'in-stock'
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'bg-red-100 text-red-800'
      case 'low-stock': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'Out of Stock'
      case 'low-stock': return 'Low Stock'
      default: return 'In Stock'
    }
  }

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())

    const status = getStockStatus(item)
    const matchesFilter = filterType === 'all' ||
      (filterType === 'low-stock' && status === 'low-stock') ||
      (filterType === 'out-of-stock' && status === 'out-of-stock')

    return matchesSearch && matchesFilter
  })

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingItem(null)
    fetchInventoryItems()
  }

  const lowStockCount = inventoryItems.filter(item => getStockStatus(item) === 'low-stock').length
  const outOfStockCount = inventoryItems.filter(item => getStockStatus(item) === 'out-of-stock').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Inventory Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border border-blue-200 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
              <Package className="text-blue-500" size={18} />
              <p className="text-xs sm:text-sm text-blue-700 font-semibold">Total</p>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-blue-900">{inventoryItems.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-xl border border-yellow-200 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
              <TrendingDown className="text-yellow-500" size={18} />
              <p className="text-xs sm:text-sm text-yellow-700 font-semibold">Low</p>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-yellow-800">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 rounded-xl border border-red-200 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
              <AlertTriangle className="text-red-500" size={18} />
              <p className="text-xs sm:text-sm text-red-700 font-semibold">Out</p>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-red-800">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'low-stock' | 'out-of-stock')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
        >
          <option value="all">All Items</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Items Cards */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first inventory item'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add Inventory Item
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const status = getStockStatus(item)
              return (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    {/* Item Info */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                      {/* Name, Unit and Status */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(status)}`}>
                            {getStockStatusText(status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Unit: {item.unit}</p>
                      </div>

                      {/* Stock Info - Most Prominent */}
                      <div className="sm:col-span-2 flex gap-3">
                        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-1">Current</p>
                          <p className="text-xl font-bold text-blue-900">
                            {item.current_stock}
                          </p>
                          <p className="text-xs text-blue-600">{item.unit}</p>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Min</p>
                          <p className="text-xl font-bold text-gray-900">
                            {item.minimum_stock}
                          </p>
                          <p className="text-xs text-gray-600">{item.unit}</p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="sm:col-span-1">
                        <p className="text-xs text-gray-500 mb-1">₹{item.cost_per_unit.toFixed(2)}</p>
                        {item.supplier && (
                          <p className="text-xs text-gray-500 truncate">{item.supplier}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="sm:col-span-1 flex items-center justify-between">
                        <button
                          onClick={() => openRestockModal(item)}
                          className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Restock"
                        >
                          <TrendingUp size={16} />
                          <span className="text-xs font-medium">Restock</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(item)
                              setShowForm(true)
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Inventory Item Form Modal */}
      <AnimatePresence>
        {showForm && (
          <InventoryItemForm
            item={editingItem}
            onClose={() => {
              setShowForm(false)
              setEditingItem(null)
            }}
            onSuccess={handleFormSuccess}
          />
        )}
      </AnimatePresence>

      {/* Restock Modal */}
      <AnimatePresence>
        {showRestockModal && restockingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Restock Item</h3>
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Restocking: <span className="font-medium">{restockingItem.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Stock: <span className="font-medium">{restockingItem.current_stock} {restockingItem.unit}</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestockItem}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Restock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Item</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <span className="font-medium">{deletingItem.name}</span>?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will affect menu items that use this ingredient.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}