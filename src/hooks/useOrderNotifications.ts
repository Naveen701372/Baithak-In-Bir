import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export function useOrderNotifications() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('/notification.mp3') // You'll need to add this file
    audioRef.current.volume = 0.5

    // Subscribe to new orders
    const channel = supabase
      .channel('new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received:', payload)
          
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(console.error)
          }

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('New Order Received!', {
              body: `Order from ${payload.new.customer_name}`,
              icon: '/icon-192x192.png',
              tag: 'new-order'
            })
          }
        }
      )
      .subscribe()

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    requestNotificationPermission: () => Notification.requestPermission()
  }
}