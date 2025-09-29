export type BrandingDisplay = 'logo' | 'text' | 'both'

export interface RestaurantSettings {
    id: string
    restaurant_name: string
    logo_url?: string
    tagline?: string
    branding_display: BrandingDisplay
    primary_color: string
    secondary_color: string
    accent_color: string
    text_color: string
    phone?: string
    email?: string
    address?: string
    operating_hours?: Record<string, any>
    currency: string
    timezone: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface RestaurantSettingsUpdate {
    restaurant_name?: string
    logo_url?: string
    tagline?: string
    branding_display?: BrandingDisplay
    primary_color?: string
    secondary_color?: string
    accent_color?: string
    text_color?: string
    phone?: string
    email?: string
    address?: string
    operating_hours?: Record<string, any>
    currency?: string
    timezone?: string
}
