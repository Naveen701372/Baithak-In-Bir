'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, Search, Calendar, ShoppingBag, ChefHat } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAuth } from '@/contexts/AuthContext'
import { useOrders, Order } from '@/hooks/useOrders'
import OrderCard from '@/components/admin/OrderCard'
import ItemManagement from '@/components/admin/ItemManagement'

function OrdersPage() {
  const { orders, loading, error, updateOrderStatus, cancelOrder, updatePaymentStatus, completeItemUnit, updateItemStatus } = useOrders()
  const [activeTab, setActiveTab] = useState<'orders' | 'kitchen'>('orders')
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('today')
  const [showSearch, setShowSearch] = useState(false)

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    
    // Search filter
    if (searchTerm && !order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order.customer_phone.includes(searchTerm)) return false
    
    // Date filter
    const orderDate = new Date(order.created_at)
    const now = new Date()
    
    if (dateFilter === 'today') {
      return orderDate.toDateString() === now.toDateString()
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return orderDate >= weekAgo
    }
    
    return true
  })

  // Get base filtered orders (without status filter) for accurate counts
  const baseFilteredOrders = orders.filter(order => {
    // Search filter
    if (searchTerm && !order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order.customer_phone.includes(searchTerm)) return false
    
    // Date filter
    const orderDate = new Date(order.created_at)
    const now = new Date()
    
    if (dateFilter === 'today') {
      return orderDate.toDateString() === now.toDateString()
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return orderDate >= weekAgo
    }
    
    return true
  })

  const statusOptions: { value: Order['status'] | 'all', label: string, count: number }[] = [
    { value: 'all', label: 'All Orders', count: baseFilteredOrders.length },
    { value: 'pending', label: 'Pending', count: baseFilteredOrders.filter(o => o.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: baseFilteredOrders.filter(o => o.status === 'confirmed').length },
    { value: 'preparing', label: 'Preparing', count: baseFilteredOrders.filter(o => o.status === 'preparing').length },
    { value: 'ready', label: 'Ready', count: baseFilteredOrders.filter(o => o.status === 'ready').length },
    { value: 'completed', label: 'Completed', count: baseFilteredOrders.filter(o => o.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: baseFilteredOrders.filter(o => o.status === 'cancelled').length },
  ]

  return (
    <AdminLayout title="Order Management">
      <div className="space-y-6">


        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-1">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'orders'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag size={16} className="mr-2" />
              Order Management
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'kitchen'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ChefHat size={16} className="mr-2" />
              Kitchen View
            </button>
          </div>
        </div>

        {/* Order Management Filters - only show for orders tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Search and Status Filter */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Filter size={18} className="text-gray-500 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Filter by Status</h3>
                  </div>
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                      showSearch || searchTerm
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Search size={14} className="mr-2" />
                    Search Orders
                  </button>
                </div>
                
                {/* Expandable Search Bar */}
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search by customer name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900 placeholder-gray-500"
                        autoFocus
                      />
                    </div>
                  </motion.div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 text-center ${
                        statusFilter === option.value
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-xs opacity-75">({option.count})</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-500 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Time Period</h3>
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'today' | 'week' | 'all')}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                >
                  <option value="today">Today Only</option>
                  <option value="week">This Week</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">Error loading orders: {error}</p>
          </div>
        ) : activeTab === 'orders' ? (
          /* Orders Grid */
          filteredOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more orders.'
                  : 'Orders will appear here as customers place them.'}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderCard 
                    order={order} 
                    onStatusUpdate={updateOrderStatus}
                    onCancelOrder={cancelOrder}
                    onUpdatePaymentStatus={updatePaymentStatus}
                  />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          /* Kitchen Management View */
          <ItemManagement 
            orders={orders}
            onCompleteItemUnit={completeItemUnit}
            onUpdateItemStatus={updateItemStatus}
          />
        )}
      </div>
    </AdminLayout>
  )
}

export default withAuth(OrdersPage, 'orders')