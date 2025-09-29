'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown
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

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item? This will affect menu items that use this ingredient.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setInventoryItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      alert('Failed to delete inventory item')
    }
  }

  const handleRestockItem = async (id: string, additionalStock: number) => {
    try {
      const item = inventoryItems.find(i => i.id === id)
      if (!item) return

      const newStock = item.current_stock + additionalStock

      const { error } = await supabase
        .from('inventory_items')
        .update({ 
          current_stock: newStock,
          last_restocked: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, current_stock: newStock, last_restocked: new Date().toISOString() }
            : item
        )
      )
    } catch (error) {
      console.error('Error restocking item:', error)
      alert('Failed to restock item')
    }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div></div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Inventory Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
            </div>
            <Package className="text-gray-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <TrendingDown className="text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
            <AlertTriangle className="text-red-400" size={24} />
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

      {/* Inventory Items Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const status = getStockStatus(item)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">Unit: {item.unit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.current_stock} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.minimum_stock} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(status)}`}>
                        {getStockStatusText(status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ₹{item.cost_per_unit.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.supplier || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const additionalStock = prompt('Enter quantity to add:')
                            if (additionalStock && !isNaN(Number(additionalStock))) {
                              handleRestockItem(item.id, Number(additionalStock))
                            }
                          }}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Restock"
                        >
                          <TrendingUp size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item)
                            setShowForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
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
    </div>
  )
}