import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Filter, Play, Flame, Hand } from 'lucide-react'
import { Order, OrderItem } from '@/hooks/useOrders'

interface ItemManagementProps {
  orders: Order[]
  onCompleteItemUnit: (itemId: string) => Promise<void>
  onUpdateItemStatus: (itemId: string, status: OrderItem['item_status']) => Promise<void>
}

interface AggregatedItem {
  menu_item_id: string
  name: string
  image_url?: string
  total_quantity: number
  completed_quantity: number
  pending_quantity: number
  orders: {
    order_id: string
    item_id: string
    customer_name: string
    quantity: number
    completed_quantity: number
    item_status: OrderItem['item_status']
  }[]
}

export default function ItemManagement({ orders, onCompleteItemUnit, onUpdateItemStatus }: ItemManagementProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [pickingUp, setPickingUp] = useState<string | null>(null)
  const [exitingCards, setExitingCards] = useState<Set<string>>(new Set())

  // Aggregate items across all confirmed orders (not pending)
  const aggregatedItems: AggregatedItem[] = []
  
  orders
    .filter(order => 
      order.status !== 'cancelled' && 
      order.status !== 'completed' && 
      order.status !== 'pending' // Only show confirmed orders and beyond
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Oldest first
    .forEach(order => {
      order.order_items.forEach(item => { // Don't filter out completed items here - we need them for counting
        const existingItem = aggregatedItems.find(
          agg => agg.menu_item_id === item.menu_item_id
        )
        
        // Simple and clear counting logic:
        // - Total quantity: always add the item quantity
        // - Completed quantity: only count if item status is 'completed' (picked up)
        // - Pending quantity: total minus completed
        
        if (existingItem) {
          existingItem.total_quantity += item.quantity
          
          // Only count as completed if the entire order item is picked up
          if (item.item_status === 'completed') {
            existingItem.completed_quantity += item.quantity
          }
          
          // Recalculate pending quantity
          existingItem.pending_quantity = existingItem.total_quantity - existingItem.completed_quantity
          
          // Only add to orders array if not completed (for UI display)
          if (item.item_status !== 'completed') {
            existingItem.orders.push({
              order_id: order.id,
              item_id: item.id,
              customer_name: order.customer_name,
              quantity: item.quantity,
              completed_quantity: item.completed_quantity || 0,
              item_status: item.item_status
            })
          }
        } else {
          // Create new aggregated item
          const completedQty = item.item_status === 'completed' ? item.quantity : 0
          const pendingQty = item.quantity - completedQty
          
          aggregatedItems.push({
            menu_item_id: item.menu_item_id,
            name: item.menu_items.name,
            image_url: item.menu_items.image_url,
            total_quantity: item.quantity,
            completed_quantity: completedQty,
            pending_quantity: pendingQty,
            orders: item.item_status !== 'completed' ? [{
              order_id: order.id,
              item_id: item.id,
              customer_name: order.customer_name,
              quantity: item.quantity,
              completed_quantity: item.completed_quantity || 0,
              item_status: item.item_status
            }] : [] // Empty orders array if this item is completed
          })
        }
      })
    })

  // Filter items based on status - only show items that need attention
  const filteredItems = aggregatedItems
    .filter(item => {
      // Always show items that are exiting (for smooth animation)
      if (exitingCards.has(item.menu_item_id)) return true
      
      // Only show items that have active orders (orders array contains non-completed items)
      if (item.orders.length === 0) return false
      
      // Only show items that have pending work (not fully completed)
      if (item.pending_quantity <= 0) return false
      
      if (statusFilter === 'all') return true
      if (statusFilter === 'pending') {
        // Show items that have orders needing to start (confirmed status)
        return item.orders.some(o => o.item_status === 'confirmed')
      }
      if (statusFilter === 'preparing') {
        // Show items that have orders currently being prepared
        return item.orders.some(o => o.item_status === 'preparing')
      }
      if (statusFilter === 'ready') {
        // Show items that have orders ready for pickup
        return item.orders.some(o => o.item_status === 'ready')
      }
      return true
    })

  const handleCompleteUnit = async (itemId: string) => {
    setUpdating(itemId)
    try {
      await onCompleteItemUnit(itemId)
    } catch (error) {
      console.error('Failed to complete item unit:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleStatusUpdate = async (itemId: string, status: OrderItem['item_status']) => {
    setUpdating(itemId)
    
    // If marking as completed (picked up), show positive animation
    if (status === 'completed') {
      setPickingUp(itemId)
      // Wait a bit for the animation to start
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    try {
      await onUpdateItemStatus(itemId, status)
      
      // If picked up, wait for individual pickup animation to complete
      if (status === 'completed') {
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // After pickup animation, check if this was the last order for this menu item
        // We need to check against the original orders data to get accurate count
        const orderWithItem = orders.find(order => 
          order.order_items.some(item => item.id === itemId)
        )
        
        if (orderWithItem) {
          const itemBeingCompleted = orderWithItem.order_items.find(item => item.id === itemId)
          
          if (itemBeingCompleted) {
            // Find all orders that have this same menu item
            const allOrdersWithThisMenuItem = orders.flatMap(order => 
              order.order_items.filter(item => 
                item.menu_item_id === itemBeingCompleted.menu_item_id &&
                order.status !== 'cancelled' && 
                order.status !== 'completed' && 
                order.status !== 'pending'
              )
            )
            
            // Count how many are NOT completed (excluding the one we just completed)
            const remainingItems = allOrdersWithThisMenuItem.filter(item => 
              item.id !== itemId && item.item_status !== 'completed'
            )
            
            // If this was the last item for this menu item, trigger card exit animation
            if (remainingItems.length === 0) {
              setExitingCards(prev => new Set([...prev, itemBeingCompleted.menu_item_id]))
              
              // Remove from exiting cards after the exit animation completes
              setTimeout(() => {
                setExitingCards(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(itemBeingCompleted.menu_item_id)
                  return newSet
                })
              }, 1200) // Wait for exit animation to complete
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to update item status:', error)
    } finally {
      setUpdating(null)
      setPickingUp(null)
    }
  }

  // Don't sort items to maintain consistent positioning - prevent cards from moving around
  const sortedItems = filteredItems

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          >
            <option value="all">All Active Items</option>
            <option value="pending">Need to Start</option>
            <option value="preparing">Currently Cooking</option>
            <option value="ready">Ready for Pickup</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item) => (
          <motion.div
            key={item.menu_item_id}
            initial={{ opacity: 0, y: 20 }}
            animate={exitingCards.has(item.menu_item_id) ? {
              x: 100,
              opacity: 0,
              scale: 0.9,
              rotate: 5,
              backgroundColor: 'rgb(187 247 208)'
            } : { 
              opacity: 1, 
              y: 0,
              scale: 1,
              x: 0,
              rotate: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: -30,
              transition: { duration: 0.5 }
            }}
            transition={exitingCards.has(item.menu_item_id) ? {
              duration: 1.0,
              ease: "easeOut"
            } : { 
              duration: 0.8,
              ease: "easeInOut"
            }}

            className="bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            {/* Item Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <ChefHat size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-black">{item.name}</h3>
                  </div>
                </div>
                
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <div className="text-lg font-semibold">
                    {item.pending_quantity}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-4 space-y-3">
              {item.orders.map((orderItem) => (
                <motion.div
                  key={orderItem.item_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  animate={pickingUp === orderItem.item_id ? {
                    x: [0, 30, -10, 0],
                    scale: [1, 1.05, 0.95, 1],
                    backgroundColor: ['rgb(249 250 251)', 'rgb(220 252 231)', 'rgb(187 247 208)', 'rgb(249 250 251)']
                  } : {}}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded flex items-center justify-center text-xs font-medium">
                      {orderItem.quantity}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {orderItem.customer_name}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Status Display and Action Button */}
                    {orderItem.item_status === 'ready' ? (
                      <motion.button
                        onClick={() => handleStatusUpdate(orderItem.item_id, 'completed')}
                        disabled={updating === orderItem.item_id || pickingUp === orderItem.item_id}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full text-xs font-medium transition-colors"
                        title="Mark as picked up"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={pickingUp === orderItem.item_id ? {
                          backgroundColor: ['rgb(219 234 254)', 'rgb(187 247 208)', 'rgb(134 239 172)'],
                          color: ['rgb(30 64 175)', 'rgb(21 128 61)', 'rgb(22 101 52)']
                        } : {}}
                      >
                        {updating === orderItem.item_id || pickingUp === orderItem.item_id ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <Hand size={12} className="mr-1" />
                        )}
                        {pickingUp === orderItem.item_id ? 'Picked Up! ✨' : 'Pick Up'}
                      </motion.button>
                    ) : orderItem.item_status === 'preparing' ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStatusUpdate(orderItem.item_id, 'ready')}
                          disabled={updating === orderItem.item_id}
                          className="flex items-center px-2 py-1 bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-full text-xs font-medium transition-colors"
                          title="Mark as ready for pickup"
                        >
                          {updating === orderItem.item_id ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="mr-1"
                              >
                                <Flame size={10} className="text-orange-600" />
                              </motion.div>
                              Cooking
                            </>
                          )}
                        </button>

                      </div>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(orderItem.item_id, 'preparing')}
                        disabled={updating === orderItem.item_id}
                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full text-xs font-medium transition-colors"
                        title="Start cooking"
                      >
                        {updating === orderItem.item_id ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <Play size={12} className="mr-1" />
                        )}
                        Start
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-2">
                {/* Start All Button - only show if there are items not preparing */}
                {item.orders.some(orderItem => orderItem.item_status === 'confirmed') && (
                  <button
                    onClick={async () => {
                      for (const orderItem of item.orders) {
                        if (orderItem.item_status === 'confirmed') {
                          await handleStatusUpdate(orderItem.item_id, 'preparing')
                        }
                      }
                    }}
                    disabled={updating !== null}
                    className="flex-1 px-3 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Starting...' : 'Start All'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items to prepare</h3>
          <p className="text-gray-600">All items are completed or no active orders.</p>
        </div>
      )}
    </div>
  )
}