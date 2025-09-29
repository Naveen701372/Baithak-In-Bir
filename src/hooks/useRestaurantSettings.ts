import { useState, useEffect } from 'react'
import { RestaurantSettings, RestaurantSettingsUpdate } from '@/types/restaurant'

export function useRestaurantSettings() {
    const [settings, setSettings] = useState<RestaurantSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSettings = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/restaurant-settings')

            if (!response.ok) {
                throw new Error('Failed to fetch restaurant settings')
            }

            const data = await response.json()
            setSettings(data)
        } catch (err) {
            console.error('Error fetching restaurant settings:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (updates: RestaurantSettingsUpdate) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/restaurant-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) {
                throw new Error('Failed to update restaurant settings')
            }

            const updatedSettings = await response.json()
            setSettings(updatedSettings)
            return updatedSettings
        } catch (err) {
            console.error('Error updating restaurant settings:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
            throw err
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    return {
        settings,
        loading,
        error,
        fetchSettings,
        updateSettings,
    }
}

// Hook for getting just the branding data (for customer interface)
export function useRestaurantBranding() {
    const { settings, loading, error } = useRestaurantSettings()

    return {
        branding: settings ? {
            name: settings.restaurant_name,
            logo: settings.logo_url,
            tagline: settings.tagline,
            display: settings.branding_display,
            colors: {
                primary: settings.primary_color,
                secondary: settings.secondary_color,
                accent: settings.accent_color,
                text: settings.text_color,
            }
        } : null,
        loading,
        error
    }
}
