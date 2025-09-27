'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import InventoryManagement from '@/components/admin/InventoryManagement'

export default function InventoryPage() {
  return (
    <AdminLayout title="Inventory Management">
      <InventoryManagement />
    </AdminLayout>
  )
}