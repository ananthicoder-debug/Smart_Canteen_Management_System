"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, History, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/hooks/use-cart"

export function StudentNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("userId")
    router.push("/")
  }

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/student/menu" className="text-xl font-bold">
            Campus Eats
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={pathname === "/student/menu" ? "default" : "ghost"}
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/student/menu">Menu</Link>
            </Button>

            <Button
              variant={pathname === "/student/orders" ? "default" : "ghost"}
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/student/orders">
                <History className="w-4 h-4 mr-2" />
                Orders
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild className="relative">
              <Link href="/student/cart">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
