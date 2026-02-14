"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, ChefHat, Package, XCircle } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/lib/types"

const orderSteps = [
  { status: "pending", label: "Order Placed", icon: CheckCircle2 },
  { status: "preparing", label: "Being Prepared", icon: ChefHat },
  { status: "ready", label: "Ready for Pickup", icon: Package },
  { status: "completed", label: "Completed", icon: CheckCircle2 },
]

export function OrderTracking() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<Order | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!orderId) return

    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    const foundOrder = orders.find((o: Order) => o.id === orderId)

    if (foundOrder) {
      setOrder(foundOrder)

      // Simulate real-time status updates
      const statusProgression = ["pending", "preparing", "ready", "completed"]
      let step = statusProgression.indexOf(foundOrder.status)

      const interval = setInterval(() => {
        if (step < statusProgression.length - 1) {
          step++
          const newStatus = statusProgression[step]

          setOrder((prev) => (prev ? { ...prev, status: newStatus as Order["status"] } : null))
          setCurrentStep(step)

          // Update in localStorage
          const updatedOrders = orders.map((o: Order) => (o.id === orderId ? { ...o, status: newStatus } : o))
          localStorage.setItem("orders", JSON.stringify(updatedOrders))

          // Show notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Order Update", {
              body: `Your order is now ${newStatus}`,
              icon: "/favicon.ico",
            })
          }
        } else {
          clearInterval(interval)
        }
      }, 8000) // Update every 8 seconds for demo

      return () => clearInterval(interval)
    }
  }, [orderId])

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Order not found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for</p>
          <Button asChild>
            <Link href="/student/menu">Back to Menu</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">Order #{order.id}</p>
      </div>

      {/* Order Status Timeline */}
      <div className="bg-card border border-border rounded-xl p-8 mb-6">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-border" />
          <div
            className="absolute left-6 top-12 w-0.5 bg-primary transition-all duration-500"
            style={{ height: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
          />

          {/* Steps */}
          <div className="space-y-8">
            {orderSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index <= currentStep
              const isCurrent = index === currentStep

              return (
                <div key={step.status} className="relative flex items-center gap-4">
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </h3>
                      {isCurrent && <Badge>Current</Badge>}
                    </div>
                    {isCurrent && order.status !== "completed" && (
                      <p className="text-sm text-muted-foreground mt-1">Estimated time: {order.estimatedTime} min</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Order Details</h2>

        <div className="space-y-3 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Estimated Time Card */}
      {order.status !== "completed" && order.status !== "cancelled" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-1">Your food will be ready soon!</h3>
          <p className="text-muted-foreground">Estimated time: {order.estimatedTime} minutes</p>
        </div>
      )}

      {order.status === "completed" && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-secondary" />
          <h3 className="text-lg font-semibold mb-1">Order Completed!</h3>
          <p className="text-muted-foreground mb-4">Thank you for your order. Enjoy your meal!</p>
          <Button asChild>
            <Link href="/student/menu">Order Again</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
