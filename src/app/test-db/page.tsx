'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDbPage() {
  const [categories, setCategories] = useState<Record<string, unknown>[]>([])
  const [menuItems, setMenuItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')

        // Test categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .limit(5)

        if (categoriesError) {
          console.error('Categories error:', categoriesError)
          setError(`Categories error: ${categoriesError.message}`)
          return
        }

        console.log('Categories data:', categoriesData)
        setCategories(categoriesData || [])

        // Test menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*')
          .limit(10)

        if (menuItemsError) {
          console.error('Menu items error:', menuItemsError)
          setError(`Menu items error: ${menuItemsError.message}`)
          return
        }

        console.log('Menu items data:', menuItemsData)
        setMenuItems(menuItemsData || [])

      } catch (err) {
        console.error('Connection test failed:', err)
        setError(`Connection failed: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Testing database connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Connection Test</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Categories ({categories.length})</h2>
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div key={category.id as string || index} className="p-3 border border-gray-200 rounded">
                  <h3 className="font-medium">{category.name as string}</h3>
                  <p className="text-sm text-gray-600">{category.description as string}</p>
                  <p className="text-xs text-gray-500">Order: {category.display_order as number}, Active: {category.is_active ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Menu Items ({menuItems.length})</h2>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <div key={item.id as string || index} className="p-3 border border-gray-200 rounded">
                  <h3 className="font-medium">{item.name as string}</h3>
                  <p className="text-sm text-gray-600">{item.description as string}</p>
                  <p className="text-sm font-medium">₹{item.price as number}</p>
                  <p className="text-xs text-gray-500">
                    Available: {item.is_available ? 'Yes' : 'No'},
                    Featured: {item.is_featured ? 'Yes' : 'No'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/menu" className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
            Go to Menu
          </a>
        </div>
      </div>
    </div>
  )
}