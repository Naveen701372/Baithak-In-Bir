import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, CheckCircle, Filter, Clock, Play, Check, Flame, Hand } from 'lucide-react'
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
      order.order_items.forEach(item => {
        const existingItem = aggregatedItems.find(
          agg => agg.menu_item_id === item.menu_item_id
        )
        
        if (existingItem) {
          existingItem.total_quantity += item.quantity
          existingItem.completed_quantity += item.completed_quantity || 0
          existingItem.pending_quantity += item.quantity - (item.completed_quantity || 0)
          existingItem.orders.push({
            order_id: order.id,
            item_id: item.id,
            customer_name: order.customer_name,
            quantity: item.quantity,
            completed_quantity: item.completed_quantity || 0,
            item_status: item.item_status
          })
        } else {
          aggregatedItems.push({
            menu_item_id: item.menu_item_id,
            name: item.menu_items.name,
            image_url: item.menu_items.image_url,
            total_quantity: item.quantity,
            completed_quantity: item.completed_quantity || 0,
            pending_quantity: item.quantity - (item.completed_quantity || 0),
            orders: [{
              order_id: order.id,
              item_id: item.id,
              customer_name: order.customer_name,
              quantity: item.quantity,
              completed_quantity: item.completed_quantity || 0,
              item_status: item.item_status
            }]
          })
        }
      })
    })

  // Filter items based on status
  const filteredItems = aggregatedItems.filter(item => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'pending') return item.pending_quantity > 0
    if (statusFilter === 'preparing') return item.orders.some(o => o.item_status === 'preparing')
    if (statusFilter === 'ready') return item.orders.some(o => o.item_status === 'ready')
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
    try {
      await onUpdateItemStatus(itemId, status)
    } catch (error) {
      console.error('Failed to update item status:', error)
    } finally {
      setUpdating(null)
    }
  }

  // Sort items to show pending items first, then by completion status
  const sortedItems = filteredItems.sort((a, b) => {
    // Items with pending quantities come first
    if (a.pending_quantity > 0 && b.pending_quantity === 0) return -1
    if (a.pending_quantity === 0 && b.pending_quantity > 0) return 1
    
    // Then sort by completion percentage
    const aCompletion = a.completed_quantity / a.total_quantity
    const bCompletion = b.completed_quantity / b.total_quantity
    return aCompletion - bCompletion
  })

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
            <option value="all">All Items</option>
            <option value="pending">Pending Items</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready Items</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((item) => (
          <motion.div
            key={item.menu_item_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                    <div className="text-sm text-gray-500">
                      {item.completed_quantity}/{item.total_quantity} completed
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-black">
                    {item.pending_quantity}
                  </div>
                  <div className="text-xs text-gray-500">pending</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(item.completed_quantity / item.total_quantity) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-4 space-y-3">
              {item.orders
                .sort((a, b) => new Date(orders.find(o => o.id === a.order_id)?.created_at || '').getTime() - 
                                new Date(orders.find(o => o.id === b.order_id)?.created_at || '').getTime())
                .map((orderItem) => (
                <div
                  key={orderItem.item_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {orderItem.customer_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {orderItem.completed_quantity}/{orderItem.quantity} done
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Status Display and Action Button */}
                    {orderItem.item_status === 'completed' ? (
                      <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <Hand size={12} className="mr-1" />
                        Picked Up
                      </div>
                    ) : orderItem.item_status === 'ready' ? (
                      <button
                        onClick={() => handleStatusUpdate(orderItem.item_id, 'completed')}
                        disabled={updating === orderItem.item_id}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full text-xs font-medium transition-colors"
                        title="Mark as picked up"
                      >
                        {updating === orderItem.item_id ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <Hand size={12} className="mr-1" />
                        )}
                        Pick Up
                      </button>
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
                        {/* Complete Unit Button for preparing items */}
                        {orderItem.completed_quantity < orderItem.quantity && (
                          <button
                            onClick={() => handleCompleteUnit(orderItem.item_id)}
                            disabled={updating === orderItem.item_id}
                            className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                            title={`Complete 1 unit (${orderItem.completed_quantity}/${orderItem.quantity} done)`}
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
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
                </div>
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
                
                {/* Mark Ready Button - only show if there are preparing items */}
                {item.orders.some(orderItem => orderItem.item_status === 'preparing') && (
                  <button
                    onClick={async () => {
                      for (const orderItem of item.orders) {
                        if (orderItem.item_status === 'preparing') {
                          await handleStatusUpdate(orderItem.item_id, 'ready')
                        }
                      }
                    }}
                    disabled={updating !== null}
                    className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Mark Ready'}
                  </button>
                )}
                
                {/* Complete All Button - only show if there are ready items */}
                {item.orders.some(orderItem => orderItem.item_status === 'ready') && (
                  <button
                    onClick={async () => {
                      for (const orderItem of item.orders) {
                        if (orderItem.item_status === 'ready') {
                          await handleStatusUpdate(orderItem.item_id, 'completed')
                        }
                      }
                    }}
                    disabled={updating !== null}
                    className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Completing...' : 'Complete All'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
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