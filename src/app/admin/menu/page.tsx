'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import MenuManagement from '@/components/admin/MenuManagement'

export default function MenuPage() {
  return (
    <AdminLayout title="Menu Management">
      <MenuManagement />
    </AdminLayout>
  )
}