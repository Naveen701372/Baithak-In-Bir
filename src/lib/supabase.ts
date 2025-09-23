import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'owner' | 'staff'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'owner' | 'staff'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'owner' | 'staff'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string | null
          category: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          image_url?: string | null
          category: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string | null
          category?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string | null
          customer_phone: string | null
          status: 'received' | 'preparing' | 'ready' | 'completed'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'received' | 'preparing' | 'ready' | 'completed'
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string | null
          customer_phone?: string | null
          status?: 'received' | 'preparing' | 'ready' | 'completed'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          unit: string
          current_stock: number
          minimum_stock: number
          cost_per_unit: number
          supplier: string | null
          last_restocked: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          unit: string
          current_stock: number
          minimum_stock: number
          cost_per_unit: number
          supplier?: string | null
          last_restocked?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          unit?: string
          current_stock?: number
          minimum_stock?: number
          cost_per_unit?: number
          supplier?: string | null
          last_restocked?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}