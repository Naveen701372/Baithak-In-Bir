'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAuthPage() {
    const [users, setUsers] = useState<any[]>([])
    const [sessions, setSessions] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // Check custom user_profiles table
                const { data: customUsers, error: customError } = await supabase
                    .from('user_profiles')
                    .select('*')

                if (customError) {
                    console.error('Custom users error:', customError)
                } else {
                    setUsers(customUsers || [])
                }

                // Check user_sessions table
                const { data: sessionsData, error: sessionsError } = await supabase
                    .from('user_sessions')
                    .select('*')

                if (sessionsError) {
                    console.error('Sessions error:', sessionsError)
                } else {
                    setSessions(sessionsData || [])
                }

                // Get current auth user (this works from client side)
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (userError) {
                    console.error('Current user error:', userError)
                } else {
                    setCurrentUser(user)
                }

            } catch (error) {
                console.error('Debug error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const createTestUser = async () => {
        try {
            // First, try to sign in to get the user ID
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: 'baithakinbir@gmail.com',
                password: 'admin123'
            })

            if (signInError) {
                alert(`Cannot sign in: ${signInError.message}. Please make sure you created the user in Supabase Auth with email: baithakinbir@gmail.com and password: admin123`)
                return
            }

            const authUserId = signInData.user.id

            // Insert into custom user_profiles table with correct ID
            const { data, error } = await supabase
                .from('user_profiles')
                .insert({
                    id: authUserId, // Use the actual Supabase Auth ID
                    email: 'baithakinbir@gmail.com',
                    role: 'owner',
                    permissions: {
                        dashboard: true,
                        orders: true,
                        menu: true,
                        inventory: true,
                        analytics: true,
                        users: true,
                        settings: true
                    },
                    is_active: true
                })
                .select()

            if (error) {
                console.error('Insert error:', error)
                alert(`Error: ${error.message}`)
            } else {
                alert('User created successfully! You can now login.')
                window.location.reload()
            }
        } catch (error) {
            console.error('Create user error:', error)
            alert(`Error: ${error}`)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">User Profiles Table ({users.length})</h2>
                    {users.length === 0 ? (
                        <p className="text-gray-500">No users found in user_profiles table</p>
                    ) : (
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="p-2 bg-gray-50 rounded">
                                    <p><strong>ID:</strong> {user.id}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Role:</strong> {user.role}</p>
                                    <p><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Current Auth User</h2>
                    {!currentUser ? (
                        <p className="text-gray-500">No user currently signed in</p>
                    ) : (
                        <div className="p-2 bg-gray-50 rounded">
                            <p><strong>ID:</strong> {currentUser.id}</p>
                            <p><strong>Email:</strong> {currentUser.email}</p>
                            <p><strong>Created:</strong> {new Date(currentUser.created_at).toLocaleDateString()}</p>
                            <p><strong>Confirmed:</strong> {currentUser.email_confirmed_at ? 'Yes' : 'No'}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">User Sessions ({sessions.length})</h2>
                    {sessions.length === 0 ? (
                        <p className="text-gray-500">No active sessions</p>
                    ) : (
                        <div className="space-y-2">
                            {sessions.map(session => (
                                <div key={session.id} className="p-2 bg-gray-50 rounded">
                                    <p><strong>User ID:</strong> {session.user_id}</p>
                                    <p><strong>Token:</strong> {session.session_token.substring(0, 20)}...</p>
                                    <p><strong>Expires:</strong> {new Date(session.expires_at).toLocaleString()}</p>
                                    <p><strong>Created:</strong> {new Date(session.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 space-x-4">
                <button
                    onClick={createTestUser}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Create Test User (Match Auth ID)
                </button>
                <button
                    onClick={async () => {
                        try {
                            const { error } = await supabase
                                .from('user_sessions')
                                .delete()
                                .neq('id', 'dummy') // Delete all sessions
                            
                            if (error) {
                                alert(`Error: ${error.message}`)
                            } else {
                                alert('All sessions cleared!')
                                window.location.reload()
                            }
                        } catch (error) {
                            alert(`Error: ${error}`)
                        }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Clear All Sessions
                </button>
                <button
                    onClick={() => {
                        alert('Run this SQL in your Supabase SQL Editor:\n\n' +
                              '-- Fix foreign key constraint\n' +
                              'ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;\n' +
                              'ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;\n' +
                              'DELETE FROM user_sessions WHERE user_id NOT IN (SELECT id FROM user_profiles);')
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                    Show Fix SQL
                </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li><strong>First:</strong> Create user in Supabase Dashboard → Authentication → Users</li>
                    <li><strong>Email:</strong> baithakinbir@gmail.com</li>
                    <li><strong>Password:</strong> admin123</li>
                    <li><strong>Auto Confirm User:</strong> ✅ Check this box</li>
                    <li><strong>Then:</strong> Click "Create Test User" button below</li>
                    <li><strong>Finally:</strong> Try logging in at /admin/login</li>
                </ol>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Alternative Manual Fix:</h3>
                <p className="text-sm mb-2">If the button doesn't work, run this SQL in Supabase SQL Editor:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs">
                    {`-- First get your auth user ID:
SELECT id, email FROM auth.users WHERE email = 'baithakinbir@gmail.com';

-- Then insert into user_profiles table (replace YOUR_ID with the actual ID):
INSERT INTO user_profiles (id, email, role, permissions, is_active) 
VALUES ('YOUR_ID_HERE', 'baithakinbir@gmail.com', 'owner', 
'{"dashboard": true, "orders": true, "menu": true, "inventory": true, "analytics": true, "users": true, "settings": true}', true);`}
                </code>
            </div>
            <div className="mt-4 p-4 bg-red-50 rounded">
                <h3 className="font-semibold mb-2">🚨 Database Issue Detected:</h3>
                <p className="text-sm mb-2">The user_sessions table foreign key is pointing to the wrong table. Run this SQL in Supabase SQL Editor:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs whitespace-pre">
{`-- Fix foreign key constraint
ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Clean up orphaned sessions
DELETE FROM user_sessions WHERE user_id NOT IN (SELECT id FROM user_profiles);`}
                </code>
            </div>
        </div>
    )
}