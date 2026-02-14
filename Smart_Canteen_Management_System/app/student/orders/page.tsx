import { OrderHistory } from "@/components/student/order-history"
import { StudentNav } from "@/components/student/student-nav"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <StudentNav />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Order History</h1>
          <p className="text-muted-foreground">View your past orders and receipts</p>
        </div>
        <OrderHistory />
      </main>
    </div>
  )
}
