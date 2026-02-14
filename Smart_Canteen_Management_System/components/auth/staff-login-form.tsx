"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export function StaffLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      const message = "Email and password are required."
      setError(message)
      toast({
        title: "Missing details",
        description: message,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const user = await login({ email, password })
      localStorage.setItem("userType", "staff")
      if (user?.email) localStorage.setItem("staffEmail", user.email)
      router.push("/staff/dashboard")
    } catch (err: any) {
      const message = err?.message || "Login failed"
      setError(message)
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="staff@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-12 text-base"
        />
      </div>

      <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login to Dashboard"}
      </Button>

      {error && <p className="text-sm text-center text-destructive">{error}</p>}
    </form>
  )
}
