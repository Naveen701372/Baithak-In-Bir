'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Package, X, TrendingUp } from 'lucide-react'
import { useInventory } from '@/hooks/useInventory'

interface InventoryAlertsProps {
  showInDashboard?: boolean
  maxItems?: number
}

export default function InventoryAlerts({ showInDashboard = false, maxItems = 5 }: InventoryAlertsProps) {
  const { alerts, loading, restockItem } = useInventory()
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.includes(alert.id))
    .slice(0, maxItems)

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId])
  }

  const handleQuickRestock = async (alertId: string, alertName: string) => {
    const quantity = prompt(`Enter quantity to restock for ${alertName}:`)
    if (quantity && !isNaN(Number(quantity))) {
      try {
        await restockItem(alertId, Number(quantity))
        handleDismiss(alertId)
      } catch (error) {
        alert('Failed to restock item')
      }
    }
  }

  if (loading || visibleAlerts.length === 0) {
    return null
  }

  if (showInDashboard) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Inventory Alerts
          </h3>
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
            {alerts.length}
          </span>
        </div>

        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${
                alert.status === 'out-of-stock'
                  ? 'bg-red-50 border-red-400'
                  : 'bg-yellow-50 border-yellow-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{alert.name}</p>
                  <p className={`text-sm ${
                    alert.status === 'out-of-stock' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alert.status === 'out-of-stock' 
                      ? 'Out of stock' 
                      : `Low stock: ${alert.current_stock} remaining (min: ${alert.minimum_stock})`
                    }
                  </p>
                </div>
                <button
                  onClick={() => handleQuickRestock(alert.id, alert.name)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Quick restock"
                >
                  <TrendingUp size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {alerts.length > maxItems && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500">
              +{alerts.length - maxItems} more alerts
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2">
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`p-4 rounded-lg shadow-lg border-l-4 ${
              alert.status === 'out-of-stock'
                ? 'bg-red-50 border-red-400'
                : 'bg-yellow-50 border-yellow-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  alert.status === 'out-of-stock' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  {alert.status === 'out-of-stock' ? (
                    <Package size={16} className="text-red-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{alert.name}</h4>
                  <p className={`text-sm ${
                    alert.status === 'out-of-stock' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alert.status === 'out-of-stock' 
                      ? 'Out of stock - orders may be affected' 
                      : `Low stock: ${alert.current_stock} remaining`
                    }
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleQuickRestock(alert.id, alert.name)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      Quick Restock
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}