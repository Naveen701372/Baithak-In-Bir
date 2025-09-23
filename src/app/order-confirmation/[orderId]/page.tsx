'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, User, Phone, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { orderAPI, Order, OrderItem } from '@/lib/supabase'

interface OrderWithItems extends Order {
  items: OrderItem[]
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await orderAPI.getOrderById(resolvedParams.orderId)
        setOrder(orderData as OrderWithItems)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Order not found')
      } finally {
        setLoading(false)
      }
    }

    if (resolvedParams.orderId) {
      fetchOrder()
    }
  }, [resolvedParams.orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-light text-black mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <motion.button
            onClick={() => router.push('/menu')}
            className="bg-black text-white px-8 py-3 font-light tracking-wide hover:bg-gray-800 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Back to Menu
          </motion.button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'preparing': return 'text-orange-600 bg-orange-100'
      case 'ready': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-teal-600 bg-teal-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Received'
      case 'confirmed': return 'Order Confirmed'
      case 'preparing': return 'Being Prepared'
      case 'ready': return 'Ready for Pickup'
      case 'completed': return 'Completed'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 px-4 py-12">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-white" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-light text-black mb-2">Order Placed!</h1>
            <p className="text-gray-600 font-light">Thank you for your order</p>
          </motion.div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Status */}
        <motion.div
          className="bg-white border border-gray-100 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-light text-black">Order #{order.id.slice(-8)}</h2>
              <p className="text-sm text-gray-600">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              <Clock size={14} className="inline mr-1" />
              {getStatusText(order.status)}
            </div>
          </div>
        </motion.div>

        {/* Customer Details */}
        <motion.div
          className="bg-white border border-gray-100 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-light text-black mb-4">Customer Details</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <User size={16} className="text-gray-400 mr-3" />
              <span className="text-gray-700">{order.customer_name}</span>
            </div>
            <div className="flex items-center">
              <Phone size={16} className="text-gray-400 mr-3" />
              <span className="text-gray-700">{order.customer_phone}</span>
            </div>
            {order.notes && (
              <div className="flex items-start">
                <FileText size={16} className="text-gray-400 mr-3 mt-0.5" />
                <span className="text-gray-700">{order.notes}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          className="bg-white border border-gray-100 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-light text-black mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                <div className="flex-1">
                  <h4 className="font-light text-black">{item.menu_item?.name || 'Unknown Item'}</h4>
                  <p className="text-sm text-gray-600">₹{item.unit_price} × {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-light text-black">₹{item.total_price}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-black">Total</span>
              <span className="text-xl font-medium text-black">₹{order.total_amount}</span>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          className="bg-teal-50 border border-teal-100 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-light text-black mb-3">What's Next?</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• We've received your order and will start preparing it shortly</p>
            <p>• You'll be notified when your order is ready</p>
            <p>• Estimated preparation time: 15-20 minutes</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <motion.button
            onClick={() => router.push('/menu')}
            className="w-full bg-black text-white py-4 font-light tracking-wide hover:bg-gray-800 transition-colors rounded-lg"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Order Again
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/')}
            className="w-full border border-gray-200 text-gray-700 py-4 font-light tracking-wide hover:bg-gray-50 transition-colors rounded-lg"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Back to Home
          </motion.button>
        </div>
      </div>
    </div>
  )
}