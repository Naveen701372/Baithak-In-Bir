import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Category {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_available: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: string
  customer_name?: string
  customer_phone?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  menu_item?: MenuItem
}

// API Functions
export const menuAPI = {
  // Fetch all categories with their menu items
  async getMenuWithCategories() {
    console.log('Fetching categories from Supabase...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (categoriesError) {
      console.error('Categories error:', categoriesError)
      throw categoriesError
    }

    console.log('Categories fetched:', categories?.length || 0)

    console.log('Fetching menu items from Supabase...')
    const { data: menuItems, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('display_order', { ascending: true })

    if (itemsError) {
      console.error('Menu items error:', itemsError)
      throw itemsError
    }

    console.log('Menu items fetched:', menuItems?.length || 0)

    return { categories: categories || [], menuItems: menuItems || [] }
  },

  // Fetch categories only
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Fetch menu items by category
  async getMenuItemsByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  }
}

export const orderAPI = {
  // Create a new order
  async createOrder(orderData: {
    customer_name: string
    customer_phone: string
    total_amount: number
    notes?: string
    items: Array<{
      menu_item_id: string
      quantity: number
      unit_price: number
      total_price: number
    }>
  }) {
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        total_amount: orderData.total_amount,
        notes: orderData.notes,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  },

  // Get order by ID with items
  async getOrderById(orderId: string) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) throw orderError

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        menu_item:menu_items(*)
      `)
      .eq('order_id', orderId)

    if (itemsError) throw itemsError

    return { ...order, items: orderItems || [] }
  }
}