'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TestTube, Volume2 } from 'lucide-react'

interface TestOrderButtonProps {
  onTestKitchenNotification?: () => void
  onTestNewOrderNotification?: () => void
}

export default function TestOrderButton({ 
  onTestKitchenNotification, 
  onTestNewOrderNotification 
}: TestOrderButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const playTestSound = (type: 'new_order' | 'kitchen_alert') => {
    if (isPlaying) return
    
    setIsPlaying(true)
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const filterNode = audioContext.createBiquadFilter()

      oscillator.connect(filterNode)
      filterNode.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (type === 'kitchen_alert') {
        // Kitchen alert: Urgent double beep
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.15)
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.3)
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.45)
        
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.6)
        
        setTimeout(() => setIsPlaying(false), 600)
      } else {
        // New order: Pleasant chime
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2) // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4) // G5
        
        filterNode.frequency.setValueAtTime(1500, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.6)
        
        setTimeout(() => setIsPlaying(false), 600)
      }
    } catch (error) {
      console.log('Could not play test sound:', error)
      setIsPlaying(false)
    }
  }

  const testBrowserNotification = (type: 'new_order' | 'kitchen_alert') => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(
        type === 'kitchen_alert' ? '🍳 Test Kitchen Alert!' : '📋 Test New Order!',
        {
          body: type === 'kitchen_alert' 
            ? 'This is a test kitchen notification with sound'
            : 'This is a test new order notification',
          icon: '/icon-192x192.png',
          tag: `test-${type}`,
          silent: false,
          requireInteraction: false
        }
      )
      
      setTimeout(() => {
        notification.close()
      }, 3000)
    } else {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          testBrowserNotification(type)
        }
      })
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <TestTube size={16} className="mr-2 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">Test Notifications</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={() => {
            playTestSound('new_order')
            testBrowserNotification('new_order')
            onTestNewOrderNotification?.()
          }}
          disabled={isPlaying}
          className="p-3 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.95 }}
        >
          <Volume2 size={16} className="mx-auto mb-1 text-teal-600" />
          <p className="text-xs font-medium text-teal-800">Test New Order</p>
        </motion.button>
        
        <motion.button
          onClick={() => {
            playTestSound('kitchen_alert')
            testBrowserNotification('kitchen_alert')
            onTestKitchenNotification?.()
          }}
          disabled={isPlaying}
          className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.95 }}
        >
          <Volume2 size={16} className="mx-auto mb-1 text-orange-600" />
          <p className="text-xs font-medium text-orange-800">Test Kitchen Alert</p>
        </motion.button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Tests sound + browser notifications
      </div>
    </div>
  )
}