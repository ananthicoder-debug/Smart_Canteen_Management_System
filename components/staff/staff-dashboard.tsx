"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import type { Order } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    todayRevenue: 0,
  })

  useEffect(() => {
    const loadOrders = () => {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      setOrders(storedOrders)

      // Calculate stats
      const pending = storedOrders.filter((o: Order) => o.status === "pending").length
      const preparing = storedOrders.filter((o: Order) => o.status === "preparing").length
      const ready = storedOrders.filter((o: Order) => o.status === "ready").length
      const completed = storedOrders.filter((o: Order) => o.status === "completed").length

      const today = new Date().toDateString()
      const todayRevenue = storedOrders
        .filter((o: Order) => new Date(o.createdAt).toDateString() === today)
        .reduce((sum: number, o: Order) => sum + o.total, 0)

      setStats({ pending, preparing, ready, completed, todayRevenue })
    }

    loadOrders()
    const interval = setInterval(loadOrders, 2000) // Refresh every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your canteen operations in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Orders" value={stats.pending} color="orange" />
        <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Preparing" value={stats.preparing} color="blue" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Ready" value={stats.ready} color="green" />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Today's Revenue"
          value={`₹${stats.todayRevenue}`}
          color="primary"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/staff/orders">View All</Link>
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">Order #{order.id}</span>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} items • {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-lg font-bold">₹{order.total}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "secondary"
    case "cancelled":
      return "destructive"
    case "preparing":
      return "default"
    default:
      return "outline"
  }
}
