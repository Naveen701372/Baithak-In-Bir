import { useState } from 'react'
import { motion } from 'framer-motion'
import { TestTube } from 'lucide-react'
import { orderAPI } from '@/lib/supabase'

export default function TestOrderButton() {
  const [isCreating, setIsCreating] = useState(false)

  const createTestOrder = async () => {
    setIsCreating(true)
    try {
      const testOrderData = {
        customer_name: `Test Customer ${Math.floor(Math.random() * 1000)}`,
        customer_phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        total_amount: Math.floor(Math.random() * 500) + 100,
        notes: 'Test order for real-time updates',
        items: [
          {
            menu_item_id: '1', // You might need to adjust this based on your menu items
            quantity: Math.floor(Math.random() * 3) + 1,
            unit_price: 150,
            total_price: 150 * (Math.floor(Math.random() * 3) + 1)
          }
        ]
      }

      await orderAPI.createOrder(testOrderData)
      console.log('Test order created successfully!')
    } catch (error) {
      console.error('Failed to create test order:', error)
      alert('Failed to create test order. Check console for details.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <motion.button
      onClick={createTestOrder}
      disabled={isCreating}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isCreating ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        <TestTube size={16} className="mr-2" />
      )}
      {isCreating ? 'Creating...' : 'Create Test Order'}
    </motion.button>
  )
}