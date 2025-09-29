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
      <div className="space-y-8">
        {/* Stats Grid - Clean Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.change}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Orders</h2>
            <a
              href="/admin/orders"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              View all →
            </a>
          </div>

          {todaysOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No orders received yet today</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="text-gray-600">Count</span>
              </div>
              <div className="space-y-3">
                {pendingOrders.length > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-gray-900">Pending</span>
                    </div>
                    <span className="text-gray-900 font-medium">{pendingOrders.length}</span>
                  </div>
                )}
                {preparingOrders.length > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-900">Preparing</span>
                    </div>
                    <span className="text-gray-900 font-medium">{preparingOrders.length}</span>
                  </div>
                )}
                {readyOrders.length > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-900">Ready</span>
                    </div>
                    <span className="text-gray-900 font-medium">{readyOrders.length}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                    <span className="text-gray-900">Completed</span>
                  </div>
                  <span className="text-gray-900 font-medium">{completedOrders.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <a href="/admin/orders" className="text-sm text-gray-600 hover:text-gray-900">View all →</a>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-sm">Error loading orders</p>
              </div>
            ) : todaysOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No orders yet today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{order.total_amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'ready' ? 'bg-green-100 text-green-700' :
                              'bg-orange-100 text-orange-700'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/orders"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <ShoppingBag size={20} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Orders</p>
              </a>

              <a
                href="/admin/menu"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <Users size={20} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Menu</p>
              </a>

              <a
                href="/admin/inventory"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <Package size={20} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Inventory</p>
              </a>

              <a
                href="/admin/analytics"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                <TrendingUp size={20} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Analytics</p>
              </a>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

export default withAuth(DashboardPage, 'dashboard')