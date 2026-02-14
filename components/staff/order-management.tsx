"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ChefHat, Package, CheckCircle2 } from "lucide-react"
import type { Order } from "@/lib/types"

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    const loadOrders = () => {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      setOrders(storedOrders)
    }

    loadOrders()
    const interval = setInterval(loadOrders, 2000)

    return () => clearInterval(interval)
  }, [])

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))

    localStorage.setItem("orders", JSON.stringify(updatedOrders))
    setOrders(updatedOrders)
  }

  const filterOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Pending ({filterOrdersByStatus("pending").length})
        </TabsTrigger>
        <TabsTrigger value="preparing" className="flex items-center gap-2">
          <ChefHat className="w-4 h-4" />
          Preparing ({filterOrdersByStatus("preparing").length})
        </TabsTrigger>
        <TabsTrigger value="ready" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Ready ({filterOrdersByStatus("ready").length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Completed ({filterOrdersByStatus("completed").length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        <OrderList
          orders={filterOrdersByStatus("pending")}
          onUpdateStatus={updateOrderStatus}
          nextStatus="preparing"
          actionLabel="Start Preparing"
        />
      </TabsContent>

      <TabsContent value="preparing" className="space-y-4">
        <OrderList
          orders={filterOrdersByStatus("preparing")}
          onUpdateStatus={updateOrderStatus}
          nextStatus="ready"
          actionLabel="Mark as Ready"
        />
      </TabsContent>

      <TabsContent value="ready" className="space-y-4">
        <OrderList
          orders={filterOrdersByStatus("ready")}
          onUpdateStatus={updateOrderStatus}
          nextStatus="completed"
          actionLabel="Mark as Completed"
        />
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        <OrderList orders={filterOrdersByStatus("completed")} onUpdateStatus={updateOrderStatus} />
      </TabsContent>
    </Tabs>
  )
}

function OrderList({
  orders,
  onUpdateStatus,
  nextStatus,
  actionLabel,
}: {
  orders: Order[]
  onUpdateStatus: (orderId: string, status: Order["status"]) => void
  nextStatus?: Order["status"]
  actionLabel?: string
}) {
  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">No orders in this status</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">Order #{order.id}</h3>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Placed at {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">₹{order.total}</div>
              {order.estimatedTime && <p className="text-sm text-muted-foreground mt-1">{order.estimatedTime} min</p>}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Order Items:</h4>
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {nextStatus && actionLabel && (
            <Button className="w-full" onClick={() => onUpdateStatus(order.id, nextStatus)}>
              {actionLabel}
            </Button>
          )}
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
