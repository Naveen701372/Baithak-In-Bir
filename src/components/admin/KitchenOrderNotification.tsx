import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, X, Clock } from 'lucide-react'
import { Order } from '@/hooks/useOrders'

interface KitchenOrderNotificationProps {
    order: Order | null
    onClose: () => void
}

export default function KitchenOrderNotification({ order, onClose }: KitchenOrderNotificationProps) {
    if (!order) return null

    const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0)
    const uniqueMenuItems = new Set(order.order_items.map(item => item.menu_items.name)).size

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-orange-200 rounded-lg shadow-lg max-w-md w-full mx-4"
            >
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <motion.div
                                className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <ChefHat size={20} className="text-orange-600" />
                            </motion.div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-gray-900">New Kitchen Order</h3>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                        {order.customer_name}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <Clock size={14} />
                                    <span>{uniqueMenuItems} dish{uniqueMenuItems !== 1 ? 'es' : ''} • {totalItems} items</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Show the dishes to cook */}
                    <div className="mt-3 pl-13">
                        <div className="text-xs text-gray-500 mb-1">Items to prepare:</div>
                        <div className="space-y-1">
                            {Array.from(new Set(order.order_items.map(item => item.menu_items.name))).map((dishName) => {
                                const totalQtyForDish = order.order_items
                                    .filter(item => item.menu_items.name === dishName)
                                    .reduce((sum, item) => sum + item.quantity, 0)

                                return (
                                    <div key={dishName} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{dishName}</span>
                                        <span className="text-orange-600 font-medium">×{totalQtyForDish}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Animated progress bar */}
                <motion.div
                    className="h-1 bg-orange-500 rounded-b-lg"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 6, ease: 'linear' }}
                />
            </motion.div>
        </AnimatePresence>
    )
}
