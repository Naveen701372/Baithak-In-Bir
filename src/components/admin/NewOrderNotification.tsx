import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { Order } from '@/hooks/useOrders'

interface NewOrderNotificationProps {
  order: Order | null
  onClose: () => void
}

export default function NewOrderNotification({ order, onClose }: NewOrderNotificationProps) {
  if (!order) return null

  const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">New Order</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {order.customer_name}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {totalItems} items • ₹{order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Animated progress bar */}
        <motion.div
          className="h-1 bg-green-500 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}