import { useState, useEffect } from 'react'

export interface Role {
    id: string
    name: string
    description: string
    permissions: {
        dashboard: boolean
        orders: boolean
        menu: boolean
        inventory: boolean
        analytics: boolean
        users: boolean
        settings: boolean
    }
    user_count: number
    is_system: boolean
}

export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchRoles = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/roles')

            if (!response.ok) {
                throw new Error('Failed to fetch roles')
            }

            const data = await response.json()
            setRoles(data)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch roles:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch roles')
        } finally {
            setLoading(false)
        }
    }

    const updateRole = async (id: string, permissions: any, description?: string) => {
        try {
            const response = await fetch('/api/roles', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, permissions, description }),
            })

            if (!response.ok) {
                throw new Error('Failed to update role')
            }

            // Refresh roles after update
            await fetchRoles()
            return true
        } catch (err) {
            console.error('Failed to update role:', err)
            setError(err instanceof Error ? err.message : 'Failed to update role')
            return false
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    return {
        roles,
        loading,
        error,
        fetchRoles,
        updateRole,
    }
}
