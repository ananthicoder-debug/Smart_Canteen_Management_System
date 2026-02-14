import { OrderTracking } from "@/components/student/order-tracking"
import { StudentNav } from "@/components/student/student-nav"
import { Suspense } from "react"

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-background">
      <StudentNav />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<div>Loading...</div>}>
          <OrderTracking />
        </Suspense>
      </main>
    </div>
  )
}
