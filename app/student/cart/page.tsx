import { CartView } from "@/components/student/cart-view"
import { StudentNav } from "@/components/student/student-nav"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-background">
      <StudentNav />
      <main className="container mx-auto px-4 py-6">
        <CartView />
      </main>
    </div>
  )
}
