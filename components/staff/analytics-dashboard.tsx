"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Order, MenuItem } from "@/lib/types"

export function AnalyticsDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topItems: [] as { name: string; count: number; revenue: number }[],
    dailyRevenue: [] as { date: string; revenue: number; orders: number }[],
    categoryBreakdown: [] as { category: string; revenue: number; orders: number }[],
  })

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    const storedMenu = JSON.parse(localStorage.getItem("menuItems") || "[]")

    setOrders(storedOrders)
    setMenuItems(storedMenu)

    // Calculate analytics
    const totalRevenue = storedOrders.reduce((sum: number, order: Order) => sum + order.total, 0)
    const totalOrders = storedOrders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Top selling items
    const itemCounts: Record<string, { count: number; revenue: number }> = {}
    storedOrders.forEach((order: Order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { count: 0, revenue: 0 }
        }
        itemCounts[item.name].count += item.quantity
        itemCounts[item.name].revenue += item.price * item.quantity
      })
    })

    const topItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Daily revenue (last 7 days)
    const dailyData: Record<string, { revenue: number; orders: number }> = {}
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    })

    last7Days.forEach((date) => {
      dailyData[date] = { revenue: 0, orders: 0 }
    })

    storedOrders.forEach((order: Order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (dailyData[orderDate]) {
        dailyData[orderDate].revenue += order.total
        dailyData[orderDate].orders += 1
      }
    })

    const dailyRevenue = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }))

    // Category breakdown
    const categoryData: Record<string, { revenue: number; orders: number }> = {}
    storedOrders.forEach((order: Order) => {
      order.items.forEach((item) => {
        const menuItem = storedMenu.find((m: MenuItem) => m.id === item.menuItemId || m.name === item.name)
        const category = menuItem?.category || "Other"

        if (!categoryData[category]) {
          categoryData[category] = { revenue: 0, orders: 0 }
        }
        categoryData[category].revenue += item.price * item.quantity
        categoryData[category].orders += item.quantity
      })
    })

    const categoryBreakdown = Object.entries(categoryData).map(([category, data]) => ({
      category,
      ...data,
    }))

    setAnalytics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topItems,
      dailyRevenue,
      categoryBreakdown,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Revenue"
          value={`₹${analytics.totalRevenue.toFixed(2)}`}
          trend="+12.5%"
        />
        <MetricCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Total Orders"
          value={analytics.totalOrders.toString()}
          trend="+8.2%"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Avg Order Value"
          value={`₹${analytics.avgOrderValue.toFixed(2)}`}
          trend="+3.1%"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Active Customers"
          value={Math.floor(analytics.totalOrders * 0.7).toString()}
          trend="+15.3%"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="items">Top Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
              <CardDescription>Track your daily sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                  orders: {
                    label: "Orders",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="var(--color-orders)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Most popular items by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Item Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.count} units sold</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold">₹{item.revenue}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across food categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                  orders: {
                    label: "Orders",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="orders" fill="var(--color-orders)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode
  label: string
  value: string
  trend: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-xs text-secondary font-medium">{trend}</div>
        </div>
      </CardContent>
    </Card>
  )
}
