import { motion } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'

interface RealtimeStatusIndicatorProps {
  isConnected: boolean
}

export default function RealtimeStatusIndicator({ isConnected }: RealtimeStatusIndicatorProps) {
  return (
    <div className="flex items-center">
      <motion.div
        animate={isConnected ? { scale: [1, 1.1, 1] } : { opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-2 h-2 rounded-full mr-2 ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      {isConnected ? (
        <Wifi size={14} className="text-green-600" />
      ) : (
        <WifiOff size={14} className="text-red-600" />
      )}
    </div>
  )
}