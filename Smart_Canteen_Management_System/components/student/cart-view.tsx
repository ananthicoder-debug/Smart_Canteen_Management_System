"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingBag, Info } from "lucide-react"
import { useCart } from "@/lib/hooks/use-cart"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { createOrder } from "@/lib/api"
import QRCode from "react-qr-code"

export function CartView() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [enteredTransactionId, setEnteredTransactionId] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [verificationAttempted, setVerificationAttempted] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      const res = await createOrder(
        items.map((item) => ({ menuItem: item.id, qty: item.quantity })),
      )
      clearCart()
      setTransactionId(res.transactionId)
      setOrderId(res.orderId)
    } catch (err: any) {
      setError(err.message || "Failed to place order")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyPayment = () => {
    setVerificationAttempted(true)
    setVerificationError(null)

    // Simple verification: check if entered ID matches the generated transaction ID
    if (enteredTransactionId.trim() === transactionId) {
      setIsVerified(true)
      setVerificationError(null)
    } else {
      setVerificationError("Transaction ID does not match. Please verify and try again.")
    }
  }

  if (transactionId && orderId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* QR Code Section */}
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-muted-foreground mb-6">Scan the QR code at the counter to receive your order</p>
          
          <div className="bg-background rounded-lg p-6 inline-block mb-4">
            <QRCode value={transactionId} size={160} />
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Transaction ID:</p>
            <div className="font-mono text-lg bg-muted p-3 rounded border border-border break-all">
              {transactionId}
            </div>
          </div>
        </div>

        {/* Payment Verification Section */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Payment Verification Required</p>
              <p className="text-blue-800 dark:text-blue-200 text-xs">
                In production, this would use Razorpay for secure online payments. For this prototype, please verify your transaction ID below to confirm payment.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Enter your Transaction ID to verify payment:</label>
              <input
                type="text"
                value={enteredTransactionId}
                onChange={(e) => setEnteredTransactionId(e.target.value)}
                placeholder="Enter or paste the transaction ID here"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              />
            </div>

            {verificationError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {verificationError}
              </div>
            )}

            {isVerified && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-700 dark:text-green-200">
                ✓ Payment verified successfully! Your order has been confirmed.
              </div>
            )}

            <Button
              onClick={handleVerifyPayment}
              disabled={!enteredTransactionId.trim() || isVerified}
              className="w-full"
              variant={isVerified ? "secondary" : "default"}
            >
              {isVerified ? "Payment Verified" : "Verify Payment"}
            </Button>
          </div>
        </div>

        {/* Track Order Button */}
        <Button
          asChild
          className="w-full"
          disabled={!isVerified}
          size="lg"
          variant={isVerified ? "default" : "outline"}
        >
          <Link href={`/student/order-tracking?orderId=${orderId}`}>
            {isVerified ? "Track Your Order" : "Verify Payment to Continue"}
          </Link>
        </Button>
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some delicious items from the menu</p>
          <Button asChild>
            <Link href="/student/menu">Browse Menu</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex gap-4">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-lg font-bold">₹{item.price * item.quantity}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{getTotal()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">₹{getTotal()}</span>
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-center text-destructive mb-2">{error}</p>}
            <Button className="w-full h-12 text-base" onClick={handleCheckout} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">Digital payment will be processed securely</p>
          </div>
        </div>
      </div>
    </div>
  )
}
