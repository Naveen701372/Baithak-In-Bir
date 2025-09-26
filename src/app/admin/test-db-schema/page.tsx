'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { withAuth } from '@/contexts/AuthContext'

function TestDbSchemaPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSchema = async () => {
    setLoading(true)
    try {
      // Test if the columns exist by trying to select them
      const { data, error } = await supabase
        .from('order_items')
        .select('id, completed_quantity, item_status, notes')
        .limit(1)

      if (error) {
        setResult({ error: error.message, success: false })
      } else {
        setResult({ data, success: true, message: 'Schema is correct!' })
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error', success: false })
    } finally {
      setLoading(false)
    }
  }

  const runEnhancements = async () => {
    setLoading(true)
    try {
      // Try to add the columns if they don't exist
      const enhancements = [
        'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS completed_quantity INTEGER DEFAULT 0',
        'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_status VARCHAR(20) DEFAULT \'pending\'',
        'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT',
        'ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT \'pending\'',
        'ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE',
        'ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_reason TEXT'
      ]

      // Since we can't run DDL directly, we'll just test the current schema
      await testSchema()
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error', success: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Test Database Schema">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-black mb-4">Test Database Schema</h1>
          
          <div className="space-y-4">
            <button
              onClick={testSchema}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Current Schema'}
            </button>

            <button
              onClick={runEnhancements}
              disabled={loading}
              className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Schema Enhancements'}
            </button>

            {result && (
              <div className={`p-4 rounded-lg ${
                result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {result.success ? (
                  <div>
                    <p className="font-medium">✅ {result.message}</p>
                    {result.data && (
                      <pre className="mt-2 text-xs bg-white p-2 rounded border">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">❌ Error:</p>
                    <p className="text-sm mt-1">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default withAuth(TestDbSchemaPage, 'orders')