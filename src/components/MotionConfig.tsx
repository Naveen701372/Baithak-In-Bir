'use client'

import { MotionConfig, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionConfigProviderProps {
    children: ReactNode
}

export function MotionConfigProvider({ children }: MotionConfigProviderProps) {
    const shouldReduceMotion = useReducedMotion()

    return (
        <MotionConfig
            // Reduce motion for better mobile performance and accessibility
            reducedMotion={shouldReduceMotion ? 'always' : 'never'}
            // Set global transition defaults for better mobile performance
            transition={{
                duration: shouldReduceMotion ? 0 : 0.25,
                ease: "easeOut"
            }}
        >
            {children}
        </MotionConfig>
    )
}

// Helper function to create mobile-friendly motion variants
export const createMobileVariants = (shouldReduceMotion: boolean | null) => ({
    // Container animations
    fadeIn: {
        hidden: { opacity: shouldReduceMotion ? 1 : 0 },
        visible: {
            opacity: 1,
            transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }
        }
    },

    slideUp: {
        hidden: {
            opacity: shouldReduceMotion ? 1 : 0,
            y: shouldReduceMotion ? 0 : 20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
        }
    },

    scaleIn: {
        hidden: {
            opacity: shouldReduceMotion ? 1 : 0,
            scale: shouldReduceMotion ? 1 : 0.95
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }
        }
    },

    // Button interactions
    buttonTap: shouldReduceMotion ? {} : { scale: 0.98 },

    // List animations
    listItem: {
        hidden: {
            opacity: shouldReduceMotion ? 1 : 0,
            x: shouldReduceMotion ? 0 : -20
        },
        visible: (index: number) => ({
            opacity: 1,
            x: 0,
            transition: shouldReduceMotion ?
                { duration: 0 } :
                {
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeOut"
                }
        })
    }
})

export default MotionConfigProvider
