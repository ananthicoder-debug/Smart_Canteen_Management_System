"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, ChefHat, Package, XCircle } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/lib/types"
import { fetchOrder } from "@/lib/api"

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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return

    let isMounted = true
    const loadOrder = () => {
      fetchOrder(orderId)
        .then((data) => {
          if (!isMounted) return
          setOrder(data)
          const statusProgression = ["pending", "preparing", "ready", "completed"]
          const step = statusProgression.indexOf(data.status)
          setCurrentStep(step >= 0 ? step : 0)
        })
        .catch((err) => {
          if (!isMounted) return
          setError(err.message || "Failed to load order")
        })
    }

    loadOrder()
    const interval = setInterval(loadOrder, 8000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [orderId])

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Unable to load order</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/student/menu">Back to Menu</Link>
          </Button>
        </div>
      </div>
    )
  }

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
        {order.transactionId && (
          <div className="mt-2 text-sm font-mono">
            Transaction ID: <span className="bg-muted px-2 py-1 rounded">{order.transactionId}</span>
          </div>
        )}
        {order.payment && (
          <div className="mt-1 text-xs">
            Payment Status: <span className="font-semibold">{order.payment.status}</span>
            {order.payment.method && (
              <span className="ml-2">({order.payment.method})</span>
            )}
          </div>
        )}
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
