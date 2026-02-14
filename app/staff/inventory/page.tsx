import { InventoryManagement } from "@/components/staff/inventory-management"
import { StaffNav } from "@/components/staff/staff-nav"

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaffNav />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track and update stock levels</p>
        </div>
        <InventoryManagement />
      </main>
    </div>
  )
}
