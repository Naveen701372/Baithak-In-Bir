import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  total_amount: number
  notes?: string
  cancelled_at?: string
  cancelled_reason?: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  completed_quantity?: number
  unit_price: number
  total_price: number
  item_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed'
  notes?: string
  menu_items: {
    name: string
    image_url?: string
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders with items
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            order_id,
            menu_item_id,
            quantity,
            completed_quantity,
            unit_price,
            total_price,
            item_status,
            notes,
            menu_items (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      // If cancelling, add cancelled timestamp
      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      // If marking order as ready, update all items to ready status
      if (status === 'ready') {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          for (const item of order.order_items) {
            await supabase
              .from('order_items')
              .update({ item_status: 'ready' })
              .eq('id', item.id)
          }
        }
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              ...updateData,
              // If marking as ready, update all items
              order_items: status === 'ready' 
                ? order.order_items.map(item => ({ ...item, item_status: 'ready' as const }))
                : order.order_items
            }
          : order
      ))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update order')
    }
  }

  // Update individual item status
  const updateItemStatus = async (itemId: string, status: OrderItem['item_status']) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ item_status: status })
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => ({
        ...order,
        order_items: order.order_items.map(item =>
          item.id === itemId ? { ...item, item_status: status } : item
        )
      })))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update item status')
    }
  }

  // Complete one unit of an item
  const completeItemUnit = async (itemId: string) => {
    try {
      // First get the current item
      const currentOrder = orders.find(order => 
        order.order_items.some(item => item.id === itemId)
      )
      const currentItem = currentOrder?.order_items.find(item => item.id === itemId)
      
      if (!currentItem) throw new Error('Item not found')
      
      const newCompletedQuantity = (currentItem.completed_quantity || 0) + 1
      const isFullyCompleted = newCompletedQuantity >= currentItem.quantity
      
      const updateData: any = {
        completed_quantity: newCompletedQuantity
      }
      
      if (isFullyCompleted) {
        updateData.item_status = 'completed'
      }

      const { error } = await supabase
        .from('order_items')
        .update(updateData)
        .eq('id', itemId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => ({
        ...order,
        order_items: order.order_items.map(item =>
          item.id === itemId 
            ? { 
                ...item, 
                completed_quantity: newCompletedQuantity,
                item_status: isFullyCompleted ? 'completed' : item.item_status
              } 
            : item
        )
      })))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to complete item unit')
    }
  }

  // Update all items in an order to a specific status
  const updateAllOrderItems = async (orderId: string, status: OrderItem['item_status']) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ item_status: status })
        .eq('order_id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId
          ? {
              ...order,
              order_items: order.order_items.map(item => ({ ...item, item_status: status }))
            }
          : order
      ))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update order items')
    }
  }

  // Cancel order with reason
  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'cancelled' as const,
              cancelled_at: new Date().toISOString(),
              cancelled_reason: reason,
              updated_at: new Date().toISOString()
            }
          : order
      ))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to cancel order')
    }
  }

  // Update payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, payment_status: paymentStatus, updated_at: new Date().toISOString() }
          : order
      ))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update payment status')
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchOrders()

    // Subscribe to real-time changes for both orders and order_items
    const ordersChannel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change:', payload)
          fetchOrders() // Refetch orders when changes occur
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        (payload) => {
          console.log('Order item change:', payload)
          fetchOrders() // Refetch orders when order items change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
    }
  }, [])

  // Get today's orders
  const todaysOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  // Get orders by status
  const getOrdersByStatus = (status: Order['status']) => {
    return todaysOrders.filter(order => order.status === status)
  }

  return {
    orders,
    todaysOrders,
    loading,
    error,
    updateOrderStatus,
    updateItemStatus,
    updateAllOrderItems,
    completeItemUnit,
    cancelOrder,
    updatePaymentStatus,
    getOrdersByStatus,
    refetch: fetchOrders
  }
}