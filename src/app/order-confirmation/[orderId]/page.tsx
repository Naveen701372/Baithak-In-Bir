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
          <p className="text-gray-600 mb-8">We couldn&apos;t find the order you&apos;re looking for.</p>
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
      {/* Success Header with Better Vector Art */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 px-4 py-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative w-24 h-24 mx-auto mb-4"
          >
            {/* Animated Success Icon with Background */}
            <div className="absolute inset-0 bg-teal-500 rounded-full"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-teal-500" />
            </div>
            {/* Animated Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 border-2 border-teal-300 rounded-full"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-light text-black mb-1">Order Confirmed!</h1>
            <p className="text-gray-600 font-light text-sm">We&apos;re preparing your delicious meal</p>
          </motion.div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Info & Customer Details - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Order Info Card */}
          <motion.div
            className="bg-white border border-gray-100 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                <Clock size={12} className="mr-1" />
                {getStatusText(order.status)}
              </div>
              <div>
                <p className="text-base font-semibold text-black">#{order.id.slice(-8)}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Customer Details Card */}
          <motion.div
            className="bg-white border border-gray-100 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="space-y-2">
              <div className="flex items-center">
                <User size={14} className="text-teal-500 mr-2" />
                <span className="text-sm font-medium text-black">{order.customer_name}</span>
              </div>
              <div className="flex items-center">
                <Phone size={14} className="text-teal-500 mr-2" />
                <span className="text-sm text-gray-700">{order.customer_phone}</span>
              </div>
              {order.notes && (
                <div className="flex items-start">
                  <FileText size={14} className="text-teal-500 mr-2 mt-0.5" />
                  <span className="text-xs text-gray-700 line-clamp-2">{order.notes}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div
          className="bg-white border border-gray-100 rounded-lg p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-medium text-black mb-4 flex items-center">
            <div className="w-3 h-3 bg-teal-500 rounded-full mr-3"></div>
            Your Order
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-black">{item.menu_item?.name || 'Unknown Item'}</h4>
                  <p className="text-sm text-gray-600">₹{item.unit_price} × {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-medium text-black">₹{item.total_price}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-black">Total</span>
              <span className="text-xl font-semibold text-teal-600">₹{order.total_amount}</span>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-lg p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-base font-medium text-black mb-3 flex items-center">
            <Clock size={16} className="text-teal-500 mr-2" />
            What&apos;s Next?
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✓ Order received and being prepared</p>
            <p>✓ You&apos;ll be notified when ready</p>
            <p>⏱️ Estimated time: 15-20 minutes</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <motion.button
            onClick={() => router.push('/menu')}
            className="bg-teal-600 text-white py-4 px-6 text-base font-medium tracking-wide hover:bg-teal-700 transition-colors rounded-lg"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            Order Again
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/')}
            className="border border-gray-200 text-gray-700 py-4 px-6 text-base font-medium tracking-wide hover:bg-gray-50 transition-colors rounded-lg"
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