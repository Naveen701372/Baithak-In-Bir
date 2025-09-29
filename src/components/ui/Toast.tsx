'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface Toast {
    id: string
    title: string
    message?: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

interface ToastProps {
    toast: Toast
    onClose: (id: string) => void
}

export function ToastItem({ toast, onClose }: ToastProps) {
    const { id, title, message, type, duration = 5000 } = toast

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id)
            }, duration)

            return () => clearTimeout(timer)
        }
    }, [id, duration, onClose])

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />
            case 'error':
                return <XCircle size={20} />
            case 'warning':
                return <AlertCircle size={20} />
            default:
                return <Info size={20} />
        }
    }

    const getColorClasses = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 dark:bg-green-900/90 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100 backdrop-blur-sm'
            case 'error':
                return 'bg-red-100 dark:bg-red-900/90 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100 backdrop-blur-sm'
            case 'warning':
                return 'bg-yellow-100 dark:bg-yellow-900/90 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 backdrop-blur-sm'
            default:
                return 'bg-blue-100 dark:bg-blue-900/90 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 backdrop-blur-sm'
        }
    }

    const getIconColorClasses = () => {
        switch (type) {
            case 'success':
                return 'text-green-500'
            case 'error':
                return 'text-red-500'
            case 'warning':
                return 'text-yellow-500'
            default:
                return 'text-blue-500'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`max-w-sm w-full border-2 rounded-xl shadow-xl p-4 pointer-events-auto ${getColorClasses()}`}
        >
            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${getIconColorClasses()}`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{title}</h4>
                    {message && (
                        <p className="text-sm opacity-90 mt-1">{message}</p>
                    )}
                </div>
                <button
                    onClick={() => onClose(id)}
                    className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    )
}

interface ToastContainerProps {
    toasts: Toast[]
    onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3 pointer-events-none
                    sm:bottom-4 sm:right-4 
                    max-sm:bottom-4 max-sm:right-2 max-sm:left-2 max-sm:max-w-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={onClose} />
                ))}
            </AnimatePresence>
        </div>
    )
}

// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts(prev => [...prev, { ...toast, id }])
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    const showSuccess = (title: string, message?: string) => {
        addToast({ title, message, type: 'success' })
    }

    const showError = (title: string, message?: string) => {
        addToast({ title, message, type: 'error' })
    }

    const showWarning = (title: string, message?: string) => {
        addToast({ title, message, type: 'warning' })
    }

    const showInfo = (title: string, message?: string) => {
        addToast({ title, message, type: 'info' })
    }

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }
}
