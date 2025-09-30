/**
 * Safe notification utilities for cross-browser compatibility
 * Handles mobile browsers that don't support the Notification API
 */

export type NotificationPermissionState = NotificationPermission | 'unsupported'

// Helper function to safely check for Notification API support
export const isNotificationSupported = (): boolean => {
    return typeof window !== 'undefined' && 'Notification' in window
}

// Safe notification functions
export const safeNotification = {
    /**
     * Check if the Notification API is supported
     */
    isSupported: (): boolean => isNotificationSupported(),

    /**
     * Get current notification permission status
     */
    getPermission: (): NotificationPermissionState => {
        if (!isNotificationSupported()) return 'unsupported'
        try {
            return Notification.permission
        } catch (error) {
            console.error('Error getting notification permission:', error)
            return 'unsupported'
        }
    },

    /**
     * Request notification permission
     */
    requestPermission: async (): Promise<NotificationPermissionState> => {
        if (!isNotificationSupported()) {
            console.log('Notifications not supported on this browser')
            return 'unsupported'
        }

        try {
            const permission = await Notification.requestPermission()
            console.log('Notification permission granted:', permission)
            return permission
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            return 'denied'
        }
    },

    /**
     * Show a notification if supported and permitted
     */
    show: (title: string, options?: NotificationOptions): Notification | null => {
        if (!isNotificationSupported()) {
            console.log('Notifications not supported - falling back to console log:', title, options?.body)
            return null
        }

        if (Notification.permission !== 'granted') {
            console.log('Notification permission not granted, cannot show notification:', title)
            return null
        }

        try {
            return new Notification(title, {
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                silent: false,
                ...options
            })
        } catch (error) {
            console.error('Error showing notification:', error)
            return null
        }
    },

    /**
     * Show a notification with auto-close functionality
     */
    showWithAutoClose: (
        title: string,
        options?: NotificationOptions,
        autoCloseMs: number = 8000
    ): Notification | null => {
        const notification = safeNotification.show(title, options)

        if (notification) {
            // Auto-close after specified time
            setTimeout(() => {
                notification.close()
            }, autoCloseMs)

            // Handle click to focus window
            notification.onclick = () => {
                if (typeof window !== 'undefined') {
                    window.focus()
                }
                notification.close()
            }
        }

        return notification
    },

    /**
     * Request permission and show notification if granted
     */
    requestAndShow: async (
        title: string,
        options?: NotificationOptions
    ): Promise<Notification | null> => {
        const permission = await safeNotification.requestPermission()

        if (permission === 'granted') {
            return safeNotification.show(title, options)
        }

        console.log('Notification permission not granted:', permission)
        return null
    }
}

/**
 * Play notification sound safely
 */
export const playNotificationSound = (soundPath: string = '/notification.mp3'): void => {
    if (typeof window === 'undefined') return

    try {
        const audio = new Audio(soundPath)
        audio.volume = 0.5
        audio.play().catch((error) => {
            console.log('Could not play notification sound:', error)
        })
    } catch (error) {
        console.error('Error creating audio element:', error)
    }
}

/**
 * Show order notification with fallback for unsupported browsers
 */
export const showOrderNotification = (
    title: string,
    customerName: string,
    amount?: number,
    type: 'new_order' | 'kitchen_alert' | 'order_ready' = 'new_order'
): void => {
    const emoji = type === 'kitchen_alert' ? '🍳' : type === 'order_ready' ? '✅' : '📋'
    const body = amount
        ? `Order from ${customerName} - ₹${amount}`
        : `Order from ${customerName}`

    // Try to show browser notification
    safeNotification.showWithAutoClose(`${emoji} ${title}`, {
        body,
        tag: type,
        requireInteraction: type === 'kitchen_alert' // Kitchen alerts should stay until dismissed
    })

    // Always play sound as backup notification
    playNotificationSound()
}

export default safeNotification
