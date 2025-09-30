'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface BrandingColors {
    primary: string
    secondary: string
    accent: string
    text: string
}

interface BrandingData {
    name: string
    logo?: string
    tagline?: string
    display: 'logo' | 'text' | 'both'
    colors: BrandingColors
}

interface BrandingContextType {
    branding: BrandingData
    loading: boolean
    error: string | null
    refreshBranding: () => void
}

const defaultBranding: BrandingData = {
    name: 'Baithak In Bir',
    display: 'both',
    colors: {
        primary: '#14b8a6', // teal-500
        secondary: '#0f766e', // teal-600
        accent: '#f0fdfa', // teal-50
        text: '#111827', // gray-900
    }
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<BrandingData>(defaultBranding)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)

    // Ensure we're on the client side before making API calls
    useEffect(() => {
        setIsClient(true)
    }, [])

    const fetchBranding = async () => {
        if (typeof window === 'undefined') {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/restaurant-settings')

            if (!response.ok) {
                throw new Error('Failed to fetch restaurant settings')
            }

            const settings = await response.json()

            if (settings) {
                setBranding({
                    name: settings.restaurant_name || defaultBranding.name,
                    logo: settings.logo_url,
                    tagline: settings.tagline,
                    display: settings.branding_display || defaultBranding.display,
                    colors: {
                        primary: settings.primary_color || defaultBranding.colors.primary,
                        secondary: settings.secondary_color || defaultBranding.colors.secondary,
                        accent: settings.accent_color || defaultBranding.colors.accent,
                        text: settings.text_color || defaultBranding.colors.text,
                    }
                })
            }
        } catch (err) {
            console.error('Error fetching branding:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
            // Keep default branding on error
            setBranding(defaultBranding)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isClient) {
            fetchBranding()
        }
    }, [isClient])

    const value: BrandingContextType = {
        branding,
        loading,
        error,
        refreshBranding: fetchBranding,
    }

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    )
}

export function useBranding() {
    const context = useContext(BrandingContext)
    if (context === undefined) {
        throw new Error('useBranding must be used within a BrandingProvider')
    }
    return context
}

// CSS variable injection hook for theming
export function useBrandingStyles() {
    const { branding } = useBranding()

    useEffect(() => {
        // Only manipulate DOM on the client side
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return
        }

        const root = document.documentElement

        // Inject CSS custom properties
        root.style.setProperty('--brand-primary', branding.colors.primary)
        root.style.setProperty('--brand-secondary', branding.colors.secondary)
        root.style.setProperty('--brand-accent', branding.colors.accent)
        root.style.setProperty('--brand-text', branding.colors.text)

        // Cleanup function
        return () => {
            if (typeof document !== 'undefined') {
                root.style.removeProperty('--brand-primary')
                root.style.removeProperty('--brand-secondary')
                root.style.removeProperty('--brand-accent')
                root.style.removeProperty('--brand-text')
            }
        }
    }, [branding.colors])

    return branding
}
