import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// Helper function to safely check for Notification API support
const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window
}

// Safe notification functions
const safeNotification = {
  isSupported: isNotificationSupported,

  getPermission: (): NotificationPermission | 'unsupported' => {
    if (!isNotificationSupported()) return 'unsupported'
    return Notification.permission
  },

  requestPermission: async (): Promise<NotificationPermission | 'unsupported'> => {
    if (!isNotificationSupported()) return 'unsupported'
    try {
      return await Notification.requestPermission()
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  },

  show: (title: string, options?: NotificationOptions): Notification | null => {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
      return null
    }
    try {
      return new Notification(title, options)
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }
}

export function useOrderNotifications() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Only create audio element on client side
    if (typeof window !== 'undefined') {
      try {
        audioRef.current = new Audio('/notification.mp3') // You'll need to add this file
        audioRef.current.volume = 0.5
      } catch (error) {
        console.error('Error creating audio element:', error)
      }
    }

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
            audioRef.current.play().catch((error) => {
              console.error('Error playing notification sound:', error)
            })
          }

          // Show browser notification if supported and permission granted
          safeNotification.show('New Order Received!', {
            body: `Order from ${payload.new.customer_name}`,
            icon: '/icon-192x192.png',
            tag: 'new-order'
          })
        }
      )
      .subscribe()

    // Request notification permission if supported and not yet determined
    if (safeNotification.getPermission() === 'default') {
      safeNotification.requestPermission().then((permission) => {
        console.log('Notification permission:', permission)
      })
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    requestNotificationPermission: () => safeNotification.requestPermission(),
    isNotificationSupported: () => safeNotification.isSupported(),
    notificationPermission: safeNotification.getPermission()
  }
}