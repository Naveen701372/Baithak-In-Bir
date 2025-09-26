# Technical Implementation Guide

## 🏗️ Architecture Overview

This document provides detailed technical information about the restaurant management platform's implementation.

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Design](#database-design)
3. [Frontend Implementation](#frontend-implementation)
4. [Backend Integration](#backend-integration)
5. [Real-time Features](#real-time-features)
6. [Authentication System](#authentication-system)
7. [State Management](#state-management)
8. [Performance Optimization](#performance-optimization)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)

## System Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────┤
│ Next.js 14 + TypeScript + Tailwind CSS + Framer Motion │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   API Layer                             │
├─────────────────────────────────────────────────────────┤
│           Supabase Client + Real-time                   │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend Layer                          │
├─────────────────────────────────────────────────────────┤
│        Supabase (PostgreSQL + Auth + Real-time)        │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard routes
│   ├── menu/               # Customer menu pages
│   ├── cart/               # Shopping cart
│   └── order-confirmation/ # Order tracking
├── components/             # Reusable components
│   ├── admin/              # Admin-specific components
│   ├── layout/             # Layout components
│   └── ui/                 # Base UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── types/                  # TypeScript type definitions
└── contexts/               # React contexts
```

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   user_profiles │    │     orders      │    │   menu_items    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ customer_name   │    │ name            │
│ role            │    │ customer_phone  │    │ description     │
│ permissions     │    │ status          │    │ price           │
│ created_at      │    │ payment_status  │    │ category        │
│ updated_at      │    │ total_amount    │    │ image_url       │
└─────────────────┘    │ cancelled_at    │    │ is_available    │
                       │ cancelled_reason│    │ created_at      │
                       │ created_at      │    └─────────────────┘
                       │ updated_at      │             │
                       └─────────────────┘             │
                                │                      │
                                │                      │
                                ▼                      │
                       ┌─────────────────┐             │
                       │   order_items   │◄────────────┘
                       ├─────────────────┤
                       │ id (PK)         │
                       │ order_id (FK)   │
                       │ menu_item_id(FK)│
                       │ quantity        │
                       │ completed_qty   │
                       │ unit_price      │
                       │ total_price     │
                       │ item_status     │
                       │ notes           │
                       │ created_at      │
                       └─────────────────┘
```

### Database Schema Details

#### Core Tables

**orders table:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_status VARCHAR(20) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**order_items table:**
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  completed_quantity INTEGER DEFAULT 0 CHECK (completed_quantity >= 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  item_status VARCHAR(20) DEFAULT 'pending'
    CHECK (item_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Performance Indexes

```sql
-- Order queries optimization
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);

-- Order items optimization
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_status ON order_items(item_status);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Composite indexes for common queries
CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX idx_order_items_status_order_id ON order_items(item_status, order_id);
```

#### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public read access to menu
CREATE POLICY "Public read access to menu_items" ON menu_items
  FOR SELECT USING (is_available = true);
```

## Frontend Implementation

### Component Structure

#### Order Management Hook

```typescript
// src/hooks/useOrders.ts
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders with real-time subscription
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id, order_id, menu_item_id, quantity, completed_quantity,
            unit_price, total_price, item_status, notes,
            menu_items (name, image_url)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  // Real-time subscription setup
  useEffect(() => {
    fetchOrders()

    const ordersChannel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, () => fetchOrders())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'order_items'
      }, () => fetchOrders())
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
    }
  }, [fetchOrders])

  // Order management functions
  const updateOrderStatus = useCallback(async (
    orderId: string, 
    status: Order['status']
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) throw error
  }, [])

  const completeItemUnit = useCallback(async (itemId: string) => {
    const currentItem = orders
      .flatMap(o => o.order_items)
      .find(item => item.id === itemId)
    
    if (!currentItem) throw new Error('Item not found')
    
    const newCompletedQuantity = (currentItem.completed_quantity || 0) + 1
    const isFullyCompleted = newCompletedQuantity >= currentItem.quantity
    
    const { error } = await supabase
      .from('order_items')
      .update({
        completed_quantity: newCompletedQuantity,
        item_status: isFullyCompleted ? 'completed' : currentItem.item_status
      })
      .eq('id', itemId)

    if (error) throw error
  }, [orders])

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    completeItemUnit,
    refetch: fetchOrders
  }
}
```

---

This technical implementation guide provides comprehensive coverage of the restaurant management platform's architecture, implementation details, and best practices. The system is built with modern technologies, follows security best practices, and is designed for scalability and maintainability.