import { OrderManagement } from "@/components/staff/order-management"
import { StaffNav } from "@/components/staff/staff-nav"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaffNav />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-muted-foreground">Monitor and process incoming orders</p>
        </div>
        <OrderManagement />
      </main>
    </div>
  )
}
