"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Receipt } from "lucide-react"
import type { Order } from "@/lib/types"
import { fetchOrders } from "@/lib/api"

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchOrders()
      .then((items) => {
        if (isMounted) setOrders(items.slice().reverse())
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load orders")
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-muted-foreground">Your order history will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">₹{order.total}</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {order.status === "pending" || order.status === "preparing" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Estimated time: {order.estimatedTime} minutes</span>
            </div>
          ) : null}
        </div>
      ))}
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
