"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Package, TrendingDown, TrendingUp } from "lucide-react"
import type { MenuItem } from "@/lib/types"
import { fetchInventory, updateInventory } from "@/lib/api"

interface InventoryItem extends MenuItem {
  stockLevel: number
  lowStockThreshold: number
}

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchInventory()
      .then((items) => {
        if (!isMounted) return
        const mapped = items.map((inv: any) => ({
          id: inv.item?._id || inv.item?.id || inv._id,
          name: inv.item?.name || "",
          description: inv.item?.description || "",
          price: inv.item?.price || 0,
          category: inv.item?.category || "Other",
          image: inv.item?.image || "",
          available: inv.item?.available ?? true,
          prepTime: inv.item?.prepTime ?? 10,
          canteenId: inv.item?.canteenId || "canteen-1",
          stockLevel: inv.quantity ?? 0,
          lowStockThreshold: 20,
        }))
        setInventory(mapped)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load inventory")
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const updateStock = async (itemId: string, newStock: number) => {
    try {
      await updateInventory(itemId, newStock)
      setInventory((prev) => prev.map((item) => (item.id === itemId ? { ...item, stockLevel: newStock } : item)))
    } catch (err: any) {
      setError(err.message || "Failed to update stock")
    }
  }

  const lowStockItems = inventory.filter((item) => item.stockLevel <= item.lowStockThreshold)
  const outOfStockItems = inventory.filter((item) => item.stockLevel === 0)

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && <div className="text-sm text-destructive text-center">{error}</div>}

      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="space-y-3">
          {outOfStockItems.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Out of Stock Items</h3>
                <p className="text-sm text-muted-foreground">
                  {outOfStockItems.length} item(s) are out of stock: {outOfStockItems.map((i) => i.name).join(", ")}
                </p>
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary mb-1">Low Stock Alert</h3>
                <p className="text-sm text-muted-foreground">{lowStockItems.length} item(s) are running low on stock</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Item</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-center p-4 font-semibold">Stock Level</th>
                <th className="text-center p-4 font-semibold">Status</th>
                <th className="text-center p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-6 text-center" colSpan={5}>
                    <span className="text-sm text-muted-foreground">Loading inventory...</span>
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-muted-foreground">₹{item.price}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{item.category}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{item.stockLevel}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {item.stockLevel === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : item.stockLevel <= item.lowStockThreshold ? (
                        <Badge variant="outline" className="border-primary text-primary">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary">In Stock</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStock(item.id, Math.max(0, item.stockLevel - 10))}
                        >
                          <TrendingDown className="w-3 h-3 mr-1" />
                          -10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStock(item.id, item.stockLevel + 10)}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +10
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
