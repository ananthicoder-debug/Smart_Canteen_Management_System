"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import type { MenuItem } from "@/lib/types"
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
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

  const saveMenuItem = async (item: MenuItem) => {
    try {
      if (editingItem) {
        const updated = await updateMenuItem(editingItem.id, item)
        setMenuItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      } else {
        const created = await createMenuItem(item)
        setMenuItems((prev) => [...prev, created])
      }
      setIsDialogOpen(false)
      setEditingItem(null)
    } catch (err: any) {
      setError(err.message || "Failed to save menu item")
    }
  }

  const deleteMenuItemById = async (itemId: string) => {
    try {
      await deleteMenuItem(itemId)
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId))
    } catch (err: any) {
      setError(err.message || "Failed to delete menu item")
    }
  }

  const toggleAvailability = async (itemId: string) => {
    const target = menuItems.find((i) => i.id === itemId)
    if (!target) return
    try {
      const updated = await updateMenuItem(itemId, { available: !target.available })
      setMenuItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)))
    } catch (err: any) {
      setError(err.message || "Failed to update availability")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
              <DialogDescription>Fill in the details for the menu item</DialogDescription>
            </DialogHeader>
            <MenuItemForm item={editingItem} onSave={saveMenuItem} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-sm text-destructive text-center">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-muted rounded-md mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))
          : menuItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="aspect-video bg-muted relative">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-primary">₹{item.price}</div>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Available</span>
                <Switch checked={item.available} onCheckedChange={() => toggleAvailability(item.id)} />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setEditingItem(item)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => deleteMenuItemById(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
            ))}
      </div>
    </div>
  )
}

function MenuItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: MenuItem | null
  onSave: (item: MenuItem) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<MenuItem>(
    item || {
      id: "",
      name: "",
      description: "",
      price: 0,
      category: "Breakfast",
      image: "",
      available: true,
      prepTime: 10,
      canteenId: "canteen-1",
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prepTime">Prep Time (min)</Label>
          <Input
            id="prepTime"
            type="number"
            value={formData.prepTime}
            onChange={(e) => setFormData({ ...formData, prepTime: Number(e.target.value) })}
            required
            min="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Breakfast">Breakfast</SelectItem>
            <SelectItem value="Lunch">Lunch</SelectItem>
            <SelectItem value="Dinner">Dinner</SelectItem>
            <SelectItem value="Snacks">Snacks</SelectItem>
            <SelectItem value="Beverages">Beverages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.available}
            onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
          />
          <Label>Available for ordering</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save Item
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
