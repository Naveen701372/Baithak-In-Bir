'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Category, MenuItem, menuAPI } from '@/lib/supabase'
import { getFoodIcon } from '@/components/food-icons'

// Mock data for development (will be replaced with real data)
const mockCategories: Category[] = [
  { id: '1', name: 'Hot Beverages', description: 'Freshly brewed teas and coffees', display_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: '2', name: 'Cold Beverages', description: 'Refreshing drinks', display_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: '3', name: 'Shakes & Smoothies', description: 'Creamy blended treats', display_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: '4', name: 'Quick Bites', description: 'Fast and tasty options', display_order: 4, is_active: true, created_at: '', updated_at: '' },
  { id: '5', name: 'Sandwiches & Wraps', description: 'Fresh and hearty', display_order: 5, is_active: true, created_at: '', updated_at: '' },
  { id: '6', name: 'Mains & Snacks', description: 'Satisfying meals', display_order: 6, is_active: true, created_at: '', updated_at: '' },
  { id: '7', name: "Today's Special", description: 'Chef recommendations', display_order: 7, is_active: true, created_at: '', updated_at: '' },
]

const mockMenuItems: MenuItem[] = [
  // Hot Beverages
  { id: '1', category_id: '1', name: 'Masala Tea', description: 'Aromatic spiced tea with traditional Indian spices', price: 50, is_available: true, is_featured: true, display_order: 1, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Masala+Tea' },
  { id: '2', category_id: '1', name: 'Filter Coffee', description: 'South Indian style filter coffee', price: 120, is_available: true, is_featured: true, display_order: 2, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Filter+Coffee' },
  { id: '3', category_id: '1', name: 'Hot Tea', description: 'Classic Indian tea brewed to perfection', price: 40, is_available: true, is_featured: false, display_order: 3, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Hot+Tea' },
  { id: '4', category_id: '1', name: 'GLIH', description: 'Our signature special blend', price: 80, is_available: true, is_featured: true, display_order: 4, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=GLIH' },

  // Cold Beverages
  { id: '5', category_id: '2', name: 'Cold Coffee', description: 'Chilled coffee with perfect blend', price: 140, is_available: true, is_featured: true, display_order: 1, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Cold+Coffee' },
  { id: '6', category_id: '2', name: 'Lemonade', description: 'Fresh lime water to quench thirst', price: 100, is_available: true, is_featured: false, display_order: 2, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Lemonade' },
  { id: '7', category_id: '2', name: 'Iced Tea', description: 'Cool and refreshing iced tea', price: 120, is_available: true, is_featured: false, display_order: 3, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Iced+Tea' },

  // Shakes & Smoothies
  { id: '8', category_id: '3', name: 'Oreo Shake', description: 'Indulgent Oreo cookie shake', price: 150, is_available: true, is_featured: true, display_order: 1, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Oreo+Shake' },
  { id: '9', category_id: '3', name: 'Nutella Shake', description: 'Rich and creamy Nutella shake', price: 160, is_available: true, is_featured: true, display_order: 2, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Nutella+Shake' },
  { id: '10', category_id: '3', name: 'Banana Shake', description: 'Creamy banana shake (Add PB +₹20)', price: 130, is_available: true, is_featured: false, display_order: 3, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Banana+Shake' },

  // Quick Bites
  { id: '11', category_id: '4', name: 'BGC Maggi', description: 'Special BGC style with extra flavors', price: 130, is_available: true, is_featured: true, display_order: 1, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=BGC+Maggi' },
  { id: '12', category_id: '4', name: 'Veggie Maggi', description: 'Maggi loaded with fresh vegetables', price: 120, is_available: true, is_featured: false, display_order: 2, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Veggie+Maggi' },

  // Sandwiches & Wraps
  { id: '13', category_id: '5', name: 'Paneer Wrap', description: 'Grilled paneer with spices and vegetables', price: 150, is_available: true, is_featured: true, display_order: 1, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Paneer+Wrap' },
  { id: '14', category_id: '5', name: 'Mushroom Cheese Toast', description: 'Grilled toast with mushrooms and cheese', price: 130, is_available: true, is_featured: true, display_order: 2, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Mushroom+Toast' },

  // Mains & Snacks
  { id: '15', category_id: '6', name: 'Tawa Burger', description: 'Grilled burger with fresh ingredients', price: 150, is_available: true, is_featured: true, display_order: 1, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Tawa+Burger' },
  { id: '16', category_id: '6', name: 'Cheesy Nachos', description: 'Crispy nachos loaded with cheese', price: 150, is_available: true, is_featured: true, display_order: 2, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Cheesy+Nachos' },

  // Today's Special
  { id: '17', category_id: '7', name: 'Sambhar Rice', description: 'Traditional South Indian sambhar with rice', price: 180, is_available: true, is_featured: true, display_order: 1, created_at: '', updated_at: '', image_url: '/api/placeholder/300/200?text=Sambhar+Rice' },
]

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category_name?: string
  category_id?: string
}

// Subtle character animations - gentle "hello" with personality
const getAnimationVariants = (categoryName: string): Variants => {
  if (categoryName === 'Hot Beverages') {
    return {
      idle: {
        scale: 1,
        rotate: 0,
        y: 0,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
      },
      animate: {
        scale: [1, 1.06, 0.98, 1.03, 1],
        rotate: [0, -3, 3, -1.5, 1.5, 0],
        y: [0, -4, 1, -2, 0],
        filter: [
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
          "drop-shadow(-6px 16px 26px rgba(20,184,166,0.3))",
          "drop-shadow(6px 16px 26px rgba(20,184,166,0.3))",
          "drop-shadow(-3px 18px 28px rgba(20,184,166,0.25))",
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
        ],
        transition: {
          duration: 3.2,
          repeat: Infinity,
          repeatDelay: 2.5,
          ease: [0.4, 0, 0.6, 1]
        }
      }
    }
  }

  if (categoryName === 'Cold Beverages') {
    return {
      idle: {
        scale: 1,
        rotate: 0,
        y: 0,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
      },
      animate: {
        scale: [1, 1.08, 0.96, 1.04, 1],
        rotate: [0, 4, -4, 2, -2, 0],
        y: [0, -6, 2, -3, 0],
        filter: [
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
          "drop-shadow(-8px 18px 30px rgba(6,182,212,0.35))",
          "drop-shadow(8px 18px 30px rgba(6,182,212,0.35))",
          "drop-shadow(-4px 20px 32px rgba(6,182,212,0.3))",
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
        ],
        transition: {
          duration: 2.8,
          repeat: Infinity,
          repeatDelay: 2,
          ease: [0.4, 0, 0.6, 1]
        }
      }
    }
  }

  if (categoryName === 'Shakes & Smoothies') {
    return {
      idle: {
        scale: 1,
        rotate: 0,
        y: 0,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
      },
      animate: {
        scale: [1, 1.1, 0.94, 1.05, 0.98, 1.02, 1],
        rotate: [0, -5, 5, -3, 3, -1, 1, 0],
        y: [0, -8, 3, -5, 1, -2, 0],
        filter: [
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
          "drop-shadow(-10px 20px 35px rgba(236,72,153,0.3))",
          "drop-shadow(10px 20px 35px rgba(236,72,153,0.3))",
          "drop-shadow(-6px 22px 37px rgba(236,72,153,0.25))",
          "drop-shadow(6px 22px 37px rgba(236,72,153,0.25))",
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
        ],
        transition: {
          duration: 3.5,
          repeat: Infinity,
          repeatDelay: 2.2,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    }
  }

  if (categoryName === 'Quick Bites') {
    return {
      idle: {
        scale: 1,
        rotate: 0,
        y: 0,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
      },
      animate: {
        scale: [1, 1.07, 0.97, 1.03, 1],
        rotate: [0, 2, -2, 1, -1, 0],
        y: [0, -3, 1, -2, 0],
        filter: [
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
          "drop-shadow(-7px 17px 28px rgba(251,191,36,0.4))",
          "drop-shadow(7px 17px 28px rgba(251,191,36,0.4))",
          "drop-shadow(-4px 19px 30px rgba(251,191,36,0.3))",
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
        ],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 2.8,
          ease: [0.4, 0, 0.6, 1]
        }
      }
    }
  }

  if (categoryName === 'Sandwiches & Wraps') {
    return {
      idle: {
        scale: 1,
        rotate: 0,
        y: 0,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
      },
      animate: {
        scale: [1, 1.05, 0.98, 1.02, 1],
        rotate: [0, -2, 2, -1, 1, 0],
        y: [0, -4, 1, -2, 0],
        filter: [
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
          "drop-shadow(-6px 18px 30px rgba(34,197,94,0.3))",
          "drop-shadow(6px 18px 30px rgba(34,197,94,0.3))",
          "drop-shadow(-3px 20px 32px rgba(34,197,94,0.25))",
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
        ],
        transition: {
          duration: 3.8,
          repeat: Infinity,
          repeatDelay: 2.5,
          ease: [0.4, 0, 0.6, 1]
        }
      }
    }
  }

  if (categoryName === 'Mains & Snacks') {
    return {
      idle: {
        scale: 1,
        rotate: 0,
        y: 0,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
      },
      animate: {
        scale: [1, 1.08, 0.96, 1.04, 1],
        rotate: [0, -4, 4, -2, 2, 0],
        y: [0, -6, 2, -3, 0],
        filter: [
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
          "drop-shadow(-8px 19px 32px rgba(249,115,22,0.4))",
          "drop-shadow(8px 19px 32px rgba(249,115,22,0.4))",
          "drop-shadow(-4px 21px 34px rgba(249,115,22,0.3))",
          "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
        ],
        transition: {
          duration: 3.2,
          repeat: Infinity,
          repeatDelay: 2.8,
          ease: [0.4, 0, 0.6, 1]
        }
      }
    }
  }

  // Today's Special - slightly more special but still elegant
  return {
    idle: {
      scale: 1,
      rotate: 0,
      y: 0,
      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
    },
    animate: {
      scale: [1, 1.12, 0.92, 1.06, 0.98, 1.03, 1],
      rotate: [0, -6, 6, -3, 3, -1, 1, 0],
      y: [0, -10, 3, -6, 1, -3, 0],
      filter: [
        "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
        "drop-shadow(-12px 22px 40px rgba(168,85,247,0.4))",
        "drop-shadow(12px 22px 40px rgba(168,85,247,0.4))",
        "drop-shadow(-8px 25px 42px rgba(168,85,247,0.35))",
        "drop-shadow(8px 25px 42px rgba(168,85,247,0.35))",
        "drop-shadow(-4px 20px 35px rgba(168,85,247,0.3))",
        "drop-shadow(0 10px 20px rgba(0,0,0,0.1))"
      ],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatDelay: 3.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
}

// Animated Food Item Component
const AnimatedFoodItem = ({ item, category, onAddToCart, onRemoveFromCart, quantity }: {
  item: MenuItem
  category: Category
  onAddToCart: (item: MenuItem) => void
  onRemoveFromCart: (itemId: string) => void
  quantity: number
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: false,
    margin: "-20% 0px -20% 0px" // Trigger when item is 20% visible
  })

  const variants = getAnimationVariants(category.name)

  return (
    <motion.div
      ref={ref}
      className={`flex-shrink-0 w-72 bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ${quantity > 0
          ? 'border-2 border-teal-300 shadow-md ring-2 ring-teal-200'
          : 'border border-gray-100'
        }`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Item Image */}
      <div className={`h-48 relative overflow-hidden transition-all duration-300 ${quantity > 0
          ? 'bg-gradient-to-br from-teal-100 to-cyan-200'
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            className="cursor-pointer"
            variants={variants}
            initial="idle"
            animate={isInView ? "animate" : "idle"}
            whileHover={{
              scale: 1.15,
              rotate: [0, -8, 8, -5, 5, 0],
              transition: {
                rotate: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
                scale: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }
            }}
          >
            {(() => {
              const IconComponent = getFoodIcon(category.name, item.name)
              return <IconComponent className="w-28 h-28" />
            })()}
          </motion.div>
        </div>
        {item.is_featured && (
          <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 text-xs font-light tracking-wide">
            FEATURED
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-4">
        <h3 className="text-lg font-light text-black mb-2 tracking-wide">
          {item.name}
        </h3>
        <p className="text-gray-600 text-sm font-light leading-relaxed mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-light text-black">
            ₹{item.price}
          </span>

          {/* Add to Cart Controls */}
          <div className="flex items-center space-x-3">
            {quantity > 0 ? (
              <motion.div
                className="flex items-center space-x-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.button
                  onClick={() => onRemoveFromCart(item.id)}
                  className="w-9 h-9 bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-colors rounded-sm"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Minus size={16} strokeWidth={2.5} />
                </motion.button>
                <motion.span
                  className="text-teal-600 font-medium min-w-[24px] text-center text-lg"
                  key={quantity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {quantity}
                </motion.span>
                <motion.button
                  onClick={() => onAddToCart(item)}
                  className="w-9 h-9 bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-colors rounded-sm"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => onAddToCart(item)}
                className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-colors font-light tracking-wide rounded-sm"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                Add
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function MenuPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        console.log('Fetching menu data from database...')
        const { categories, menuItems } = await menuAPI.getMenuWithCategories()

        if (categories.length > 0 && menuItems.length > 0) {
          console.log('Successfully fetched from database:', { categories: categories.length, menuItems: menuItems.length })
          setCategories(categories)
          setMenuItems(menuItems)
        } else {
          console.log('Database returned empty results, using mock data')
          setCategories(mockCategories)
          setMenuItems(mockMenuItems)
        }
      } catch (error) {
        console.error('Error fetching menu data from database:', error)
        console.log('Falling back to mock data')
        // Fallback to mock data if database fetch fails
        setCategories(mockCategories)
        setMenuItems(mockMenuItems)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuData()

    // Load cart from localStorage
    const savedCart = localStorage.getItem('baithak-cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const addToCart = (item: MenuItem) => {
    const category = categories.find(cat => cat.id === item.category_id)

    const newCart: CartItem[] = (() => {
      const existing = cart.find(cartItem => cartItem.id === item.id)
      if (existing) {
        return cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      
      const newCartItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        category_name: category?.name || 'Unknown',
        category_id: item.category_id
      }
      
      return [...cart, newCartItem]
    })()

    setCart(newCart)
    localStorage.setItem('baithak-cart', JSON.stringify(newCart))
  }

  const removeFromCart = (itemId: string) => {
    const newCart: CartItem[] = (() => {
      const existing = cart.find(cartItem => cartItem.id === itemId)
      if (existing && existing.quantity > 1) {
        return cart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      }
      return cart.filter(cartItem => cartItem.id !== itemId)
    })()

    setCart(newCart)
    localStorage.setItem('baithak-cart', JSON.stringify(newCart))
  }

  const getItemQuantity = (itemId: string) => {
    return cart.find(item => item.id === itemId)?.quantity || 0
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-light text-black mb-2 tracking-tight">
              Our Menu
            </h1>
            <div className="w-16 h-px bg-black mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="pb-24">
        {categories.map((category, categoryIndex) => {
          const categoryItems = menuItems.filter(item => item.category_id === category.id)

          if (categoryItems.length === 0) return null

          return (
            <motion.section
              key={category.id}
              className="py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="px-4 mb-6">
                <h2 className="text-2xl font-light text-black mb-2 tracking-wide">
                  {category.name}
                </h2>
                <p className="text-gray-600 font-light text-sm">
                  {category.description}
                </p>
              </div>

              {/* Horizontal Scrolling Items */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 px-4 pb-2">
                  {categoryItems.map((item) => (
                    <AnimatedFoodItem
                      key={item.id}
                      item={item}
                      category={category}
                      onAddToCart={addToCart}
                      onRemoveFromCart={removeFromCart}
                      quantity={getItemQuantity(item.id)}
                    />
                  ))}
                </div>
              </div>
            </motion.section>
          )
        })}
      </div>

      {/* Floating Cart */}
      {getTotalItems() > 0 && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-teal-500/80 to-cyan-500/80 backdrop-blur-md border border-white/20 text-white p-4 rounded-xl shadow-2xl z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                key={getTotalItems()}
              >
                <ShoppingCart size={20} />
              </motion.div>
              <div>
                <p className="text-lg font-medium">
                  ₹{getTotalPrice()}
                </p>
                <p className="text-xs text-gray-200">
                  {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => router.push('/cart')}
              className="bg-white/90 backdrop-blur-sm text-teal-600 px-6 py-2 font-medium tracking-wide hover:bg-white/95 transition-all duration-200 rounded-lg border border-white/30 shadow-lg"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              View Cart
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}