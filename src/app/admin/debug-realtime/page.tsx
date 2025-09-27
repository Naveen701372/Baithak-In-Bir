'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAuth } from '@/contexts/AuthContext'

function DebugRealtimePage() {
  const [events, setEvents] = useState<any[]>([])
  const [sseEvents, setSseEvents] = useState<any[]>([])
  const [sseConnected, setSseConnected] = useState(false)
  const [supabaseConnected, setSupabaseConnected] = useState(false)

  useEffect(() => {
    // Test Supabase real-time directly
    console.log('Setting up Supabase real-time test...')
    
    const channel = supabase
      .channel('debug-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Supabase real-time event:', payload)
          setEvents(prev => [...prev, { 
            timestamp: new Date().toISOString(), 
            type: 'supabase',
            ...payload 
          }])
        }
      )
      .subscribe((status) => {
        console.log('Supabase subscription status:', status)
        setSupabaseConnected(status === 'SUBSCRIBED')
      })

    // Test SSE connection
    console.log('Setting up SSE test...')
    const eventSource = new EventSource('/api/orders/realtime')
    
    eventSource.onopen = () => {
      console.log('SSE connection opened')
      setSseConnected(true)
    }
    
    eventSource.onmessage = (event) => {
      console.log('SSE event received:', event.data)
      try {
        const data = JSON.parse(event.data)
        setSseEvents(prev => [...prev, { 
          timestamp: new Date().toISOString(), 
          type: 'sse',
          ...data 
        }])
      } catch (error) {
        console.error('Error parsing SSE event:', error)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      setSseConnected(false)
    }

    return () => {
      supabase.removeChannel(channel)
      eventSource.close()
    }
  }, [])

  const testOrderCreation = async () => {
    try {
      console.log('Creating test order...')
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: `Debug Test ${Date.now()}`,
          customer_phone: '+91' + Math.floor(Math.random() * 9000000000 + 1000000000),
          total_amount: 299,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      console.log('Test order created:', data)
      alert('Test order created! Check the events below.')
    } catch (error) {
      console.error('Error creating test order:', error)
      alert('Error creating test order: ' + (error as Error).message)
    }
  }

  return (
    <AdminLayout title="Real-time Debug">
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${supabaseConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <h3 className="font-medium">Supabase Real-time</h3>
              <p className={`text-sm ${supabaseConnected ? 'text-green-700' : 'text-red-700'}`}>
                {supabaseConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${sseConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
              <h3 className="font-medium">Server-Sent Events</h3>
              <p className={`text-sm ${sseConnected ? 'text-green-700' : 'text-red-700'}`}>
                {sseConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Test Real-time</h2>
          <button
            onClick={testOrderCreation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Test Order
          </button>
          <p className="text-sm text-gray-600 mt-2">
            This will create a test order and you should see events appear below if real-time is working.
          </p>
        </div>

        {/* Supabase Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Supabase Real-time Events ({events.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm">No Supabase events received yet...</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{event.timestamp}</div>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SSE Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Server-Sent Events ({sseEvents.length})</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sseEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No SSE events received yet...</p>
            ) : (
              sseEvents.map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{event.timestamp}</div>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-yellow-800">Supabase Setup Instructions</h2>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>If you see "Disconnected" above, follow these steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to Settings → API</li>
              <li>Scroll down to "Realtime" section</li>
              <li>Enable realtime for the "orders" and "order_items" tables</li>
              <li>Save the changes</li>
              <li>Refresh this page and test again</li>
            </ol>
            <p className="mt-4"><strong>Alternative method:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to Database → Replication</li>
              <li>Enable replication for "orders" and "order_items" tables</li>
              <li>Make sure "Realtime" is enabled in the publication</li>
            </ol>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default withAuth(DebugRealtimePage, 'orders')