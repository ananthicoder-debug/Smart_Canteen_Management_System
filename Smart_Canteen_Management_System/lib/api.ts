import type { MenuItem, Order, OrderItem } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: JsonValue
  toastOnError?: boolean
}

async function maybeToastError(message: string) {
  if (typeof window === "undefined") return

  try {
    const { toast } = await import("@/hooks/use-toast")
    toast({
      title: "Request failed",
      description: message,
      variant: "destructive",
    })
  } catch {
    // Ignore toast failures so API errors still propagate.
  }
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, toastOnError, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = response.statusText || "Request failed"
    const contentType = response.headers.get("content-type") || ""

    try {
      if (contentType.includes("application/json")) {
        const data = await response.json()
        message =
          (typeof data?.message === "string" && data.message) ||
          (typeof data?.error === "string" && data.error) ||
          message
      } else {
        const text = await response.text()
        if (text) message = text
      }
    } catch {
      // Ignore body parsing errors.
    }

    if (toastOnError !== false) {
      void maybeToastError(message)
    }

    throw new Error(message)
  }

  return response.json()
}

function normalizeMenuItem(item: any): MenuItem {
  return {
    id: item._id || item.id,
    name: item.name,
    description: item.description || "",
    price: item.price || 0,
    category: item.category || "Other",
    image: item.image || "",
    available: item.available ?? true,
    prepTime: item.prepTime ?? 10,
    canteenId: item.canteenId || "canteen-1",
    quantity: item.quantity ?? item.product?.quantity ?? 0,
  }
}

function normalizeOrderItem(item: any): OrderItem {
  return {
    menuItemId: item.menuItem || item.menuItemId || item._id,
    name: item.name || "",
    quantity: item.qty ?? item.quantity ?? 1,
    price: item.price || 0,
  }
}

function normalizeOrder(order: any): Order {
  return {
    id: order._id || order.id,
    studentId: order.student?._id || order.student || "",
    items: (order.items || []).map(normalizeOrderItem),
    total: order.total || 0,
    status: order.status || "pending",
    createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
    estimatedTime: order.estimatedTime || 15,
    canteenId: order.canteenId || "canteen-1",
  }
}

export async function login(payload: { email?: string; collegeId?: string; password: string }) {
  return apiFetch("/api/auth/login", { method: "POST", body: payload })
}

export async function register(payload: { name: string; email: string; password: string; role?: string }) {
  return apiFetch("/api/auth/register", { method: "POST", body: payload })
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const items = await apiFetch<any[]>("/api/menu")
  return items.map(normalizeMenuItem)
}

export async function createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const created = await apiFetch<any>("/api/menu", { method: "POST", body: item })
  return normalizeMenuItem(created)
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
  const updated = await apiFetch<any>(`/api/menu/${id}`, { method: "PUT", body: item })
  return normalizeMenuItem(updated)
}

export async function deleteMenuItem(id: string): Promise<void> {
  await apiFetch(`/api/menu/${id}`, { method: "DELETE" })
}

export async function createOrder(items: { menuItem: string; qty: number }[], note?: string) {
  const order = await apiFetch<any>("/api/orders", { method: "POST", body: { items, note } })
  return normalizeOrder(order)
}

export async function fetchOrders(): Promise<Order[]> {
  const orders = await apiFetch<any[]>("/api/orders")
  return orders.map(normalizeOrder)
}

export async function fetchOrder(id: string): Promise<Order> {
  const order = await apiFetch<any>(`/api/orders/${id}`)
  return normalizeOrder(order)
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const order = await apiFetch<any>(`/api/orders/${id}/status`, { method: "PUT", body: { status } })
  return normalizeOrder(order)
}

export async function fetchInventory() {
  return apiFetch<any[]>("/api/inventory")
}

export async function updateInventory(itemId: string, quantity: number) {
  return apiFetch<any>(`/api/inventory/${itemId}`, { method: "PUT", body: { quantity } })
}

export async function fetchAnalyticsOverview() {
  return apiFetch<{ totalOrders: number; revenue: number; byStatus: { _id: string; count: number }[] }>(
    "/api/analytics/overview",
  )
}
