import { MenuManagement } from "@/components/staff/menu-management"
import { StaffNav } from "@/components/staff/staff-nav"

export default function MenuManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaffNav />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Add, edit, and manage your menu items</p>
        </div>
        <MenuManagement />
      </main>
    </div>
  )
}
