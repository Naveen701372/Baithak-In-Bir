'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import InventoryManagement from '@/components/admin/InventoryManagement'
import { withAuth } from '@/contexts/AuthContext'

function InventoryPage() {
  return (
    <AdminLayout title="Inventory Management">
      <InventoryManagement />
    </AdminLayout>
  )
}

export default withAuth(InventoryPage, 'inventory')