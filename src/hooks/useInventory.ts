'use client'

import { useState, useEffect } from 'react'
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

interface InventoryAlert {
  id: string
  name: string
  current_stock: number
  minimum_stock: number
  status: 'low-stock' | 'out-of-stock'
}

export function useInventory() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventoryItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      setInventoryItems(data || [])
      
      // Generate alerts for low stock and out of stock items
      const inventoryAlerts: InventoryAlert[] = []
      
      data?.forEach(item => {
        if (item.current_stock <= 0) {
          inventoryAlerts.push({
            id: item.id,
            name: item.name,
            current_stock: item.current_stock,
            minimum_stock: item.minimum_stock,
            status: 'out-of-stock'
          })
        } else if (item.current_stock <= item.minimum_stock) {
          inventoryAlerts.push({
            id: item.id,
            name: item.name,
            current_stock: item.current_stock,
            minimum_stock: item.minimum_stock,
            status: 'low-stock'
          })
        }
      })
      
      setAlerts(inventoryAlerts)
      setError(null)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError('Failed to fetch inventory items')
    } finally {
      setLoading(false)
    }
  }

  const deductInventoryForOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/inventory/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deduct inventory')
      }

      // Refresh inventory after deduction
      await fetchInventoryItems()
      
      return result
    } catch (err) {
      console.error('Error deducting inventory:', err)
      throw err
    }
  }

  const restockItem = async (itemId: string, quantity: number) => {
    try {
      const item = inventoryItems.find(i => i.id === itemId)
      if (!item) throw new Error('Item not found')

      const newStock = item.current_stock + quantity

      const { error } = await supabase
        .from('inventory_items')
        .update({ 
          current_stock: newStock,
          last_restocked: new Date().toISOString()
        })
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, current_stock: newStock, last_restocked: new Date().toISOString() }
            : item
        )
      )

      return { success: true }
    } catch (err) {
      console.error('Error restocking item:', err)
      throw err
    }
  }

  const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      )

      return { success: true }
    } catch (err) {
      console.error('Error updating inventory item:', err)
      throw err
    }
  }

  const deleteInventoryItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      setInventoryItems(prev => prev.filter(item => item.id !== itemId))
      setAlerts(prev => prev.filter(alert => alert.id !== itemId))

      return { success: true }
    } catch (err) {
      console.error('Error deleting inventory item:', err)
      throw err
    }
  }

  const getInventoryValue = () => {
    return inventoryItems.reduce((total, item) => {
      return total + (item.current_stock * item.cost_per_unit)
    }, 0)
  }

  const getLowStockCount = () => {
    return alerts.filter(alert => alert.status === 'low-stock').length
  }

  const getOutOfStockCount = () => {
    return alerts.filter(alert => alert.status === 'out-of-stock').length
  }

  useEffect(() => {
    fetchInventoryItems()

    // Set up real-time subscription for inventory changes
    const subscription = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        () => {
          fetchInventoryItems()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    inventoryItems,
    alerts,
    loading,
    error,
    fetchInventoryItems,
    deductInventoryForOrder,
    restockItem,
    updateInventoryItem,
    deleteInventoryItem,
    getInventoryValue,
    getLowStockCount,
    getOutOfStockCount
  }
}