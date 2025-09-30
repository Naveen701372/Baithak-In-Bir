import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealTimeOrders } from './useRealTimeOrders'

export interface Order {
  id: string
  order_number?: number
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
  const [newOrderNotification, setNewOrderNotification] = useState<Order | null>(null)
  const [kitchenOrderNotification, setKitchenOrderNotification] = useState<Order | null>(null)

  // Use real-time connection
  const { lastEvent, isConnected } = useRealTimeOrders()

  // Fetch orders with items
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_number,
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
      const updateData: {
        status: Order['status']
        updated_at: string
        cancelled_at?: string
      } = {
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

      // Find the order containing this item
      const currentOrder = orders.find(order =>
        order.order_items.some(item => item.id === itemId)
      )

      // Update local state
      setOrders(prev => prev.map(order => ({
        ...order,
        order_items: order.order_items.map(item =>
          item.id === itemId ? { ...item, item_status: status } : item
        )
      })))

      // Check if all items are ready/completed and auto-advance order status
      if (currentOrder && (status === 'ready' || status === 'completed') && currentOrder.status === 'preparing') {
        const updatedOrder = {
          ...currentOrder,
          order_items: currentOrder.order_items.map(item =>
            item.id === itemId ? { ...item, item_status: status } : item
          )
        }

        const allItemsReadyOrCompleted = updatedOrder.order_items.every(item =>
          item.item_status === 'ready' || item.item_status === 'completed'
        )

        if (allItemsReadyOrCompleted) {
          console.log('All items ready/completed, auto-advancing order to ready status')
          await updateOrderStatus(currentOrder.id, 'ready')
        }
      }
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

      if (!currentItem || !currentOrder) throw new Error('Item not found')

      const newCompletedQuantity = (currentItem.completed_quantity || 0) + 1
      const isFullyCompleted = newCompletedQuantity >= currentItem.quantity

      const updateData: {
        completed_quantity: number
        item_status?: OrderItem['item_status']
      } = {
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

      // Check if all items in the order are now completed and auto-advance order status
      if (isFullyCompleted && currentOrder.status === 'preparing') {
        const updatedOrder = {
          ...currentOrder,
          order_items: currentOrder.order_items.map(item =>
            item.id === itemId
              ? { ...item, completed_quantity: newCompletedQuantity, item_status: 'completed' as const }
              : item
          )
        }

        const allItemsCompleted = updatedOrder.order_items.every(item =>
          (item.completed_quantity || 0) >= item.quantity || item.item_status === 'completed'
        )

        if (allItemsCompleted) {
          console.log('All items completed, auto-advancing order to ready status')
          await updateOrderStatus(currentOrder.id, 'ready')
        }
      }
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
  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status'], paymentMethod?: string) => {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      }

      // Add payment method if provided
      if (paymentMethod) {
        updateData.payment_method = paymentMethod
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? {
            ...order,
            payment_status: paymentStatus,
            ...(paymentMethod && { payment_method: paymentMethod }),
            updated_at: new Date().toISOString()
          }
          : order
      ))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update payment status')
    }
  }

  // Enhanced notification sound system
  const playNotificationSound = (type: 'new_order' | 'kitchen_alert' = 'new_order') => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()

      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const filterNode = audioContext.createBiquadFilter()

      oscillator.connect(filterNode)
      filterNode.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (type === 'kitchen_alert') {
        // Kitchen alert: Urgent double beep
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.15)
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.3)
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.45)

        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.6)
      } else {
        // New order: Pleasant chime
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2) // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4) // G5

        filterNode.frequency.setValueAtTime(1500, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.6)
      }
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  // Browser notification system
  const showBrowserNotification = (title: string, body: string, tag: string) => {
    try {
      // Check if Notification API is supported
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('Notifications not supported on this browser')
        return
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/icon-192x192.png',
          tag,
          badge: '/icon-192x192.png',
          silent: false,
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Orders'
            }
          ]
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        // Auto close after 8 seconds
        setTimeout(() => {
          notification.close()
        }, 8000)
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showBrowserNotification(title, body, tag)
          }
        }).catch(error => {
          console.error('Error requesting notification permission:', error)
        })
      }
    } catch (error) {
      console.log('Could not show browser notification:', error)
    }
  }

  // Clear new order notification
  const clearNewOrderNotification = () => {
    setNewOrderNotification(null)
  }

  // Clear kitchen order notification
  const clearKitchenOrderNotification = () => {
    setKitchenOrderNotification(null)
  }

  // Handle real-time events
  useEffect(() => {
    if (!lastEvent) return

    console.log('Real-time event received:', lastEvent)

    if (lastEvent.type === 'order_update' && lastEvent.order) {
      const updatedOrder = lastEvent.order

      setOrders(prev => {
        const existingIndex = prev.findIndex(o => o.id === updatedOrder.id)

        if (existingIndex >= 0) {
          // Update existing order
          const previousOrder = prev[existingIndex]

          // Check if order status changed from 'pending' to 'confirmed' (for kitchen notification)
          if (previousOrder.status === 'pending' && updatedOrder.status === 'confirmed') {
            console.log('🍳 Order confirmed for kitchen:', updatedOrder.id, updatedOrder.customer_name)
            setKitchenOrderNotification(updatedOrder)
            playNotificationSound('kitchen_alert')
            showBrowserNotification(
              '🍳 New Kitchen Order!',
              `Order from ${updatedOrder.customer_name} - ${updatedOrder.order_items.length} items to prepare`,
              'kitchen-order'
            )

            // Clear kitchen notification after 6 seconds
            setTimeout(() => setKitchenOrderNotification(null), 6000)
          }

          const newOrders = [...prev]
          newOrders[existingIndex] = updatedOrder
          return newOrders
        } else {
          // New order - add to beginning and show notification
          if (lastEvent.event === 'INSERT') {
            setNewOrderNotification(updatedOrder)
            playNotificationSound('new_order')
            showBrowserNotification(
              '📋 New Order Received!',
              `Order from ${updatedOrder.customer_name} - ₹${updatedOrder.total_amount}`,
              'new-order'
            )

            // Clear notification after 5 seconds
            setTimeout(() => setNewOrderNotification(null), 5000)
          }
          return [updatedOrder, ...prev]
        }
      })
    } else if (lastEvent.type === 'order_item_update' && lastEvent.order) {
      // Update order with modified items
      const updatedOrder = lastEvent.order
      console.log('Order item updated in real-time:', updatedOrder.id, lastEvent.itemId)
      setOrders(prev => prev.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      ))
    } else if (lastEvent.type === 'order_delete' && lastEvent.orderId) {
      // Remove deleted order
      setOrders(prev => prev.filter(order => order.id !== lastEvent.orderId))
    }
  }, [lastEvent])

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [])

  // Force connection check after 3 seconds if not connected
  useEffect(() => {
    const connectionCheck = setTimeout(() => {
      if (!isConnected) {
        console.log('⚠️ Real-time connection not established after 3s, forcing reconnect...')
        // The useRealTimeOrders hook should handle reconnection automatically
      }
    }, 3000)

    return () => clearTimeout(connectionCheck)
  }, [isConnected])

  // Fallback polling if real-time is not connected
  useEffect(() => {
    if (!isConnected) {
      console.log('📡 Real-time not connected, using polling fallback')
      const interval = setInterval(() => {
        fetchOrders()
      }, 5000) // Poll every 5 seconds when disconnected

      return () => clearInterval(interval)
    }
  }, [isConnected])

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
    cancelOrder,
    updatePaymentStatus,
    getOrdersByStatus,
    refetch: fetchOrders,
    // Real-time features
    isConnected,
    newOrderNotification,
    clearNewOrderNotification,
    // Kitchen notifications
    kitchenOrderNotification,
    clearKitchenOrderNotification
  }
}