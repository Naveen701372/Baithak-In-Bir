'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, AlertCircle, CheckCircle } from 'lucide-react'
import { safeNotification } from '@/lib/notifications'

export default function NotificationStatus() {
    const [permission, setPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default')
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        const checkNotificationStatus = () => {
            setIsSupported(safeNotification.isSupported())
            setPermission(safeNotification.getPermission())
        }

        checkNotificationStatus()

        // Check periodically in case permission changes
        const interval = setInterval(checkNotificationStatus, 5000)

        return () => clearInterval(interval)
    }, [])

    const handleRequestPermission = async () => {
        const result = await safeNotification.requestPermission()
        setPermission(result)
    }

    const getStatusDisplay = () => {
        if (!isSupported) {
            return {
                icon: <BellOff size={16} className="text-gray-400" />,
                text: 'Not supported',
                color: 'text-gray-500',
                bgColor: 'bg-gray-100'
            }
        }

        switch (permission) {
            case 'granted':
                return {
                    icon: <CheckCircle size={16} className="text-green-600" />,
                    text: 'Enabled',
                    color: 'text-green-700',
                    bgColor: 'bg-green-100'
                }
            case 'denied':
                return {
                    icon: <BellOff size={16} className="text-red-600" />,
                    text: 'Blocked',
                    color: 'text-red-700',
                    bgColor: 'bg-red-100'
                }
            case 'default':
                return {
                    icon: <AlertCircle size={16} className="text-yellow-600" />,
                    text: 'Not set',
                    color: 'text-yellow-700',
                    bgColor: 'bg-yellow-100'
                }
            default:
                return {
                    icon: <BellOff size={16} className="text-gray-400" />,
                    text: 'Unknown',
                    color: 'text-gray-500',
                    bgColor: 'bg-gray-100'
                }
        }
    }

    const status = getStatusDisplay()

    return (
        <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                {status.icon}
                <span>Notifications: {status.text}</span>
            </div>

            {(permission === 'default' || permission === 'denied') && isSupported && (
                <button
                    onClick={handleRequestPermission}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                    {permission === 'denied' ? 'Enable in browser' : 'Enable'}
                </button>
            )}
        </div>
    )
}

// Minimal version for smaller spaces
export function NotificationStatusBadge() {
    const [permission, setPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default')
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        setIsSupported(safeNotification.isSupported())
        setPermission(safeNotification.getPermission())
    }, [])

    if (!isSupported) {
        return (
            <div className="flex items-center text-gray-400" title="Notifications not supported">
                <BellOff size={14} />
            </div>
        )
    }

    const getIcon = () => {
        switch (permission) {
            case 'granted':
                return <Bell size={14} className="text-green-600" title="Notifications enabled" />
            case 'denied':
                return <BellOff size={14} className="text-red-600" title="Notifications blocked" />
            case 'default':
                return <Bell size={14} className="text-yellow-600" title="Notifications not set" />
            default:
                return <BellOff size={14} className="text-gray-400" title="Notifications unknown" />
        }
    }

    return <div className="flex items-center">{getIcon()}</div>
}
