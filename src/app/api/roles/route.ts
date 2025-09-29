import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Get all roles with user counts
export async function GET() {
    try {
        const { data: roles, error } = await supabaseAdmin
            .from('role_stats')
            .select('*')
            .order('name')

        if (error) {
            console.error('Failed to fetch roles:', error)
            return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
        }

        return NextResponse.json(roles)
    } catch (error) {
        console.error('Roles API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Update role permissions
export async function PUT(request: NextRequest) {
    try {
        const { id, permissions, description } = await request.json()

        if (!id || !permissions) {
            return NextResponse.json({ error: 'Role ID and permissions are required' }, { status: 400 })
        }

        const { data: role, error } = await supabaseAdmin
            .from('roles')
            .update({
                permissions,
                description,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Failed to update role:', error)
            return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
        }

        return NextResponse.json(role)
    } catch (error) {
        console.error('Role update API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
