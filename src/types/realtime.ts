// Type definitions for Supabase real-time payloads
export interface SupabasePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: Record<string, unknown>
  old?: Record<string, unknown>
  errors?: string[]
}

export interface OrderPayload extends SupabasePayload {
  new?: {
    id?: string
    customer_name?: string
    customer_phone?: string
    status?: string
    payment_status?: string
    total_amount?: number
    notes?: string
    created_at?: string
    updated_at?: string
    cancelled_at?: string
    cancelled_reason?: string
  }
  old?: {
    id?: string
    customer_name?: string
    customer_phone?: string
    status?: string
    payment_status?: string
    total_amount?: number
    notes?: string
    created_at?: string
    updated_at?: string
    cancelled_at?: string
    cancelled_reason?: string
  }
}

export interface OrderItemPayload extends SupabasePayload {
  new?: {
    id?: string
    order_id?: string
    menu_item_id?: string
    quantity?: number
    completed_quantity?: number
    unit_price?: number
    total_price?: number
    item_status?: string
    notes?: string
  }
  old?: {
    id?: string
    order_id?: string
    menu_item_id?: string
    quantity?: number
    completed_quantity?: number
    unit_price?: number
    total_price?: number
    item_status?: string
    notes?: string
  }
}