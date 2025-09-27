import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { OrderPayload, OrderItemPayload } from '@/types/realtime'

export async function GET(request: NextRequest) {
  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', message: 'Real-time connection established' })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Set up Supabase real-time subscription
      const ordersChannel = supabase
        .channel('orders-realtime-sse')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          async (payload: OrderPayload) => {
            try {
              // Fetch the complete order with items when there's a change
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const orderId = payload.new?.id || payload.old?.id
                if (!orderId) return

                const { data: orderData, error } = await supabase
                  .from('orders')
                  .select(`
                    *,
                    order_items (
                      id,
                      order_id,
                      menu_item_id,
                      quantity,
                      completed_quantity,
                      unit_price,
                      total_price,
                      item_status,
                      notes,
                      menu_items (
                        name,
                        image_url
                      )
                    )
                  `)
                  .eq('id', orderId)
                  .single()

                if (!error && orderData) {
                  const eventData = {
                    type: 'order_update',
                    event: payload.eventType,
                    order: orderData,
                    timestamp: new Date().toISOString()
                  }
                  
                  const data = `data: ${JSON.stringify(eventData)}\n\n`
                  controller.enqueue(encoder.encode(data))
                }
              } else if (payload.eventType === 'DELETE') {
                const orderId = payload.old?.id
                if (!orderId) return

                const eventData = {
                  type: 'order_delete',
                  event: payload.eventType,
                  orderId,
                  timestamp: new Date().toISOString()
                }
                
                const data = `data: ${JSON.stringify(eventData)}\n\n`
                controller.enqueue(encoder.encode(data))
              }
            } catch (error) {
              console.error('Error processing order change:', error)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_items'
          },
          async (payload: OrderItemPayload) => {
            try {
              // When order items change, fetch the complete order
              const orderId = payload.new?.order_id || payload.old?.order_id
              if (orderId) {
                const { data: orderData, error } = await supabase
                  .from('orders')
                  .select(`
                    *,
                    order_items (
                      id,
                      order_id,
                      menu_item_id,
                      quantity,
                      completed_quantity,
                      unit_price,
                      total_price,
                      item_status,
                      notes,
                      menu_items (
                        name,
                        image_url
                      )
                    )
                  `)
                  .eq('id', orderId)
                  .single()

                if (!error && orderData) {
                  const eventData = {
                    type: 'order_item_update',
                    event: payload.eventType,
                    order: orderData,
                    itemId: payload.new?.id || payload.old?.id,
                    timestamp: new Date().toISOString()
                  }
                  
                  const data = `data: ${JSON.stringify(eventData)}\n\n`
                  controller.enqueue(encoder.encode(data))
                }
              }
            } catch (error) {
              console.error('Error processing order item change:', error)
            }
          }
        )
        .subscribe()

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          const data = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          clearInterval(heartbeat)
          supabase.removeChannel(ordersChannel)
        }
      }, 30000) // Send heartbeat every 30 seconds

      // Cleanup function
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        supabase.removeChannel(ordersChannel)
        controller.close()
      })
    }
  })

  return new Response(stream, { headers })
}