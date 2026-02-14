import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Utensils, Clock, Bell, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl">
            <h1 className="font-sans text-5xl md:text-7xl font-bold tracking-tight text-balance mb-6">
              Smart food service for modern campuses.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
              Order ahead, skip the line, and enjoy your meal. A complete platform for students and staff to manage
              campus dining efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base">
                <Link href="/student/login">Student Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
                <Link href="/staff/login">Staff Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Utensils className="w-6 h-6" />}
            title="Browse Menu"
            description="Search and explore available food items with real-time availability."
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Pre-Order"
            description="Order ahead and skip the waiting line during peak hours."
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6" />}
            title="Live Tracking"
            description="Get real-time notifications about your order status."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Analytics"
            description="Staff can view sales trends and manage inventory efficiently."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard value="50%" label="Faster service" sublabel="Reduced wait times" />
            <StatCard value="100%" label="Digital" sublabel="Paperless receipts" />
            <StatCard value="24/7" label="Available" sublabel="Order anytime" />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-sans text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function StatCard({ value, label, sublabel }: { value: string; label: string; sublabel: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-4xl md:text-5xl font-bold mb-2">{value}</div>
      <div className="text-lg font-medium mb-1">{label}</div>
      <div className="text-sm text-muted-foreground">{sublabel}</div>
    </div>
  )
}
