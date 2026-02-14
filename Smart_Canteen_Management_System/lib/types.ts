export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
  prepTime: number // in minutes
  canteenId: string
  quantity?: number
}

export interface Order {
  id: string
  studentId: string
  items: OrderItem[]
  total: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  createdAt: Date
  estimatedTime: number
  canteenId: string
}

export interface OrderItem {
  menuItemId: string
  name: string
  quantity: number
  price: number
}

export interface Canteen {
  id: string
  name: string
  location: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface Student {
  id: string
  collegeId: string
  name: string
  email: string
}

export interface Staff {
  id: string
  email: string
  name: string
  role: "admin" | "cook" | "manager"
  canteenId: string
}
