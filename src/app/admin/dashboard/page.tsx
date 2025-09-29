'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Users, TrendingUp, Clock, AlertCircle, CheckCircle, Package } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAuth } from '@/contexts/AuthContext'
import { useOrders } from '@/hooks/useOrders'
import { useOrderNotifications } from '@/hooks/useOrderNotifications'
import OrderCard from '@/components/admin/OrderCard'
import InventoryAlerts from '@/components/admin/InventoryAlerts'
import TestOrderButton from '@/components/admin/TestOrderButton'

function DashboardPage() {
  const { todaysOrders, loading, error, updateOrderStatus, cancelOrder, updatePaymentStatus, getOrdersByStatus } = useOrders()
  useOrderNotifications() // Enable real-time notifications

  // Calculate real-time stats
  const todaysRevenue = todaysOrders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.total_amount, 0)

  const pendingOrders = getOrdersByStatus('pending')
  const preparingOrders = getOrdersByStatus('preparing')
  const readyOrders = getOrdersByStatus('ready')
  const completedOrders = getOrdersByStatus('completed')

  const stats = [
    {
      name: 'Today\'s Orders',
      value: todaysOrders.length.toString(),
      change: `${completedOrders.length} completed`,
      changeType: 'positive' as const,
      icon: ShoppingBag,
    },
    {
      name: 'Pending Orders',
      value: pendingOrders.length.toString(),
      change: 'Need attention',
      changeType: pendingOrders.length > 0 ? 'negative' as const : 'positive' as const,
      icon: AlertCircle,
    },
    {
      name: 'Revenue Today',
      value: `₹${todaysRevenue.toFixed(0)}`,
      change: `${completedOrders.length} orders`,
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      name: 'Ready Orders',
      value: readyOrders.length.toString(),
      change: 'Ready for pickup',
      changeType: readyOrders.length > 0 ? 'negative' as const : 'positive' as const,
      icon: CheckCircle,
    },
  ]



  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5"
              >
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-gray-700" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 leading-tight">
                    {stat.name}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                    {stat.value}
                  </p>
                  <p className={`text-xs leading-tight ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Inventory Alerts & Test Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InventoryAlerts showInDashboard={true} maxItems={3} />
          </div>
          <div>
            <TestOrderButton />
          </div>
        </div>

        {/* Order Management Sections */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">Error loading orders: {error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Orders - Highest Priority */}
            {pendingOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-red-800 flex items-center">
                    <AlertCircle className="mr-2 text-red-600" size={18} />
                    Pending ({pendingOrders.length})
                  </h2>
                  <span className="text-xs sm:text-sm text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full">
                    Urgent
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {pendingOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onStatusUpdate={updateOrderStatus}
                      onCancelOrder={cancelOrder}
                      onUpdatePaymentStatus={updatePaymentStatus}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Preparing Orders */}
            {preparingOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-orange-800 flex items-center">
                    <Clock className="mr-2 text-orange-600" size={18} />
                    Preparing ({preparingOrders.length})
                  </h2>
                  <span className="text-xs sm:text-sm text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded-full">
                    In Progress
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {preparingOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onStatusUpdate={updateOrderStatus}
                      onCancelOrder={cancelOrder}
                      onUpdatePaymentStatus={updatePaymentStatus}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Ready Orders */}
            {readyOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-green-800 flex items-center">
                    <CheckCircle className="mr-2 text-green-600" size={18} />
                    Ready ({readyOrders.length})
                  </h2>
                  <span className="text-xs sm:text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                    Ready to serve
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {readyOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onStatusUpdate={updateOrderStatus}
                      onCancelOrder={cancelOrder}
                      onUpdatePaymentStatus={updatePaymentStatus}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* No Orders Message */}
            {todaysOrders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-lg p-12 text-center"
              >
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders today yet</h3>
                <p className="text-gray-600">Orders will appear here as customers place them.</p>
              </motion.div>
            )}

            {/* Completed Orders Summary */}
            {completedOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      {completedOrders.length} Orders Completed Today
                    </h3>
                    <p className="text-green-600">Total revenue: ₹{todaysRevenue.toFixed(2)}</p>
                  </div>
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5"
        >
          <h2 className="text-base sm:text-lg font-semibold text-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <a 
              href="/admin/orders"
              className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center block group"
            >
              <ShoppingBag size={20} className="text-gray-700 mb-2 mx-auto group-hover:text-black transition-colors" />
              <p className="font-medium text-black text-sm leading-tight">Orders</p>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Manage orders</p>
            </a>
            
            <a 
              href="/admin/menu"
              className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center block group"
            >
              <Users size={20} className="text-gray-700 mb-2 mx-auto group-hover:text-black transition-colors" />
              <p className="font-medium text-black text-sm leading-tight">Menu</p>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Items & categories</p>
            </a>
            
            <a 
              href="/admin/inventory"
              className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center block group"
            >
              <Package size={20} className="text-gray-700 mb-2 mx-auto group-hover:text-black transition-colors" />
              <p className="font-medium text-black text-sm leading-tight">Inventory</p>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Stock levels</p>
            </a>
            
            <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
              <TrendingUp size={20} className="text-gray-700 mb-2 mx-auto group-hover:text-black transition-colors" />
              <p className="font-medium text-black text-sm leading-tight">Analytics</p>
              <p className="text-xs text-gray-600 mt-1 hidden sm:block">Coming soon</p>
            </button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

export default withAuth(DashboardPage, 'dashboard')