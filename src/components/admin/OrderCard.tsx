import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Phone, ShoppingBag, ChevronRight, X, CreditCard, AlertTriangle, Smartphone, Banknote, AlertCircle, CheckCircle, Flame, Package, CheckCircle2, XCircle } from 'lucide-react'
import { Order } from '@/hooks/useOrders'
import { getFoodIcon } from '@/components/food-icons'
import LazyImage from '@/components/ui/LazyImage'

interface OrderCardProps {
  order: Order
  onStatusUpdate: (orderId: string, status: Order['status']) => Promise<void>
  onCancelOrder: (orderId: string, reason: string) => Promise<void>
  onUpdatePaymentStatus: (orderId: string, status: Order['payment_status'], method?: string) => Promise<void>
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
    next: 'confirmed' as const,
    nextLabel: 'Confirm Order'
  },
  confirmed: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
    next: 'preparing' as const,
    nextLabel: 'Start Preparing'
  },
  preparing: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Flame,
    next: 'ready' as const,
    nextLabel: 'Mark Ready'
  },
  ready: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Package,
    next: 'completed' as const,
    nextLabel: 'Complete Order'
  },
  completed: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: CheckCircle2,
    next: null,
    nextLabel: 'Completed'
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    next: null,
    nextLabel: 'Cancelled'
  }
}

