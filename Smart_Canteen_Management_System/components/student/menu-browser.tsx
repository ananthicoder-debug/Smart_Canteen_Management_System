"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Clock } from "lucide-react"
import { useCart } from "@/lib/hooks/use-cart"
import { fetchMenuItems } from "@/lib/api"
import type { MenuItem } from "@/lib/types"

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"]

export function MenuBrowser() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const { addItem } = useCart()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchMenuItems()
      .then((items) => {
        if (isMounted) setMenuItems(items)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load menu")
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
      return matchesSearch && matchesCategory && item.available
    })
  }, [menuItems, searchQuery, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for food items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glassy-input h-12 pl-10 text-base"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap transition-all duration-300"
          >
            {category}
          </Button>
        ))}
      </div>

      {error && (
        <div className="text-center py-4 text-sm text-destructive">{error}</div>
      )}

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="glass-card p-4 animate-pulse">
                <div className="aspect-video bg-muted rounded-md mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))
          : filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={addItem} />
            ))}
      </div>

      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found matching your search.</p>
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem) => void }) {
  return (
    <div className="glass-card overflow-hidden hover-lift transition-colors fade-in">
      <div className="aspect-video bg-muted relative">
        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
        {!item.available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <Badge variant="outline" className="mt-1 text-xs">
              {item.category}
            </Badge>
          </div>
          <div className="text-lg font-bold text-primary">₹{item.price}</div>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Stock: {item.quantity ?? 0}
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{item.prepTime} min</span>
          </div>

          <Button size="sm" onClick={() => onAddToCart(item)} disabled={!item.available} className="transition-all">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
