import { motion } from 'framer-motion'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  error?: string | null
}

export default function ConnectionStatus({ isConnected, error }: ConnectionStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed bottom-4 right-4 z-40 px-3 py-2 rounded-lg shadow-lg border flex items-center space-x-2 text-sm font-medium ${
        isConnected
          ? 'bg-green-50 text-green-700 border-green-200'
          : error
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
      }`}
    >
      {isConnected ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Wifi size={16} />
          </motion.div>
          <span>Real-time connected</span>
        </>
      ) : error ? (
        <>
          <AlertCircle size={16} />
          <span>Connection error</span>
        </>
      ) : (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <WifiOff size={16} />
          </motion.div>
          <span>Connecting...</span>
        </>
      )}
    </motion.div>
  )
}