export default function OrderCard({ order, onStatusUpdate, onCancelOrder, onUpdatePaymentStatus }: OrderCardProps) {
  const [updating, setUpdating] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const config = statusConfig[order.status]

  const handleStatusUpdate = async () => {
    if (!config.next || updating) return

    setUpdating(true)
    try {
      await onStatusUpdate(order.id, config.next)
    } catch (error) {
      console.error('Failed to update order:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim() || updating) return

    setUpdating(true)
    try {
      await onCancelOrder(order.id, cancelReason)
      setShowCancelDialog(false)
      setCancelReason('')
    } catch (error) {
      console.error('Failed to cancel order:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handlePaymentStatusUpdate = async (status: Order['payment_status'], method?: string) => {
    setUpdating(true)
    try {
      await onUpdatePaymentStatus(order.id, status, method)
      setShowPaymentDialog(false)
    } catch (error) {
      console.error('Failed to update payment status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const orderTime = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h ${diffInMinutes % 60}m ago`
  }

  const getPaymentDisplay = () => {
    const paymentMethod = (order as any).payment_method

    if (order.payment_status === 'paid' && paymentMethod) {
      return {
        text: paymentMethod,
        icon: paymentMethod === 'UPI' ? Smartphone : paymentMethod === 'Cash' ? Banknote : CreditCard,
        color: 'bg-green-100 text-green-800 border-green-200'
      }
    }

    if (order.payment_status === 'refunded') {
      return {
        text: 'Refunded',
        icon: CreditCard,
        color: 'bg-red-100 text-red-800 border-red-200'
      }
    }

    return {
      text: 'Pending',
      icon: CreditCard,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0)
  const paymentDisplay = getPaymentDisplay()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {order.customer_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-black">{order.customer_name}</h3>
              <div className="flex items-center text-sm text-gray-500 space-x-1">
                <Phone size={12} />
                <span>{order.customer_phone}</span>
              </div>
              <div className="mt-1">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                  #{order.order_number || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Clock size={12} className="mr-1" />
              {getTimeAgo(order.created_at)}
            </div>
            <div className="flex flex-col space-y-1">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
                {(() => {
                  const IconComponent = config.icon
                  return <IconComponent size={10} className="mr-1" />
                })()}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${paymentDisplay.color}`}>
                {(() => {
                  const IconComponent = paymentDisplay.icon
                  return <IconComponent size={10} className="mr-1" />
                })()}
                {paymentDisplay.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <ShoppingBag size={14} className="mr-1" />
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
          <div className="text-lg font-semibold text-black">
            ₹{order.total_amount.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                {/* Item thumbnail with quantity badge */}
                <div className="relative mr-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-100 to-cyan-200">
                    {item.menu_items.image_url && item.menu_items.image_url !== '/api/placeholder/300/200?text=' + encodeURIComponent(item.menu_items.name) ? (
                      <LazyImage
                        src={item.menu_items.image_url}
                        alt={item.menu_items.name}
                        className="w-full h-full object-cover"
                        placeholder={
                          <div className="w-full h-full flex items-center justify-center">
                            {(() => {
                              // Find the category name for the food icon
                              const categoryName = order.order_items.find(oi => oi.id === item.id)?.menu_items?.category_name || 'Unknown'
                              const IconComponent = getFoodIcon(categoryName, item.menu_items.name)
                              return <IconComponent className="w-5 h-5 text-teal-600" />
                            })()}
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {(() => {
                          // Find the category name for the food icon
                          const categoryName = order.order_items.find(oi => oi.id === item.id)?.menu_items?.category_name || 'Unknown'
                          const IconComponent = getFoodIcon(categoryName, item.menu_items.name)
                          return <IconComponent className="w-5 h-5 text-teal-600" />
                        })()}
                      </div>
                    )}
                  </div>
                  {/* Quantity badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-medium shadow-sm">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-gray-900">{item.menu_items.name}</span>
                  {(item.completed_quantity || 0) > 0 ? (
                    <div className="text-xs text-green-600 mt-1">
                      {item.completed_quantity}/{item.quantity} completed
                    </div>
                  ) : (
                    item.item_status && item.item_status !== 'pending' && (
                      <div className={`text-xs mt-1 ${item.item_status === 'completed' ? 'text-green-600' :
                        item.item_status === 'ready' ? 'text-blue-600' :
                          item.item_status === 'preparing' ? 'text-orange-600' :
                            'text-gray-500'
                        }`}>
                        {item.item_status === 'completed' ? 'picked up' :
                          item.item_status === 'ready' ? 'ready' :
                            item.item_status === 'preparing' ? 'cooking' :
                              item.item_status}
                      </div>
                    )
                  )}
                </div>
              </div>
              <span className="text-gray-600">₹{item.total_price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
            <strong>Note:</strong> {order.notes}
          </div>
        )}

        {order.cancelled_reason && (
          <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-600">
            <strong>Cancelled:</strong> {order.cancelled_reason}
            {order.cancelled_at && (
              <div className="text-xs text-red-500 mt-1">
                Cancelled {getTimeAgo(order.cancelled_at)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {order.status !== 'cancelled' && (
        <div className="p-4 border-t border-gray-100">
          {/* Payment Button - only show if payment is still pending */}
          {order.status === 'completed' && order.payment_status === 'pending' && (
            <button
              onClick={() => setShowPaymentDialog(true)}
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-2"
            >
              <CreditCard size={16} className="mr-2" />
              Manage Payment
            </button>
          )}

          {/* Status and Cancel Buttons - side by side */}
          {(config.next && order.status !== 'completed') || order.status !== 'completed' ? (
            <div className="flex space-x-2">
              {/* Main Status Button - takes more space */}
              {config.next && order.status !== 'completed' && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ChevronRight size={16} className="mr-2" />
                  )}
                  {updating ? 'Updating...' : config.nextLabel}
                </button>
              )}

              {/* Cancel Button - takes less space */}
              {order.status !== 'completed' && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  disabled={updating}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-600 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this order? Please provide a reason:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 mb-4 text-gray-900 placeholder-gray-500"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelDialog(false)
                  setCancelReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || updating}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {updating ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <CreditCard className="text-blue-600 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handlePaymentStatusUpdate('pending')}
                disabled={updating || order.payment_status === 'pending'}
                className="p-4 text-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard size={20} className="mx-auto mb-2 text-gray-500" />
                <div className="font-medium text-gray-900">Pending</div>
              </button>

              <button
                onClick={() => handlePaymentStatusUpdate('paid', 'UPI')}
                disabled={updating}
                className="p-4 text-center border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Smartphone size={20} className="mx-auto mb-2 text-blue-600" />
                <div className="font-medium text-gray-900">UPI</div>
              </button>

              <button
                onClick={() => handlePaymentStatusUpdate('paid', 'Cash')}
                disabled={updating}
                className="p-4 text-center border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Banknote size={20} className="mx-auto mb-2 text-green-600" />
                <div className="font-medium text-gray-900">Cash</div>
              </button>

              <button
                onClick={() => handlePaymentStatusUpdate('refunded')}
                disabled={updating || order.payment_status === 'refunded'}
                className="p-4 text-center border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CreditCard size={20} className="mx-auto mb-2 text-red-500" />
                <div className="font-medium text-gray-900">Refunded</div>
              </button>
            </div>
            <button
              onClick={() => setShowPaymentDialog(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}