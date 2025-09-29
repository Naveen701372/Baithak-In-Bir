import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('restaurant_settings')
            .select('*')
            .eq('is_active', true)
            .single()

        if (error) {
            console.error('Error fetching restaurant settings:', error)
            return NextResponse.json({ error: 'Failed to fetch restaurant settings' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in GET /api/restaurant-settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            restaurant_name,
            logo_url,
            tagline,
            branding_display,
            primary_color,
            secondary_color,
            accent_color,
            text_color,
            phone,
            email,
            address,
            operating_hours,
            currency,
            timezone
        } = body

        // First, get the current settings
        const { data: currentSettings, error: fetchError } = await supabase
            .from('restaurant_settings')
            .select('id')
            .eq('is_active', true)
            .single()

        if (fetchError || !currentSettings) {
            console.error('Error fetching current settings:', fetchError)
            return NextResponse.json({ error: 'Restaurant settings not found' }, { status: 404 })
        }

        // Update the settings
        const { data, error } = await supabase
            .from('restaurant_settings')
            .update({
                restaurant_name,
                logo_url,
                tagline,
                branding_display,
                primary_color,
                secondary_color,
                accent_color,
                text_color,
                phone,
                email,
                address,
                operating_hours,
                currency,
                timezone,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentSettings.id)
            .eq('is_active', true)
            .select()
            .single()

        if (error) {
            console.error('Error updating restaurant settings:', error)
            return NextResponse.json({ error: 'Failed to update restaurant settings' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in PUT /api/restaurant-settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
