'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
}

interface Category {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  name: string
  unit: string
}

interface InventoryRequirement {
  inventory_item_id: string
  quantity_required: number
  inventory_items?: {
    name: string
    unit: string
  }
}

interface MenuItemFormProps {
  item?: MenuItem | null
  categories: Category[]
  onClose: () => void
  onSuccess: () => void
}

export default function MenuItemForm({ item, categories, onClose, onSuccess }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    is_featured: false,
    display_order: 0
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [inventoryRequirements, setInventoryRequirements] = useState<InventoryRequirement[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchInventoryItems()
    
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category_id: item.category_id || '',
        is_available: item.is_available,
        is_featured: item.is_featured,
        display_order: item.display_order
      })
      setImagePreview(item.image_url || '')
      fetchInventoryRequirements(item.id)
    }
  }, [item])

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit')
        .order('name')

      if (error) throw error
      setInventoryItems(data || [])
    } catch (error) {
      console.error('Error fetching inventory items:', error)
    }
  }

  const fetchInventoryRequirements = async (menuItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_item_inventory')
        .select(`
          inventory_item_id,
          quantity_required,
          inventory_items (name, unit)
        `)
        .eq('menu_item_id', menuItemId)

      if (error) throw error
      setInventoryRequirements((data || []).map((item: any) => ({
        inventory_item_id: item.inventory_item_id,
        quantity_required: item.quantity_required,
        inventory_items: Array.isArray(item.inventory_items) ? item.inventory_items[0] : item.inventory_items
      })))
    } catch (error) {
      console.error('Error fetching inventory requirements:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `menu-items/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const addInventoryRequirement = () => {
    setInventoryRequirements(prev => [
      ...prev,
      { inventory_item_id: '', quantity_required: 0 }
    ])
  }

  const updateInventoryRequirement = (index: number, field: keyof InventoryRequirement, value: any) => {
    setInventoryRequirements(prev => 
      prev.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    )
  }

  const removeInventoryRequirement = (index: number) => {
    setInventoryRequirements(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = item?.image_url || null
      
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setLoading(false)
          return
        }
      }

      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
        image_url: imageUrl
      }

      let menuItemId: string

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', item.id)

        if (error) throw error
        menuItemId = item.id
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('menu_items')
          .insert(menuItemData)
          .select('id')
          .single()

        if (error) throw error
        menuItemId = data.id
      }

      // Update inventory requirements
      if (item) {
        // Delete existing requirements
        await supabase
          .from('menu_item_inventory')
          .delete()
          .eq('menu_item_id', item.id)
      }

      // Insert new requirements
      const validRequirements = inventoryRequirements.filter(
        req => req.inventory_item_id && req.quantity_required > 0
      )

      if (validRequirements.length > 0) {
        const { error: reqError } = await supabase
          .from('menu_item_inventory')
          .insert(
            validRequirements.map(req => ({
              menu_item_id: menuItemId,
              inventory_item_id: req.inventory_item_id,
              quantity_required: req.quantity_required
            }))
          )

        if (reqError) throw reqError
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert('Failed to save menu item')
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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                placeholder="Describe the item..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-700">Available</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Image</h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload size={24} />
                  </div>
                )}
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload size={16} />
                  Choose Image
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 400x300px, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Inventory Requirements</h3>
              <button
                type="button"
                onClick={addInventoryRequirement}
                className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center gap-1"
              >
                <Plus size={14} />
                Add Requirement
              </button>
            </div>

            {inventoryRequirements.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No inventory requirements added. Click "Add Requirement" to link inventory items.
              </p>
            ) : (
              <div className="space-y-3">
                {inventoryRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={req.inventory_item_id}
                      onChange={(e) => updateInventoryRequirement(index, 'inventory_item_id', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    >
                      <option value="">Select inventory item</option>
                      {inventoryItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={req.quantity_required}
                      onChange={(e) => updateInventoryRequirement(index, 'quantity_required', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                      placeholder="Qty"
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeInventoryRequirement(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}