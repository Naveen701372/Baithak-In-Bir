'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Minus, Trash2, User, ShoppingCart, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { orderAPI } from '@/lib/supabase'
import { getFoodIcon } from '@/components/food-icons'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category_name?: string
  category_id?: string
}

interface CustomerDetails {
  name: string
  phone: string
  notes: string
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({})

  useEffect(() => {
    // Get cart from localStorage
    const savedCart = localStorage.getItem('baithak-cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('baithak-cart', JSON.stringify(newCart))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    updateCart(updatedCart)
  }

  const removeItem = (itemId: string) => {
    const updatedCart = cart.filter(item => item.id !== itemId)
    updateCart(updatedCart)
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const validateForm = () => {
    const newErrors: Partial<CustomerDetails> = {}
    
    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(customerDetails.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmitOrder = async () => {
    if (!validateForm()) return
    if (cart.length === 0) return

    setIsSubmitting(true)
    
    try {
      const orderData = {
        customer_name: customerDetails.name.trim(),
        customer_phone: customerDetails.phone.trim(),
        total_amount: getTotalPrice(),
        notes: customerDetails.notes.trim() || undefined,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
      }

      const order = await orderAPI.createOrder(orderData)
      
      // Clear cart
      localStorage.removeItem('baithak-cart')
      
      // Redirect to confirmation page
      router.push(`/order-confirmation/${order.id}`)
      
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center">
            <motion.button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </motion.button>
            <div>
              <h1 className="text-xl font-light text-black">Your Cart</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 pt-32">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart size={48} className="text-teal-600" />
            </div>
            <h1 className="text-3xl font-light text-black mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-12 text-lg font-light">Discover delicious items from our menu</p>
            <motion.button
              onClick={() => router.push('/menu')}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-12 py-4 font-light tracking-wide hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 rounded-xl shadow-lg"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              Browse Menu
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </motion.button>
            <div>
              <h1 className="text-xl font-light text-black">Your Cart</h1>
              <p className="text-sm text-gray-600">{getTotalItems()} items • ₹{getTotalPrice()}</p>
            </div>
          </div>
          <div className="bg-teal-100 px-3 py-1 rounded-full">
            <span className="text-teal-700 text-sm font-medium">{getTotalItems()}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 pb-40">
        {/* Cart Items */}
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {cart.map((item, index) => {
              const IconComponent = getFoodIcon(item.category_name || 'Unknown', item.name)
              return (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <div className="flex items-start space-x-3">
                    {/* Item Thumbnail */}
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    
                    {/* Item Details & Controls */}
                    <div className="flex-1 min-w-0">
                      {/* Item Info & Total Price */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 pr-3">
                          <h3 className="font-semibold text-black text-base leading-tight mb-1">{item.name}</h3>
                          <p className="text-xs text-gray-600 mb-1">{item.category_name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-bold text-black">₹{item.price * item.quantity}</p>
                          <motion.button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Bottom Row: Unit Price & Quantity Controls */}
                      <div className="flex justify-between items-center">
                        <p className="text-teal-600 font-semibold text-sm">₹{item.price} each</p>
                        <div className="flex items-center space-x-1.5">
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors rounded-md"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </motion.button>
                          <motion.span 
                            className="text-black font-semibold text-sm min-w-[20px] text-center"
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center transition-colors rounded-md"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Customer Details Form */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-medium text-black mb-6 flex items-center">
            <User size={20} className="mr-3 text-teal-600" />
            Contact Details
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-4 border rounded-xl font-medium text-black bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-300 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-2 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-4 py-4 border rounded-xl font-medium text-black bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-gray-300 ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-2 font-medium">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center">
                <MessageSquare size={16} className="mr-2 text-gray-600" />
                Special Instructions (Optional)
              </label>
              <textarea
                value={customerDetails.notes}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl font-medium text-black bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none placeholder:text-gray-300"
                rows={3}
                placeholder="Any special requests or dietary preferences..."
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Order Summary - Glass UI */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
        <div className="bg-gradient-to-r from-teal-500/90 to-cyan-500/90 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold">₹{getTotalPrice()}</p>
              <p className="text-sm text-teal-100">{getTotalItems()} items</p>
            </div>
            <motion.button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || cart.length === 0}
              className="bg-white/90 backdrop-blur-sm text-teal-600 px-6 py-3 font-semibold tracking-wide hover:bg-white/95 transition-all duration-200 rounded-xl shadow-lg border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Placing...</span>
                </div>
              ) : (
                'Place Order'
              )}
            </motion.button>
          </div>
          <p className="text-xs text-white/80 text-center">Estimated delivery: 15-20 minutes</p>
        </div>
      </div>
    </div>
  )
}