import { AnalyticsDashboard } from "@/components/staff/analytics-dashboard"
import { StaffNav } from "@/components/staff/staff-nav"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaffNav />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">View sales trends and demand analysis</p>
        </div>
        <AnalyticsDashboard />
      </main>
    </div>
  )
}
