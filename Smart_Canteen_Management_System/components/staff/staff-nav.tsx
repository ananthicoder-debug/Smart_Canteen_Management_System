"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ShoppingBag, Package, TrendingUp, LogOut, Warehouse } from "lucide-react"

export function StaffNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("staffEmail")
    router.push("/")
  }

  const navItems = [
    { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff/orders", label: "Orders", icon: ShoppingBag },
    { href: "/staff/menu", label: "Menu", icon: Package },
    { href: "/staff/inventory", label: "Inventory", icon: Warehouse },
    { href: "/staff/analytics", label: "Analytics", icon: TrendingUp },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/staff/dashboard" className="text-xl font-bold">
            Staff Dashboard
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className="hidden md:inline-flex"
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
