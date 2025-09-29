'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  onLoad,
  onError 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          {placeholder || (
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-8 h-8 rounded-full bg-gray-300"
            />
          )}
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          {placeholder || (
            <div className="text-gray-400 text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded"></div>
              <span className="text-xs">Image unavailable</span>
            </div>
          )}
        </div>
      )}

      {/* Loading shimmer effect */}
      {!isLoaded && !hasError && isInView && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  )
}
