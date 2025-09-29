import { useState, useEffect, useRef } from 'react'
import { Order } from './useOrders'

interface RealTimeEvent {
    type: 'connected' | 'order_update' | 'order_item_update' | 'order_delete' | 'heartbeat'
    event?: 'INSERT' | 'UPDATE' | 'DELETE'
    order?: Order
    orderId?: string
    itemId?: string
    message?: string
    timestamp: string
}

export function useRealTimeOrders() {
    const [isConnected, setIsConnected] = useState(false)
    const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null)
    const [error, setError] = useState<string | null>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [reconnectAttempts, setReconnectAttempts] = useState(0)

    const connect = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        try {
            console.log('Establishing real-time connection...')
            const eventSource = new EventSource('/api/orders/realtime')
            eventSourceRef.current = eventSource

            eventSource.onopen = () => {
                console.log('✅ Real-time connection opened successfully')
                setIsConnected(true)
                setError(null)
                setReconnectAttempts(0)
            }

            eventSource.onmessage = (event) => {
                try {
                    const data: RealTimeEvent = JSON.parse(event.data)
                    setLastEvent(data)

                    if (data.type === 'connected') {
                        console.log('Real-time connection established:', data.message)
                    }
                } catch (err) {
                    console.error('Error parsing real-time event:', err)
                }
            }

            eventSource.onerror = (event) => {
                console.error('Real-time connection error:', event)
                setIsConnected(false)
                setError('Connection error occurred')

                // Attempt to reconnect with exponential backoff
                if (reconnectAttempts < 5) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
                    console.log(`Attempting to reconnect in ${delay}ms...`)

                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectAttempts(prev => prev + 1)
                        connect()
                    }, delay)
                } else {
                    setError('Max reconnection attempts reached')
                }
            }
        } catch (err) {
            console.error('Failed to create EventSource:', err)
            setError('Failed to establish connection')
        }
    }

    const disconnect = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }

        setIsConnected(false)
        setLastEvent(null)
        setReconnectAttempts(0)
    }

    useEffect(() => {
        connect()

        return () => {
            disconnect()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect()
        }
    }, [])

    return {
        isConnected,
        lastEvent,
        error,
        reconnectAttempts,
        connect,
        disconnect
    }
}