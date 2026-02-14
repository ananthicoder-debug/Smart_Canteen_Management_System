import { StaffDashboard } from "@/components/staff/staff-dashboard"
import { StaffNav } from "@/components/staff/staff-nav"

export default function StaffDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaffNav />
      <main className="container mx-auto px-4 py-6">
        <StaffDashboard />
      </main>
    </div>
  )
}
