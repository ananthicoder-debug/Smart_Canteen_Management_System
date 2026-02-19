"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2 } from "lucide-react"

async function confirmOrderByTransactionId(transactionId: string) {
  const res = await fetch("/api/orders/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ transactionId, paymentMethod: "qr" })
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || "Failed to confirm order")
  }
  return await res.json()
}

export function OrderQRConfirm() {
  const [transactionId, setTransactionId] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await confirmOrderByTransactionId(transactionId)
      setSuccess(true)
      setTransactionId("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-8 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Process Order by Transaction ID</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Enter Transaction ID from QR"
          value={transactionId}
          onChange={e => setTransactionId(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading || !transactionId}>
          {loading ? "Processing..." : "Confirm Order"}
        </Button>
      </form>
      {success && (
        <div className="flex items-center gap-2 text-green-600 mt-4">
          <CheckCircle2 className="w-5 h-5" /> Order processed successfully!
        </div>
      )}
      {error && <div className="text-destructive mt-2 text-sm">{error}</div>}
    </div>
  )
}
