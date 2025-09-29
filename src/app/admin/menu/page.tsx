'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import MenuManagement from '@/components/admin/MenuManagement'
import { withAuth } from '@/contexts/AuthContext'

function MenuPage() {
  return (
    <AdminLayout title="Menu Management">
      <MenuManagement />
    </AdminLayout>
  )
}

export default withAuth(MenuPage, 'menu')