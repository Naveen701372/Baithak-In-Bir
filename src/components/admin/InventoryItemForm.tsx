'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface InventoryItem {
  id: string
  name: string
  unit: string
  current_stock: number
  minimum_stock: number
  cost_per_unit: number
  supplier?: string
  last_restocked?: string
}

interface InventoryItemFormProps {
  item?: InventoryItem | null
  onClose: () => void
  onSuccess: () => void
}

const commonUnits = [
  'kg', 'g', 'lbs', 'oz',
  'L', 'ml', 'cups', 'tbsp', 'tsp',
  'pieces', 'units', 'packets', 'bottles', 'cans'
]

export default function InventoryItemForm({ item, onClose, onSuccess }: InventoryItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    current_stock: '',
    minimum_stock: '',
    cost_per_unit: '',
    supplier: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        unit: item.unit,
        current_stock: item.current_stock.toString(),
        minimum_stock: item.minimum_stock.toString(),
        cost_per_unit: item.cost_per_unit.toString(),
        supplier: item.supplier || ''
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const inventoryData = {
        name: formData.name,
        unit: formData.unit,
        current_stock: parseFloat(formData.current_stock) || 0,
        minimum_stock: parseFloat(formData.minimum_stock) || 0,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
        supplier: formData.supplier || null,
        last_restocked: item?.last_restocked || new Date().toISOString()
      }

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('inventory_items')
          .update(inventoryData)
          .eq('id', item.id)

        if (error) throw error
      } else {
        // Create new item
        const { error } = await supabase
          .from('inventory_items')
          .insert(inventoryData)

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving inventory item:', error)
      alert('Failed to save inventory item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              placeholder="Enter item name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                placeholder="e.g., kg, L, pieces"
                list="units"
              />
              <datalist id="units">
                {commonUnits.map(unit => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.current_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, current_stock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.minimum_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost per Unit (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.cost_per_unit}
              onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              placeholder="Enter supplier name"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}